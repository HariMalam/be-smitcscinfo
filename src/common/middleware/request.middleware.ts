// src/common/middleware/request-id.middleware.ts
import { v4 as uuidv4 } from 'uuid';
import { Request, Response, NextFunction } from 'express';
import { LanguageEnum } from '../../modules/i18n/enums/language.enum';
import { setRequestContext } from '../contexts/request-context';

const SUPPORTED_LANGUAGES = Object.values(LanguageEnum);

export function requestMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const requestId = (req.headers['x-request-id'] as string)?.trim() || uuidv4();

  const rawLang =
    (req.headers['x-lang'] as string) ||
    req.headers['accept-language']?.split(',')[0]?.split('-')[0] ||
    'en';

  const lang = SUPPORTED_LANGUAGES.includes(rawLang as LanguageEnum)
    ? (rawLang as LanguageEnum)
    : LanguageEnum.EN;

  setRequestContext({
    lang,
    requestId,
  });

  next();
}
