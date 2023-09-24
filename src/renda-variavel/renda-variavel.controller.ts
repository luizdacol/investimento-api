import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { RendaVariavelService } from './renda-variavel.service';
import { CreateOperacaoDto } from './dto/create-operacao.dto';
import { UpdateOperacaoDto } from './dto/update-operacao.dto';

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

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.rendaVariavelService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateRendaVariavelDto: UpdateOperacaoDto,
  ) {
    return this.rendaVariavelService.update(+id, updateRendaVariavelDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.rendaVariavelService.remove(+id);
  }
}
