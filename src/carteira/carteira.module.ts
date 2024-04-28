import { Module } from '@nestjs/common';
import { CarteiraService } from './services/carteira.service';
import { CarteiraController } from './controllers/carteira.controller';
import { RendaVariavelModule } from 'src/renda-variavel/renda-variavel.module';
import { RendaFixaModule } from 'src/renda-fixa/renda-fixa.module';
import { GraficosController } from './controllers/graficos.controller';

@Module({
  imports: [RendaVariavelModule, RendaFixaModule],
  controllers: [CarteiraController, GraficosController],
  providers: [CarteiraService],
})
export class CarteiraModule {}
