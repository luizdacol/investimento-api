import { Module } from '@nestjs/common';
import { OperacoesService } from './operacoes.service';
import { OperacoesController } from './operacoes.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ativo } from './entities/ativo.entity';
import { Operacao } from './entities/operacao.entity';
import { AtivosService } from 'src/renda-fixa/ativos.service';
import { AtivosController } from './ativos.controller';
import { CotacaoModule } from 'src/cotacao/cotacao.module';

@Module({
  imports: [TypeOrmModule.forFeature([Ativo, Operacao]), CotacaoModule],
  controllers: [OperacoesController, AtivosController],
  providers: [OperacoesService, AtivosService],
  exports: [OperacoesService, AtivosService],
})
export class RendaFixaModule {}
