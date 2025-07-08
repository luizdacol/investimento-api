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
import { Ativo } from '../entities/ativo.entity';
import { AtivosService } from '../services/ativos.service';
import { CreateAtivoDto } from '../dto/create-ativo.dto';
import { CotacaoService } from '../../cotacao/cotacao.service';
import { UpdateAtivoDto } from '../dto/update-ativo.dto';

@Controller('v1/criptomoedas/ativos')
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

    const cotacao = await this._cotacaoService.getCriptoInformation();

    if (cotacao) {
      createAtivoDto.cotacao = cotacao.last;
      createAtivoDto.dataHoraCotacao = new Date(cotacao.time);
    }

    return this._ativosService.create(createAtivoDto);
  }

  @Patch('/update-prices')
  async updatePrices(): Promise<boolean> {
    const ativos = await this._ativosService.findAll();
    const cotacao = await this._cotacaoService.getCriptoInformation();

    if (cotacao) {
      const ativo = ativos.find((ativo) => ativo.codigo === 'BTC');
      this._ativosService.update(ativo.id, {
        cotacao: cotacao.last,
        dataHoraCotacao: new Date(cotacao.time),
      });
    }

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
