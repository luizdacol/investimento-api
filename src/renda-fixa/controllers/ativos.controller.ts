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
import { CotacaoService } from '../../cotacao/cotacao.service';
import { CreateAtivoDto } from '../dto/create-ativo.dto';
import { UpdateAtivoDto } from '../dto/update-ativo.dto';
import { Ativo } from '../entities/ativo.entity';

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

    return this._ativosService.create(createAtivoDto);
  }

  @Patch('/update-prices')
  async updatePrices(): Promise<boolean> {
    const ativos = await this._ativosService.findAll();

    const cotacoes = await this._cotacaoService.getTesouroInformation();

    ativos.forEach((ativo) => {
      const cotacao = cotacoes.find(
        (cotacao) => cotacao.TrsrBd.nm === ativo.titulo,
      );
      if (cotacao) {
        this._ativosService.update(ativo.id, {
          cotacao: cotacao.TrsrBd.untrRedVal,
          dataHoraCotacao: new Date(),
        });
      }
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
