import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RendaVariavelModule } from './renda-variavel/renda-variavel.module';

@Module({
  imports: [RendaVariavelModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
