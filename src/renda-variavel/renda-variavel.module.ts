import { Module } from '@nestjs/common';
import { RendaVariavelController } from './renda-variavel.controller';
import { RendaVariavelService } from './renda-variavel.service';

@Module({
  controllers: [RendaVariavelController],
  providers: [RendaVariavelService],
})
export class RendaVariavelModule {}
