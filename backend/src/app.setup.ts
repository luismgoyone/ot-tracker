import { HttpAdapterHost } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import { DatabaseExceptionFilter } from './common/filters/database-exception.filter';

/** HTTP-level setup shared by main.ts and the e2e tests. */
export function configureApp(app: NestExpressApplication): void {
  app.setGlobalPrefix('api');
  app.use(helmet());
  // Number of reverse proxies in front of the app, so req.ip is the real client for rate limiting.
  // Production is browser -> Netlify /api proxy -> Render load balancer -> app, i.e. 2 hops.
  app.set('trust proxy', Number(process.env.TRUST_PROXY_HOPS ?? 1));

  // In production the frontend calls the API through Netlify's same-origin /api proxy,
  // so CORS is only needed for other origins listed explicitly.
  const origins = (process.env.CORS_ORIGINS ?? 'http://localhost:3000')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);
  app.enableCors({ origin: origins });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.useGlobalFilters(new DatabaseExceptionFilter(app.get(HttpAdapterHost).httpAdapter));
}
