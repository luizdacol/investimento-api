import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RendaVariavelModule } from './renda-variavel/renda-variavel.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CarteiraModule } from './carteira/carteira.module';

@Module({
  imports: [
    RendaVariavelModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'password',
      database: 'postgres',
      synchronize: false,
      autoLoadEntities: true,
      migrationsRun: false,
      logging: ['query'],
    }),
    CarteiraModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
