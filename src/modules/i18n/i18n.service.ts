import { Injectable } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { Namespace, TranslationKey } from './translations';
import { getLang } from '../../common/contexts/request-context';

@Injectable()
export class I18nServiceWrapper {
  constructor(private readonly i18n: I18nService) {}

  t<N extends Namespace>(
    namespace: N,
    key: TranslationKey<N>,
    args?: Record<string, any>,
  ): string {
    const lang = getLang();

    return this.i18n.translate(`${String(namespace)}.${String(key)}`, {
      lang,
      args,
    });
  }
}
