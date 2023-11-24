import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { CotacaoService } from './cotacao.service';

@Module({
  imports: [HttpModule],
  controllers: [],
  providers: [CotacaoService],
  exports: [CotacaoService],
})
export class CotacaoModule {}
