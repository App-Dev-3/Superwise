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
    manifest: {
<<<<<<< HEAD
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
=======
      name: "MatchMaker",
      //TBC.
      short_name: "MM",
      lang: "en",
      description:
        "An application that allows studnets to find their perfect supervisor match",
      display: "standalone",
      start_url: "/",
>>>>>>> 15eddab (feat(frontend): Working clerk onboarding process (SCRUM-37))
      icons: [
        {
          src: "/icons/MM_512x512.png",
          sizes: "512x512",
          type: "image/png",
        },
<<<<<<< HEAD
      ],
>>>>>>> 544a15a (working onboarding)
    },
    workbox: {
      runtimeCaching: [
=======
>>>>>>> 15eddab (feat(frontend): Working clerk onboarding process (SCRUM-37))
        {
          src: "/icons/MM_192x192.png",
          sizes: "192x192",
          type: "image/png",
        },
      ],
      screenshots: [
        {
          src: "/screenshots/Login.png",
          sizes: "320x657",
          type: "image/png",
          form_factor: "wide",
        },
        {
          src: "/screenshots/Chat.png",
          sizes: "320x657",
          type: "image/png",
        },
        {
          src: "/screenshots/Dashboard.png",
          sizes: "320x657",
          type: "image/png",
        },
        {
          src: "/screenshots/Search.png",
          sizes: "320x657",
          type: "image/png",
        },
      ],
    },

    workbox: {
      navigateFallback: "/",
      globPatterns: ["**/*.{js,css,html,png,svg,ico,woff2}"],
    },
    devOptions: {
      enabled: false,
      type: "module",
    },
  },
});
