export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL || '',
  jwt: {
    secret: process.env.JWT_SECRET || 'dev-secret-key',
    expiration: process.env.JWT_EXPIRATION || '1h',
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
  },
  upload: {
    dir: process.env.UPLOAD_DIR || './uploads',
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10), // 10MB
  },
  externalApis: {
    viaCepTimeout: parseInt(process.env.VIACEP_TIMEOUT || '3000', 10),
    holidaysApiTimeout: parseInt(process.env.HOLIDAYS_API_TIMEOUT || '2000', 10),
  },
};
