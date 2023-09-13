import { Controller, Get } from '@nestjs/common';
import { RendaVariavelService } from './renda-variavel.service';
import { Ativo } from './ativo';

@Controller('renda-variavel')
export class RendaVariavelController {
  constructor(private readonly rendaVariavelService: RendaVariavelService) {}

  @Get('/ativos')
  getAtivos(): Ativo[] {
    return this.rendaVariavelService.getAtivos();
  }
}
