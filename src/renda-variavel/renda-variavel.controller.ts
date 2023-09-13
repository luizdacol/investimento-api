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
import { CreateAtivoDto } from './dto/create-ativo.dto';
import { UpdateAtivoDto } from './dto/update-ativo.dto';

@Controller('v1/renda-variavel')
export class RendaVariavelController {
  constructor(private readonly rendaVariavelService: RendaVariavelService) {}

  @Post('ativos')
  create(@Body() createRendaVariavelDto: CreateAtivoDto) {
    return this.rendaVariavelService.create(createRendaVariavelDto);
  }

  @Get('ativos')
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
    @Body() updateRendaVariavelDto: UpdateAtivoDto,
  ) {
    return this.rendaVariavelService.update(+id, updateRendaVariavelDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.rendaVariavelService.remove(+id);
  }
}
