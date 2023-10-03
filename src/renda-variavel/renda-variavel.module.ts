import { Module } from '@nestjs/common';
import { OperacoesService } from './operacoes.service';
import { OperacoesController } from './operacoes.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ativo } from './entities/ativo.entity';
import { Operacao } from './entities/operacao.entity';
import { ProventosController } from './proventos.controller';
import { ProventosService } from './proventos.service';
import { Provento } from './entities/provento.entity';
import { AtivosService } from './ativos.service';

@Module({
  imports: [TypeOrmModule.forFeature([Ativo, Operacao, Provento])],
  controllers: [OperacoesController, ProventosController],
  providers: [OperacoesService, ProventosService, AtivosService],
  exports: [OperacoesService, AtivosService],
})
export class RendaVariavelModule {}
