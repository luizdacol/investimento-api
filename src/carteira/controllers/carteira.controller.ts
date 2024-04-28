import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { CarteiraService } from '../services/carteira.service';
import { CarteiraRendaVariavelDto } from '../dto/carteira-renda-variavel.dto';
import { CarteiraRendaFixaDto } from '../dto/carteira-renda-fixa.dto';

@Controller('v1/carteira')
export class CarteiraController {
  constructor(private readonly carteiraService: CarteiraService) {}

  @UseInterceptors(ClassSerializerInterceptor)
  @Get()
  async getCarteira(
    @Query('dataDeCorte') dataDeCorte?: string,
  ): Promise<(CarteiraRendaVariavelDto | CarteiraRendaFixaDto)[]> {
    const carteira = await this.carteiraService.calculateCarteira(
      dataDeCorte ? new Date(dataDeCorte) : new Date(),
    );

    return carteira.sort((a, b) => {
      const nameA = a instanceof CarteiraRendaVariavelDto ? a.ticker : a.titulo;
      const nameB = b instanceof CarteiraRendaVariavelDto ? b.ticker : b.titulo;
      return nameA.toUpperCase().localeCompare(nameB);
    });
  }
}
