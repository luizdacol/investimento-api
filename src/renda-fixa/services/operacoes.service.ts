import { Injectable } from '@nestjs/common';
import { Operacao } from '../entities/operacao.entity';
import { AtivosService } from './ativos.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, FindOptionsOrder } from 'typeorm';
import { CreateOperacaoDto } from '../dto/create-operacao.dto';
import { UpdateOperacaoDto } from '../dto/update-operacao.dto';
import { TipoOperacao } from 'src/enums/tipo-operacao.enum';

@Injectable()
export class OperacoesService {
  constructor(
    @InjectRepository(Operacao)
    private operacoesRepository: Repository<Operacao>,
    private _ativosService: AtivosService,
  ) {}

  async create(createOperacaoDto: CreateOperacaoDto) {
    const ativo = await this._ativosService.findByTitulo(
      createOperacaoDto.titulo,
    );
    if (!ativo) throw Error('Ativo não encontrado');

    const operacaoSaved = this.operacoesRepository.save({
      data: createOperacaoDto.data,
      precoTotal:
        createOperacaoDto.precoUnitario * createOperacaoDto.quantidade,
      precoUnitario: createOperacaoDto.precoUnitario,
      quantidade: createOperacaoDto.quantidade,
      tipo: createOperacaoDto.tipoOperacao,
      rentabilidade: createOperacaoDto.rentabilidade,
      dataVencimento: createOperacaoDto.dataVencimento,
      ativo,
    });

    return operacaoSaved;
  }

  async findAll(
    filters: FindOptionsWhere<Operacao> = {},
    orderby: FindOptionsOrder<Operacao> = null,
  ) {
    const operacoes = await this.operacoesRepository.find({
      where: filters,
      relations: { ativo: true },
      order: orderby || { data: 'ASC' },
    });
    return operacoes;
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
    if (updateAtivoDto.quantidade)
      operacao.quantidade = updateAtivoDto.quantidade;
    if (updateAtivoDto.precoUnitario)
      operacao.precoUnitario = updateAtivoDto.precoUnitario;
    if (updateAtivoDto.rentabilidade)
      operacao.rentabilidade = updateAtivoDto.rentabilidade;
    if (updateAtivoDto.dataVencimento)
      operacao.dataVencimento = updateAtivoDto.dataVencimento;
    if (updateAtivoDto.tipoOperacao)
      operacao.tipo = updateAtivoDto.tipoOperacao;

    operacao.precoTotal = operacao.precoUnitario * operacao.quantidade;

    const result = await this.operacoesRepository.update({ id: id }, operacao);
    return result.affected > 0;
  }

  async remove(id: number): Promise<boolean> {
    const result = await this.operacoesRepository.delete({ id: id });
    return result.affected > 0;
  }

  public calcularPosicao(
    operacoes: Operacao[],
    titulo: string,
    dataBase: Date = new Date(),
  ): number {
    const posicao = operacoes
      .filter((o) => this.filtroPorTituloEData(o, titulo, dataBase))
      .reduce((posicao, operacaoAtual) => {
        if (operacaoAtual.tipo === TipoOperacao.COMPRA)
          return posicao + operacaoAtual.quantidade;
        else if (operacaoAtual.tipo === TipoOperacao.VENDA)
          return posicao - operacaoAtual.quantidade;
      }, 0);

    return posicao;
  }

  public calcularValorTotal(
    operacoes: Operacao[],
    titulo: string,
    dataBase: Date = new Date(),
  ): number {
    const valorTotal = operacoes
      .filter((o) => this.filtroPorTituloEData(o, titulo, dataBase))
      .reduce((valorTotal, operacaoAtual) => {
        if (operacaoAtual.tipo === TipoOperacao.COMPRA)
          return valorTotal + operacaoAtual.precoTotal;
        else if (operacaoAtual.tipo === TipoOperacao.VENDA)
          return valorTotal - operacaoAtual.precoTotal;
      }, 0);

    return valorTotal;
  }

  private filtroPorTituloEData(o: Operacao, titulo: string, dataBase: Date) {
    return o.ativo.titulo === titulo && o.data <= dataBase;
  }
}
