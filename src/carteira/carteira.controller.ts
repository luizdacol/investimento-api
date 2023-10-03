import { Controller, Get, Query } from '@nestjs/common';
import { CarteiraService } from './carteira.service';
import { TipoAtivo } from 'src/enums/tipo-ativo.enum';
import { CarteiraRendaVariavelDto } from './dto/carteira-renda-variavel.dto';

@Controller('v1/carteira')
export class CarteiraController {
  constructor(private readonly carteiraService: CarteiraService) {}

  @Get('renda-variavel')
  async findAll(
    @Query('tipo') tipo: TipoAtivo,
  ): Promise<CarteiraRendaVariavelDto[]> {
    const carteira =
      await this.carteiraService.calculateCarteiraRendaVariavel(tipo);

    return Array.from(carteira.values());
  }
}
