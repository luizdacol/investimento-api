import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Operacao } from './entities/operacao.entity';
import { AtivosController } from './controllers/ativos.controller';
import { Ativo } from './entities/ativo.entity';
import { AtivosService } from './services/ativos.service';
import { CotacaoModule } from '../cotacao/cotacao.module';
import { OperacoesController } from './controllers/operacoes.controller';
import { OperacoesService } from './services/operacoes.service';

@Module({
  imports: [TypeOrmModule.forFeature([Ativo, Operacao]), CotacaoModule],
  controllers: [AtivosController, OperacoesController],
  providers: [AtivosService, OperacoesService],
  exports: [AtivosService, OperacoesService],
})
export class CriptomoedasModule {}
