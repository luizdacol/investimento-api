import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { AtivosService } from '../services/ativos.service';
import { CotacaoService } from 'src/cotacao/cotacao.service';
import { Ativo } from '../entities/ativo.entity';
import { CreateAtivoDto } from '../dto/create-ativo.dto';
import { UpdateAtivoDto } from '../dto/update-ativo.dto';

@Controller('v1/renda-variavel/ativos')
export class AtivosController {
  constructor(
    private readonly _ativosService: AtivosService,
    private _cotacaoService: CotacaoService,
  ) {}

  @Get()
  async findAll(): Promise<Ativo[]> {
    return await this._ativosService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Ativo> {
    return this._ativosService.findOne(+id);
  }

  @Post()
  async create(@Body() createAtivoDto: CreateAtivoDto) {
    console.log('[POST][Ativos] Incoming request: ', createAtivoDto);

    const cotacao = await this._cotacaoService.getQuoteInformation(
      createAtivoDto.ticker,
    );

    createAtivoDto.cotacao = cotacao.regularMarketPrice;
    createAtivoDto.dataHoraCotacao = new Date(cotacao.regularMarketTime);

    return this._ativosService.create(createAtivoDto);
  }

  @Patch('/update-prices')
  async updatePrices(): Promise<boolean> {
    const ativos = await this._ativosService.findAll();

    const cotacoesPromise = ativos.map((ativo) =>
      this._cotacaoService.getQuoteInformation(ativo.ticker),
    );
    const cotacoes = await Promise.all(cotacoesPromise);

    cotacoes.forEach((cotacao) => {
      const ativo = ativos.find((ativo) => ativo.ticker === cotacao.symbol);
      this._ativosService.update(ativo.id, {
        cotacao: cotacao.regularMarketPrice,
        dataHoraCotacao: new Date(cotacao.regularMarketTime),
      });
    });

    return true;
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateAtivoDto: UpdateAtivoDto,
  ): Promise<boolean> {
    console.log('[PATCH][Ativos] Incoming request: ', updateAtivoDto);
    return this._ativosService.update(+id, updateAtivoDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<boolean> {
    return await this._ativosService.remove(+id);
  }
}
