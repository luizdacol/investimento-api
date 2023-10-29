import { Module } from '@nestjs/common';
import { CarteiraService } from './carteira.service';
import { CarteiraController } from './carteira.controller';
import { RendaVariavelModule } from 'src/renda-variavel/renda-variavel.module';
import { RendaFixaModule } from 'src/renda-fixa/renda-fixa.module';

@Module({
  imports: [RendaVariavelModule, RendaFixaModule],
  controllers: [CarteiraController],
  providers: [CarteiraService],
})
export class CarteiraModule {}
