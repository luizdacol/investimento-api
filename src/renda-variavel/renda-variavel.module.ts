import { Module } from '@nestjs/common';
import { RendaVariavelService } from './renda-variavel.service';
import { RendaVariavelController } from './renda-variavel.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ativo } from './entities/ativo.entity';
import { Operacao } from './entities/operacao.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Ativo, Operacao])],
  controllers: [RendaVariavelController],
  providers: [RendaVariavelService],
})
export class RendaVariavelModule {}
