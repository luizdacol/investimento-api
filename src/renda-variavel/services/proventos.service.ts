import { Injectable } from '@nestjs/common';
import { CreateProventoDto } from '../dto/create-provento.dto';
import { UpdateProventoDto } from '../dto/update-provento.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { Provento } from '../entities/provento.entity';
import { Ativo } from '../entities/ativo.entity';
import { TipoProvento } from 'src/enums/tipo-provento';
import { OperacoesService } from './operacoes.service';
import { AtivosService } from './ativos.service';

@Injectable()
export class ProventosService {
  constructor(
    @InjectRepository(Provento)
    private proventosRepository: Repository<Provento>,

    @InjectRepository(Ativo)
    private ativosRepository: Repository<Ativo>,

    private operacoesService: OperacoesService,
    private _ativosService: AtivosService,
  ) {}

  private calcularValorLiquido(valorBruto: number, tipo: TipoProvento): number {
    if (tipo === TipoProvento.JCP) return valorBruto * (1 - 0.15);

    return valorBruto;
  }

  async create(createProventoDto: CreateProventoDto) {
    const ativo = await this._ativosService.findByTicker(
      createProventoDto.ticker,
    );
    if (!ativo) throw Error('Ativo não encontrado');

    const valorLiquido = this.calcularValorLiquido(
      createProventoDto.valorBruto,
      createProventoDto.tipo,
    );

    const operacoes = await this.operacoesService.findAll();
    const { posicao } = this.operacoesService.calcularResumoOperacoes(
      operacoes,
      createProventoDto.ticker,
      createProventoDto.dataCom,
    );

    const proventoSaved = await this.proventosRepository.save({
      dataCom: createProventoDto.dataCom,
      dataPagamento: createProventoDto.dataPagamento,
      ativo,
      valorBruto: createProventoDto.valorBruto,
      tipo: createProventoDto.tipo,
      valorLiquido,
      posicao,
      valorTotal: valorLiquido * posicao,
    });

    return proventoSaved;
  }

  async findAll(): Promise<Provento[]> {
    const proventos = await this.proventosRepository.find({
      relations: { ativo: true },
      order: { dataPagamento: 'DESC' },
    });
    return proventos;
  }

  async findWithFilters(
    filters: FindOptionsWhere<Provento>,
  ): Promise<Provento[]> {
    const proventos = await this.proventosRepository.find({
      relations: { ativo: true },
      where: filters,
      order: { dataPagamento: 'DESC' },
    });
    return proventos;
  }

  async findOne(id: number): Promise<Provento> {
    return await this.proventosRepository.findOne({
      where: { id: id },
      relations: { ativo: true },
    });
  }

  async update(id: number, updateProventoDto: UpdateProventoDto) {
    const provento = await this.findOne(id);
    if (!provento) throw Error('Provento não encontrada');

    if (updateProventoDto.dataCom) provento.dataCom = updateProventoDto.dataCom;
    if (updateProventoDto.dataPagamento)
      provento.dataPagamento = updateProventoDto.dataPagamento;
    if (updateProventoDto.valorBruto)
      provento.valorBruto = updateProventoDto.valorBruto;
    if (updateProventoDto.tipo) provento.tipo = updateProventoDto.tipo;

    provento.valorLiquido = this.calcularValorLiquido(
      provento.valorBruto,
      provento.tipo,
    );

    const operacoes = await this.operacoesService.findAll();
    const { posicao } = this.operacoesService.calcularResumoOperacoes(
      operacoes,
      provento.ativo.ticker,
      provento.dataCom,
    );

    provento.posicao = posicao;
    provento.valorTotal = provento.valorLiquido * provento.posicao;

    const result = await this.proventosRepository.update({ id: id }, provento);
    return result.affected > 0;
  }

  async remove(id: number): Promise<boolean> {
    const result = await this.proventosRepository.delete({ id: id });
    return result.affected > 0;
  }

  calcularResumoProventos(
    proventos: Provento[],
    ticker: string,
    dataBase: Date = new Date(),
  ): {
    proventosPorAcao: number;
    proventosRecebidos: number;
    proventosProvisionados: number;
  } {
    const proventosDoAtivo = proventos.filter((p) => p.ativo.ticker === ticker);

    return proventosDoAtivo.reduce(
      (proventoResumido, proventoAtual) => {
        if (proventoAtual.dataPagamento > dataBase) {
          proventoResumido.proventosProvisionados += proventoAtual.valorTotal;
        } else {
          proventoResumido.proventosRecebidos += proventoAtual.valorTotal;
          proventoResumido.proventosPorAcao += proventoAtual.valorLiquido;
        }
        return proventoResumido;
      },
      {
        proventosPorAcao: 0,
        proventosRecebidos: 0,
        proventosProvisionados: 0,
      },
    );
  }
}