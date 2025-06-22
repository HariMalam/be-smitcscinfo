import common from '../../../i18n/en/common.json';
import user from '../../../i18n/en/user.json';
import role from '../../../i18n/en/role.json';
import auth from '../../../i18n/en/auth.json';

export const translations = {
  common,
  user,
  role,
  auth,
} as const;

export type Namespace = keyof typeof translations;

export type TranslationKeysMap = {
  [K in Namespace]: keyof (typeof translations)[K];
};

export type TranslationKey<N extends Namespace> = TranslationKeysMap[N];
