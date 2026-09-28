import pino from 'pino';

const isDevelopment = process.env.NODE_ENV === 'development';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: isDevelopment
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'HH:MM:ss Z',
          ignore: 'pid,hostname',
        },
      }
    : undefined,
  serializers: {
    err: pino.stdSerializers.err,
  },
  // Base context para logs estruturados (requisito do DevOps)
  base: {
    env: process.env.NODE_ENV || 'development',
  },
});

// Middleware para adicionar request ID ao contexto (requisito do DevOps)
export const requestLogger = (req: any, res: any, next: any) => {
  const requestId = (req.headers['x-request-id'] as string) || Math.random().toString(36).substring(7);
  req.requestId = requestId;
  
  logger.info({
    requestId,
    method: req.method,
    url: req.url,
    ip: req.ip,
  }, 'Incoming request');
  
  // Log de resposta
  const originalSend = res.send;
  res.send = function (data: any) {
    res.send = originalSend;
    logger.info({
      requestId,
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
    }, 'Request completed');
    originalSend.call(this, data);
  };
  
  next();
};

export default logger;
