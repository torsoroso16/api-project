import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupPipes } from './core/setup/pipes.setup';
import { setupCors } from './core/setup/cors.setup';
// import { setupUpload } from './core/setup/upload.setup';
import * as cookieParser from 'cookie-parser';
import * as compression from 'compression';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security middlewares
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "cdn.jsdelivr.net"],
        styleSrc: ["'self'", "'unsafe-inline'", "fonts.googleapis.com", "cdn.jsdelivr.net"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'", "fonts.gstatic.com"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: false,
  }));

  app.use(compression.default());
  app.use(cookieParser.default());

  // CORS
  setupCors(app);

  // Global validation pipe
  setupPipes(app);

  const PORT = process.env.PORT || 4000;
  await app.listen(PORT);
  
  console.log(`🚀 Application is running on: ${await app.getUrl()}`);
  console.log(`🔍 GraphQL Playground: ${await app.getUrl()}/graphql`);
}

bootstrap().catch((error) => {
  console.error('❌ Error starting server:', error);
  process.exit(1);
});