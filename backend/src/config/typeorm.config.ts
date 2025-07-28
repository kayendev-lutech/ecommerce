import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { dbHost, dbPort, dbName, dbUser, dbPassword } from '../constants/env.constants.js';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: dbHost,
  port: dbPort,
  username: dbUser,
  password: dbPassword,
  database: dbName,
  entities: [
    process.env.NODE_ENV === 'production'
      ? 'dist/module/**/entity/*.entity.js'
      : 'src/module/**/entity/*.entity.{ts,js}',
  ],
  migrations: [
    process.env.NODE_ENV === 'production'
      ? 'dist/database/migrations/*.js'
      : 'src/database/migrations/*.{ts,js}',
  ],
  synchronize: false,
  logging: false,
});
