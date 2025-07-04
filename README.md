## Executar

- Iniciar o docker daemon
- Executar o comando abaixo para iniciar os containers e rastrear logs da api

```powershell
npm run app:start
```

Para compilar e iniciar, execute o comando abaixo

```powershell
npm run app:deploy; npm run app:start
```

## Backup/Restore dos dados

Com o container de banco rodando, executar os comandos abaixo

Para fazer o backup: `npm run pg:dump`  
Para fazer o restore: `npm run pg:restore`

## Migrations

Para criar uma migration, executar o comando: `npm run migrations:new -- {./migrations/nome-migration}`
Para executar as migrations, executar o comando: `npm run migrations:run`
