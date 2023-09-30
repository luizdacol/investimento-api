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
import { RendaVariavelService } from './renda-variavel.service';
import { CreateOperacaoDto } from './dto/create-operacao.dto';
import { UpdateOperacaoDto } from './dto/update-operacao.dto';
import { Operacao } from './entities/operacao.entity';

@Controller('v1/renda-variavel')
export class RendaVariavelController {
  constructor(private readonly rendaVariavelService: RendaVariavelService) {}

  @Post('operacoes')
  create(@Body() createRendaVariavelDto: CreateOperacaoDto) {
    console.log('[POST][Operacoes] Incoming request: ', createRendaVariavelDto);
    return this.rendaVariavelService.create(createRendaVariavelDto);
  }

  @Get('operacoes')
  findAll() {
    return this.rendaVariavelService.findAll();
  }

  @Get('operacoes/:id')
  async findOne(@Param('id') id: string): Promise<Operacao> {
    return this.rendaVariavelService.findOne(+id);
  }

  @Patch('operacoes/:id')
  async update(
    @Param('id') id: string,
    @Body() updateRendaVariavelDto: UpdateOperacaoDto,
  ): Promise<boolean> {
    return this.rendaVariavelService.update(+id, updateRendaVariavelDto);
  }

  @Delete('operacoes/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<boolean> {
    return await this.rendaVariavelService.remove(+id);
  }
}
