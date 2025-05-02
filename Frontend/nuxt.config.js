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
