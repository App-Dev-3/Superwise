// https://nuxt.com/docs/api/configuration/nuxt-config
import { defineNuxtConfig } from "nuxt/config";
import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  devtools: { enabled: true },

  buildModules: ["@nuxtjs/i18n", "@vite-pwa/nuxt"],

  modules: [
    "@vite-pwa/nuxt",
    "@nuxtjs/i18n",
    "@pinia/nuxt",
    "@clerk/nuxt",
    "@nuxt/test-utils/module",
  ],

  router: {
    base: "/",
  },

  vite: {
    plugins: [tailwindcss()],
  },
  css: ["~/assets/css/app.css"],

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
      name: "MatchMaker",
      //TBC.
      short_name: "MM",
      lang: "en",
      description:
        "An application that allows studnets to find their perfect supervisor match",
      display: "standalone",
      start_url: "/",
      icons: [
        {
          src: "/icons/MM_512x512.png",
          sizes: "512x512",
          type: "image/png",
        },
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
