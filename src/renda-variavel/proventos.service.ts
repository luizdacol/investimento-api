import { Injectable } from '@nestjs/common';
import { CreateProventoDto } from '../renda-variavel/dto/create-provento.dto';
import { UpdateProventoDto } from './dto/update-provento.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Provento } from './entities/provento.entity';
import { Ativo } from './entities/ativo.entity';
import { TipoProvento } from 'src/enums/tipo-provento';
import { RendaVariavelService } from './renda-variavel.service';
import { Operacao } from './entities/operacao.entity';

@Injectable()
export class ProventosService {
  constructor(
    @InjectRepository(Provento)
    private proventosRepository: Repository<Provento>,

    @InjectRepository(Ativo)
    private ativosRepository: Repository<Ativo>,

    private operacoesService: RendaVariavelService,
  ) {}

  private calcularValorLiquido(valorBruto: number, tipo: TipoProvento): number {
    if (tipo === TipoProvento.JCP) return valorBruto * (1 - 0.15);

    return valorBruto;
  }

  private calcularPosicao(
    operacoes: Operacao[],
    ticker: string,
    dataBase: Date,
  ): number {
    const posicao = operacoes
      .filter((o) => o.ativo.ticker === ticker && o.data <= dataBase)
      .reduce(
        (posicao, operacaoAtual) => posicao + operacaoAtual.quantidade,
        0,
      );

    return posicao;
  }

  async create(createProventoDto: CreateProventoDto) {
    const ativo = await this.ativosRepository.findOneBy({
      ticker: createProventoDto.ticker,
    });
    if (!ativo) throw new Error('Ativo não encontrado');

    const valorLiquido = this.calcularValorLiquido(
      createProventoDto.valorBruto,
      createProventoDto.tipo,
    );

    const operacoes = await this.operacoesService.findAll();
    const posicao = this.calcularPosicao(
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
    provento.posicao = this.calcularPosicao(
      operacoes,
      provento.ativo.ticker,
      provento.dataCom,
    );

    provento.valorTotal = provento.valorLiquido * provento.posicao;

    const result = await this.proventosRepository.update({ id: id }, provento);
    return result.affected > 0;
  }

  async remove(id: number): Promise<boolean> {
    const result = await this.proventosRepository.delete({ id: id });
    return result.affected > 0;
  }
}
