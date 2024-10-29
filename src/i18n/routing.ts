import {defineRouting} from 'next-intl/routing';
import {createNavigation} from 'next-intl/navigation';
import { locales } from './locale';
 
export const routing = defineRouting({
  locales: locales,
  defaultLocale: 'en'
});

export const {Link, redirect, usePathname, useRouter} =
  createNavigation(routing);