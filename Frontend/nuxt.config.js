// https://nuxt.com/docs/api/configuration/nuxt-config
import { defineNuxtConfig } from "nuxt/config";
import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  devtools: { enabled: true },

  buildModules: ["@nuxtjs/i18n", "@vite-pwa/nuxt"],

  modules: [
<<<<<<< HEAD
    '@vite-pwa/nuxt',
    '@nuxtjs/i18n',
    '@pinia/nuxt',
    '@clerk/nuxt',
    '@nuxt/test-utils/module',
    '@nuxtjs/color-mode',
=======
    "@vite-pwa/nuxt",
    "@nuxtjs/i18n",
    "@pinia/nuxt",
    "@clerk/nuxt",
    "@nuxt/test-utils/module",
>>>>>>> 544a15a (working onboarding)
  ],

  typescript: {
    typeCheck: true,
  },

  router: {
    base: "/",
  },

  vite: {
    plugins: [tailwindcss()],
  },

  css: ["~/assets/css/app.css"],

  colorMode: {
    dataValue: "theme",
  },
  i18n: {
    detectBrowserLanguage: false,
    legacy: false,
    lazy: true,
    globalInjection: true,
    strategy: "prefix_except_default",
    locales: [
      {
        code: "en",
        file: "en.js",
      },
      {
        code: "de",
        file: "de.js",
      },
    ],
    defaultLocale: "en",
    langDir: "locales",
    bundle: {
      optimizeTranslationDirective: false,
    },
  },

  pwa: {
    registerType: "autoUpdate",
    manifest: {
<<<<<<< HEAD
      name: 'Superwise',
      //TBC.
      short_name: 'SW',
      lang: 'en',
      description: 'An application that allows studnets to find their perfect supervisor match',
      display: 'standalone',
      start_url: '/',
      icons: [
        {
          src: '/icons/SS_512x512.svg',
          sizes: '512x512',
          type: 'image/svg',
        },
        {
          src: '/icons/SS_192x192.svg',
          sizes: '192x192',
          type: 'image/svg',
        },
      ],
      screenshots: [
        {
          src: '/screenshots/Login.svg',
          sizes: '320x657',
          type: 'image/svg',
          form_factor: 'wide'
        },
        {
          src: '/screenshots/Chat.svg',
          sizes: '320x657',
          type: 'image/svg',
        },
        {
          src: '/screenshots/Dashboard.svg',
          sizes: '320x657',
          type: 'image/svg',
        },
        {
          src: '/screenshots/Matching.svg',
          sizes: '320x657',
          type: 'image/svg',
        },
      ]
=======
      name: "Nuxt 3 PWA",
      short_name: "NuxtPWA",
      description: "A Nuxt 3 Progressive Web App",
      theme_color: "#4A90E2",
      icons: [
        {
          src: "/pwa-icon-192x192.png",
          sizes: "192x192",
          type: "image/png",
        },
        {
          src: "/pwa-icon-512x512.png",
          sizes: "512x512",
          type: "image/png",
        },
      ],
>>>>>>> 544a15a (working onboarding)
    },
    workbox: {
      runtimeCaching: [
        {
          urlPattern: "https://example.com/.*",
          handler: "NetworkFirst",
          options: {
            cacheName: "api-cache",
            expiration: {
              maxEntries: 50,
              maxAgeSeconds: 86400,
            },
          },
        },
      ],
    },
  },
});
