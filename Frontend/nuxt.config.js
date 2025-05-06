// https://nuxt.com/docs/api/configuration/nuxt-config
import { defineNuxtConfig } from "nuxt/config";
import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  devtools: { enabled: true },

  app: {
    head: {
      viewport: 'viewport-fit=cover', // needed for the bottomNav to work on iOS
    }
  },

  buildModules: ["@nuxtjs/i18n", "@vite-pwa/nuxt"],

  modules: [
    "@vite-pwa/nuxt",
    "@nuxtjs/i18n",
    "@pinia/nuxt",
    "@clerk/nuxt",
    "@nuxt/test-utils/module",
    "@nuxtjs/color-mode",
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
      name: "Superwise",
      //TBC.
      short_name: "SW",
      lang: "en",
      description:
        "An application that allows studnets to find their perfect supervisor match",
      display: "standalone",
      start_url: "/",
      icons: [
        {
          src: "/icons/SS_512x512.svg",
          sizes: "512x512",
          type: "image/svg",
        },
        {
          src: "/icons/SS_192x192.svg",
          sizes: "192x192",
          type: "image/svg",
        },
      ],
      screenshots: [
        {
          src: "/screenshots/Login.svg",
          sizes: "320x657",
          type: "image/svg",
          form_factor: "wide",
        },
        {
          src: "/screenshots/Chat.svg",
          sizes: "320x657",
          type: "image/svg",
        },
        {
          src: "/screenshots/Dashboard.svg",
          sizes: "320x657",
          type: "image/svg",
        },
        {
          src: "/screenshots/Matching.svg",
          sizes: "320x657",
          type: "image/svg",
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
