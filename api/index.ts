import 'reflect-metadata';

let cachedApp: any;

async function bootstrap() {
  if (cachedApp) return cachedApp;

  const { NestFactory } = await import('@nestjs/core');
  const { AppModule } = await import('../src/app.module');
  const { HttpAdapterHost, Reflector } = await import('@nestjs/core');
  const { ClassSerializerInterceptor, ValidationPipe } = await import('@nestjs/common');
  const { ErrorFilter } = await import('../src/core/filters/error.filter');
  const { CustomValidationPipe } = await import('../src/core/pipes/custom-validation.pipe');
  const { PostStatusInterceptor } = await import('../src/core/interceptors/post-status.interceptor');
  const { useContainer } = await import('class-validator');

  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  app.useGlobalPipes(new CustomValidationPipe());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      forbidUnknownValues: false,
      skipMissingProperties: true,
      skipNullProperties: true,
      skipUndefinedProperties: true,
      stopAtFirstError: true,
    }),
  );

  app.useGlobalInterceptors(new PostStatusInterceptor());
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new ErrorFilter(httpAdapter));

  app.enableCors();
  await app.init();

  cachedApp = app;
  return app;
}

export default async (req: any, res: any) => {
  try {
    const app = await bootstrap();
    const instance = app.getHttpAdapter().getInstance();
    instance(req, res);
  } catch (error: any) {
    console.error('[VERCEL BOOTSTRAP ERROR]', error);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      message: 'Bootstrap failed',
      error: error?.message || String(error),
      stack: error?.stack,
    }));
  }
};
