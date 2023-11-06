import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { CarteiraService } from './carteira.service';
import { TipoAtivo } from 'src/enums/tipo-ativo.enum';
import { CarteiraRendaVariavelDto } from './dto/carteira-renda-variavel.dto';
import { CarteiraRendaFixaDto } from './dto/carteira-renda-fixa.dto';

@Controller('v1/carteira')
export class CarteiraController {
  constructor(private readonly carteiraService: CarteiraService) {}

  @UseInterceptors(ClassSerializerInterceptor)
  @Get('renda-variavel')
  async getCarteiraRendaVariavel(
    @Query('tipo') tipo: TipoAtivo,
  ): Promise<CarteiraRendaVariavelDto[]> {
    const carteira =
      await this.carteiraService.calculateCarteiraRendaVariavel(tipo);

    return Array.from(carteira.values());
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Get('renda-fixa')
  async getCarteiraRendaFixa(
    @Query('tipo') tipo: TipoAtivo,
  ): Promise<CarteiraRendaFixaDto[]> {
    const carteira =
      await this.carteiraService.calculateCarteiraRendaFixa(tipo);

    return Array.from(carteira.values());
  }
}
