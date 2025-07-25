import { Module } from '@nestjs/common';
import { CarteiraService } from './services/carteira.service';
import { CarteiraController } from './controllers/carteira.controller';
import { RendaFixaModule } from '../renda-fixa/renda-fixa.module';
import { GraficosController } from './controllers/graficos.controller';
import { RendaVariavelModule } from '../renda-variavel/renda-variavel.module';
import { CriptomoedasModule } from '../criptomoedas/criptomoedas.module';

@Module({
  imports: [RendaVariavelModule, RendaFixaModule, CriptomoedasModule],
  controllers: [CarteiraController, GraficosController],
  providers: [CarteiraService],
})
export class CarteiraModule {}
