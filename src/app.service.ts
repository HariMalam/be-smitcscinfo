import { Injectable } from '@nestjs/common';
import { I18nServiceWrapper } from './modules/i18n/i18n.service';
import { ControllerResponse } from './common/interfaces/api-response.interface';

@Injectable()
export class AppService {
  constructor(private readonly i18n: I18nServiceWrapper) {}
  getHello(): ControllerResponse {
    return {
      message: this.i18n.t('common', 'WELCOME'),
    };
  }
}
