import { Module } from '@nestjs/common';
import { CarteiraService } from './carteira.service';
import { CarteiraController } from './carteira.controller';
import { RendaVariavelModule } from 'src/renda-variavel/renda-variavel.module';

@Module({
  imports: [RendaVariavelModule],
  controllers: [CarteiraController],
  providers: [CarteiraService],
})
export class CarteiraModule {}
