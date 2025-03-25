// https://nuxt.com/docs/api/configuration/nuxt-config
import { defineNuxtConfig } from "nuxt/config";

export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  buildModules: ['@nuxtjs/i18n'],

  i18n: {
    detectBrowserLanguage: false,
    legacy: false,
    lazy: true,
    globalInjection: true,
    locales: [
      {
        code: 'en-EN',
        file: 'en.js',
      }, 
      {
        code: 'de-DE',
        file: 'de.js',
      }
    ],
    defaultLocale: 'en-EN',
    langDir: 'locales',
  },
})
