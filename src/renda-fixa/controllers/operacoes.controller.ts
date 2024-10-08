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
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { OperacoesService } from '../services/operacoes.service';
import { CreateOperacaoDto } from '../dto/create-operacao.dto';
import { UpdateOperacaoDto } from '../dto/update-operacao.dto';
import { ResponseOperacao } from '../dto/response-operacao.dto';

@Controller('v1/renda-fixa/operacoes')
@UseInterceptors(ClassSerializerInterceptor)
export class OperacoesController {
  constructor(private readonly rendaFixaService: OperacoesService) {}

  @Post()
  create(@Body() createRendaVariavelDto: CreateOperacaoDto) {
    console.log('[POST][Operacoes] Incoming request: ', createRendaVariavelDto);
    return this.rendaFixaService.create(createRendaVariavelDto);
  }

  @Get()
  async findAll(): Promise<ResponseOperacao[]> {
    const operacoes = await this.rendaFixaService.findAll(undefined, {
      data: 'DESC',
    });
    return operacoes.map((op) => ResponseOperacao.fromDomain(op));
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ResponseOperacao> {
    const operacao = await this.rendaFixaService.findOne(+id);
    return ResponseOperacao.fromDomain(operacao);
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
