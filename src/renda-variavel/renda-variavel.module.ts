import { Module } from '@nestjs/common';
import { OperacoesService } from './services/operacoes.service';
import { OperacoesController } from './controllers/operacoes.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ativo } from './entities/ativo.entity';
import { Operacao } from './entities/operacao.entity';
import { ProventosController } from './controllers/proventos.controller';
import { ProventosService } from './services/proventos.service';
import { Provento } from './entities/provento.entity';
import { AtivosService } from './services/ativos.service';
import { CotacaoModule } from '../cotacao/cotacao.module';
import { AtivosController } from './controllers/ativos.controller';
import { GraficosController } from './controllers/graficos.controller';
import { LucrosPrejuizos } from './entities/lucros-prejuizos.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Ativo, Operacao, Provento, LucrosPrejuizos]),
    CotacaoModule,
  ],
  controllers: [
    OperacoesController,
    ProventosController,
    AtivosController,
    GraficosController,
  ],
  providers: [OperacoesService, ProventosService, AtivosService],
  exports: [OperacoesService, AtivosService, ProventosService],
})
export class RendaVariavelModule {}
