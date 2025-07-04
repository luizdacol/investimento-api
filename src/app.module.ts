import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RendaVariavelModule } from './renda-variavel/renda-variavel.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CarteiraModule } from './carteira/carteira.module';
import { RendaFixaModule } from './renda-fixa/renda-fixa.module';
import { ConfigModule } from '@nestjs/config';
import { CriptomoedasModule } from './criptomoedas/criptomoedas.module';

@Module({
  imports: [
    RendaVariavelModule,
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST ?? 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'password',
      database: 'postgres',
      synchronize: false,
      autoLoadEntities: true,
      migrationsRun: false,
      //logging: ['query'],
    }),
    CarteiraModule,
    RendaFixaModule,
    CriptomoedasModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
