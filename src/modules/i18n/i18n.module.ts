import { Global, Module } from '@nestjs/common';
import { I18nModule, I18nJsonLoader, HeaderResolver } from 'nestjs-i18n';
import { join } from 'path';
import { I18nServiceWrapper } from './i18n.service';

@Global()
@Module({
  imports: [
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      loader: I18nJsonLoader,
      loaderOptions: {
        path: join(process.cwd(), 'i18n'),
        watch: true,
      },
      resolvers: [HeaderResolver],
    }),
  ],
  providers: [I18nServiceWrapper],
  exports: [I18nServiceWrapper],
})
export class CustomI18nModule {}
