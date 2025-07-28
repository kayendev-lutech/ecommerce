import { getEnv } from '@config/dotenv.config';

export const port = getEnv('PORT') || 8000;
export const dbHost = getEnv('DB_HOST') || 'localhost';
export const dbName = getEnv('DB_NAME') || 'postgres';
export const dbUser = getEnv('DB_USER') || 'postgres';
export const dbPassword = getEnv('DB_PASSWORD') || '123456';
export const dbPort = Number(getEnv('DB_PORT')) || 5433;
export const jwtAccessSecret = getEnv('JWT_ACCESS_SECRET') || 'your_access_secret';
export const jwtRefreshSecret = getEnv('JWT_REFRESH_SECRET') || 'your_refresh_secret';
export const accessTokenExpiry = getEnv('ACCESS_TOKEN_EXPIRY') || '15m';
export const refreshTokenExpiry = getEnv('REFRESH_TOKEN_EXPIRY') || '7d';
export const debugInConsole = getEnv('DEBUG_CONSOLE') || 'true';
export const frontEndUrls = getEnv('FRONT_END_URLS') || 'true';
