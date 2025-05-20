// https://nuxt.com/docs/api/configuration/nuxt-config
import {defineNuxtConfig} from "nuxt/config";
import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
    compatibilityDate: "2024-11-01",
    devtools: {enabled: true},


    buildModules: ["@nuxtjs/i18n", "@vite-pwa/nuxt"],

    modules: [
        "@vite-pwa/nuxt",
        "@nuxtjs/i18n",
        "@pinia/nuxt",
        "@clerk/nuxt",
        "@nuxt/test-utils/module",
        "@nuxtjs/color-mode",
    ],

    runtimeConfig: {
        nestApiUrl: process.env.NEST_API_URL,
        allowedEmailDomains: [process.env.ALLOWED_EMAIL_DOMAINS],
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
        defaultLocale: "en",
        locales: [
            {
                code: "en",
                name: "english",
                file: "en-GB.json",
            },
            {
                code: "de",
                name: "german",
                file: "de-DE.json",
            },
        ]
    },

    pwa: {
        manifest: {
            name: "Superwise",
            //TBC.
            short_name: "SW",
            lang: "en",
            description:
                "An application that allows students to find their perfect supervisor match",
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
