import { Module } from '@nestjs/common';
import { OperacoesService } from './services/operacoes.service';
import { OperacoesController } from './controllers/operacoes.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ativo } from './entities/ativo.entity';
import { Operacao } from './entities/operacao.entity';
import { AtivosService } from 'src/renda-fixa/services/ativos.service';
import { AtivosController } from './controllers/ativos.controller';
import { CotacaoModule } from 'src/cotacao/cotacao.module';

@Module({
  imports: [TypeOrmModule.forFeature([Ativo, Operacao]), CotacaoModule],
  controllers: [OperacoesController, AtivosController],
  providers: [OperacoesService, AtivosService],
  exports: [OperacoesService, AtivosService],
})
export class RendaFixaModule {}
