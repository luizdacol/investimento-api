import { Module } from '@nestjs/common';
import { RendaVariavelService } from './renda-variavel.service';
import { RendaVariavelController } from './renda-variavel.controller';

@Module({
  controllers: [RendaVariavelController],
  providers: [RendaVariavelService],
})
export class RendaVariavelModule {}
