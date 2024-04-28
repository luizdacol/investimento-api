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
import { CreateAtivoDto } from '../dto/create-ativo.dto';
import { UpdateAtivoDto } from '../dto/update-ativo.dto';
import { Ativo } from '../entities/ativo.entity';
import { TipoAtivo } from 'src/enums/tipo-ativo.enum';

@Controller('v1/renda-fixa/ativos')
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

    if (createAtivoDto.tipo === TipoAtivo.TESOURO_DIRETO) {
      const cotacao = await this._cotacaoService.getTesouroInformation(
        createAtivoDto.codigo,
      );

      createAtivoDto.cotacao = cotacao.Pricg.untrRedVal;
      createAtivoDto.dataHoraCotacao = new Date();
    }

    return this._ativosService.create(createAtivoDto);
  }

  @Patch('/update-prices')
  async updatePrices(): Promise<boolean> {
    const ativos = await this._ativosService.findAll();

    const cotacoesPromise = ativos
      .filter((ativo) => !!ativo.codigo)
      .map((ativo) => this._cotacaoService.getTesouroInformation(ativo.codigo));
    const cotacoes = await Promise.all(cotacoesPromise);

    cotacoes.forEach((cotacao) => {
      const ativo = ativos.find(
        (ativo) => ativo.codigo === cotacao.cd.toString(),
      );
      this._ativosService.update(ativo.id, {
        cotacao: cotacao.Pricg.untrRedVal,
        dataHoraCotacao: new Date(),
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
