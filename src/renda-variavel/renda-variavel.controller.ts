import { Body, Controller, Get, Post } from '@nestjs/common';
import { RendaVariavelService } from './renda-variavel.service';
import { Ativo } from './models/ativo';
import { CreateAtivoDto } from './models/create-ativo.dto';

@Controller('renda-variavel')
export class RendaVariavelController {
  constructor(private readonly rendaVariavelService: RendaVariavelService) {}

  @Get('/ativos')
  getAtivos(): Ativo[] {
    return this.rendaVariavelService.getAtivos();
  }

  @Post('/ativos')
  postAtivo(@Body() createAtivoDto: CreateAtivoDto): Ativo {
    return this.rendaVariavelService.saveAtivo(createAtivoDto);
  }
}
