import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  UseInterceptors,
} from '@nestjs/common';
import { CarteiraService } from './carteira.service';
import { CarteiraRendaVariavelDto } from './dto/carteira-renda-variavel.dto';
import { CarteiraRendaFixaDto } from './dto/carteira-renda-fixa.dto';

@Controller('v1/carteira')
export class CarteiraController {
  constructor(private readonly carteiraService: CarteiraService) {}

  @UseInterceptors(ClassSerializerInterceptor)
  @Get()
  async getCarteira(): Promise<
    (CarteiraRendaVariavelDto | CarteiraRendaFixaDto)[]
  > {
    return await this.carteiraService.calculateCarteira();
  }
}
