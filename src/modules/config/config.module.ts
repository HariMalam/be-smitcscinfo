import { Global, Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import configuration from './configuration';
import { envSchema } from './validation.schema';

@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validate: (config: Record<string, unknown>) => {
        const parsed = envSchema.safeParse(config);
        if (!parsed.success) {
          throw new Error(
            '❌ Invalid environment variables:\n' +
              JSON.stringify(parsed.error.format(), null, 2),
          );
        }
        return parsed.data;
      },
    }),
  ],
})
export class ConfigModule {}
