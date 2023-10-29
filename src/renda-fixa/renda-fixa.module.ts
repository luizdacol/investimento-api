import { Module } from '@nestjs/common';
import { OperacoesService } from './operacoes.service';
import { OperacoesController } from './operacoes.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ativo } from './entities/ativo.entity';
import { Operacao } from './entities/operacao.entity';
import { AtivosService } from 'src/renda-fixa/ativos.service';

@Module({
  imports: [TypeOrmModule.forFeature([Ativo, Operacao])],
  controllers: [OperacoesController],
  providers: [OperacoesService, AtivosService],
})
export class RendaFixaModule {}
