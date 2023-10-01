import { Module } from '@nestjs/common';
import { RendaVariavelService } from './renda-variavel.service';
import { RendaVariavelController } from './renda-variavel.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ativo } from './entities/ativo.entity';
import { Operacao } from './entities/operacao.entity';
import { ProventosController } from './proventos.controller';
import { ProventosService } from './proventos.service';
import { Provento } from './entities/provento.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Ativo, Operacao, Provento])],
  controllers: [RendaVariavelController, ProventosController],
  providers: [RendaVariavelService, ProventosService],
})
export class RendaVariavelModule {}
