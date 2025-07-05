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
import { CarteiraCriptomoedaDto } from '../dto/carteira-criptomoeda.dto';

@Controller('v1/carteira')
export class CarteiraController {
  constructor(private readonly carteiraService: CarteiraService) {}

  @UseInterceptors(ClassSerializerInterceptor)
  @Get()
  async getCarteira(
    @Query('dataDeCorte') dataDeCorte?: string,
  ): Promise<
    (CarteiraRendaVariavelDto | CarteiraRendaFixaDto | CarteiraCriptomoedaDto)[]
  > {
    const carteira = await this.carteiraService.calculateCarteira(
      dataDeCorte ? new Date(dataDeCorte) : new Date(),
    );

    return carteira.sort((a, b) => {
      const nameA = this.resolveSortName(a);
      const nameB = this.resolveSortName(b);
      return nameA.toUpperCase().localeCompare(nameB);
    });
  }

  resolveSortName(
    obj:
      | CarteiraRendaVariavelDto
      | CarteiraRendaFixaDto
      | CarteiraCriptomoedaDto,
  ) {
    if (obj instanceof CarteiraRendaVariavelDto) {
      return obj.ticker;
    } else if (obj instanceof CarteiraRendaFixaDto) {
      return obj.titulo;
    } else {
      return obj.codigo;
    }
  }
}
