import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { OperacoesService } from './operacoes.service';
import { Operacao } from './entities/operacao.entity';
import { CreateOperacaoDto } from './dto/create-operacao.dto';
import { UpdateOperacaoDto } from './dto/update-operacao.dto';

@Controller('v1/renda-fixa/operacoes')
export class OperacoesController {
  constructor(private readonly rendaFixaService: OperacoesService) {}

  @Post()
  create(@Body() createRendaVariavelDto: CreateOperacaoDto) {
    console.log('[POST][Operacoes] Incoming request: ', createRendaVariavelDto);
    return this.rendaFixaService.create(createRendaVariavelDto);
  }

  @Get()
  findAll() {
    return this.rendaFixaService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Operacao> {
    return this.rendaFixaService.findOne(+id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateRendaVariavelDto: UpdateOperacaoDto,
  ): Promise<boolean> {
    return this.rendaFixaService.update(+id, updateRendaVariavelDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<boolean> {
    return await this.rendaFixaService.remove(+id);
  }
}
