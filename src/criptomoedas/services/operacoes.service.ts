import { Injectable } from '@nestjs/common';
import { UpdateOperacaoDto } from '../dto/update-operacao.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsOrder, FindOptionsWhere, Repository } from 'typeorm';
import { Operacao } from '../entities/operacao.entity';
import { AtivosService } from './ativos.service';
import { CreateOperacaoDto } from '../dto/create-operacao.dto';
import { PaginatedDto } from '../dto/paginated.dto';
import { TipoOperacao } from '../../enums/tipo-operacao.enum';

@Injectable()
export class OperacoesService {
  constructor(
    @InjectRepository(Operacao)
    private operacoesRepository: Repository<Operacao>,
    private _ativosService: AtivosService,
  ) {}

  async create(createOperacaoDto: CreateOperacaoDto) {
    const ativo = await this._ativosService.findByCodigo(
      createOperacaoDto.codigo,
    );
    if (!ativo) throw Error('Ativo não encontrado');

    const valorTaxa =
      createOperacaoDto.valorTotalBruto * createOperacaoDto.taxa;
    const valorTotalLiquido = createOperacaoDto.valorTotalBruto - valorTaxa;
    const quantidade = Number(
      (valorTotalLiquido / createOperacaoDto.precoUnitario).toFixed(8),
    );

    console.log(valorTotalLiquido / createOperacaoDto.precoUnitario);
    console.log(quantidade);

    const operacaoSaved = this.operacoesRepository.save({
      data: createOperacaoDto.data,
      valorTotalBruto: createOperacaoDto.valorTotalBruto,
      precoUnitario: createOperacaoDto.precoUnitario,
      valorTotalLiquido: valorTotalLiquido,
      quantidade: quantidade,
      taxa: createOperacaoDto.taxa,
      tipo: createOperacaoDto.tipoOperacao,
      ativo,
    });

    return operacaoSaved;
  }

  async findAll(
    filters: FindOptionsWhere<Operacao> = {},
    orderby: FindOptionsOrder<Operacao> = null,
    skip: number = 0,
    take: number = null,
  ): Promise<PaginatedDto<Operacao>> {
    const [operacoes, totalRecords] =
      await this.operacoesRepository.findAndCount({
        skip: skip,
        take: take,
        where: filters,
        relations: { ativo: true },
        order: orderby || { data: 'ASC' },
      });

    return new PaginatedDto<Operacao>(operacoes, totalRecords, skip, take);
  }

  async findOne(id: number): Promise<Operacao> {
    return await this.operacoesRepository.findOne({
      where: { id: id },
      relations: { ativo: true },
    });
  }

  async update(
    id: number,
    updateAtivoDto: UpdateOperacaoDto,
  ): Promise<boolean> {
    const operacao = await this.findOne(id);
    if (!operacao) throw Error('Operação não encontrada');

    if (updateAtivoDto.data) operacao.data = updateAtivoDto.data;
    if (updateAtivoDto.taxa) operacao.taxa = updateAtivoDto.taxa;
    if (updateAtivoDto.precoUnitario)
      operacao.precoUnitario = updateAtivoDto.precoUnitario;
    if (updateAtivoDto.tipoOperacao)
      operacao.tipo = updateAtivoDto.tipoOperacao;
    if (updateAtivoDto.valorTotalBruto)
      operacao.valorTotalBruto = updateAtivoDto.valorTotalBruto;

    const valorTaxa = operacao.valorTotalBruto * operacao.taxa;
    operacao.valorTotalLiquido = operacao.valorTotalBruto - valorTaxa;
    operacao.quantidade = Number(
      (operacao.valorTotalLiquido / operacao.precoUnitario).toFixed(8),
    );

    const result = await this.operacoesRepository.update({ id: id }, operacao);
    return result.affected > 0;
  }

  async remove(id: number): Promise<boolean> {
    const result = await this.operacoesRepository.delete({ id: id });
    return result.affected > 0;
  }

  public calcularResumoOperacoes(
    operacoes: Operacao[],
    codigo: string,
    dataBase: Date = new Date(),
  ): {
    precoMedio: number;
    valorTotalLiquido: number;
    posicao: number;
  } {
    const operacoesDoAtivo = operacoes.filter((o) =>
      this.filtroPorTickerEData(o, codigo, dataBase),
    );

    return operacoesDoAtivo.reduce(
      (operacaoResumida, operacaoAtual) => {
        if (operacaoAtual.tipo === TipoOperacao.COMPRA) {
          operacaoResumida.posicao += operacaoAtual.quantidade;

          operacaoResumida.valorTotalLiquido += operacaoAtual.valorTotalLiquido;
          operacaoResumida.precoMedio =
            operacaoResumida.valorTotalLiquido / operacaoResumida.posicao;
        } else if (operacaoAtual.tipo === TipoOperacao.VENDA) {
          operacaoResumida.posicao -= operacaoAtual.quantidade;
          operacaoResumida.valorTotalLiquido =
            operacaoResumida.posicao * operacaoResumida.precoMedio;
        }

        return operacaoResumida;
      },
      {
        valorTotalLiquido: 0,
        precoMedio: 0,
        posicao: 0,
      },
    );
  }

  private filtroPorTickerEData(o: Operacao, codigo: string, dataBase: Date) {
    return o.ativo.codigo === codigo && o.data <= dataBase;
  }
}
