// https://nuxt.com/docs/api/configuration/nuxt-config
import { defineNuxtConfig } from "nuxt/config";

export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },

  buildModules: [
    '@nuxtjs/i18n',
    '@vite-pwa/nuxt'
  ],
  modules: ['@vite-pwa/nuxt'],

  router: {
    base: '/'
  },


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

  pwa: {
    manifest: {
      name: 'MatchMaker',
      //TBC.
      short_name: 'MM',
      lang: 'en',
      description: 'An application that allows studnets to find their perfect supervisor match',
      display: 'standalone',
      start_url: '/',
      icons: [
        {
          src: '/icons/MM_512x512.png',
          sizes: '512x512',
          type: 'image/png',
        },
        {
          src: '/icons/MM_192x192.png',
          sizes: '192x192',
          type: 'image/png',
        },
      ],
      screenshots: [
        {
          src: '/screenshots/Login.png',
          sizes: '320x657',
          type: 'image/png',
          form_factor: 'wide'
        },
        {
          src: '/screenshots/Chat.png',
          sizes: '320x657',
          type: 'image/png',
        },
        {
          src: '/screenshots/Dashboard.png',
          sizes: '320x657',
          type: 'image/png',
        },
        {
          src: '/screenshots/Search.png',
          sizes: '320x657',
          type: 'image/png',
        },
      ]
    },

    workbox: {
      navigateFallback: '/',
      globPatterns: ['**/*.{js,css,html,png,svg,ico,woff2}'], 
    },
    devOptions: {
      enabled: true,
      type: 'module',
    }
  },

})