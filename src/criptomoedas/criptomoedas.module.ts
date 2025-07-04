import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Operacao } from './entities/operacao.entity';
import { AtivosController } from './controllers/ativos.controller';
import { Ativo } from './entities/ativo.entity';
import { AtivosService } from './services/ativos.service';
import { CotacaoModule } from '../cotacao/cotacao.module';

@Module({
  imports: [TypeOrmModule.forFeature([Ativo, Operacao]), CotacaoModule],
  controllers: [AtivosController],
  providers: [AtivosService],
  exports: [AtivosService],
})
export class CriptomoedasModule {}
