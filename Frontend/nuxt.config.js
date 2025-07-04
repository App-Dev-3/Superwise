// https://nuxt.com/docs/api/configuration/nuxt-config
import {defineNuxtConfig} from "nuxt/config";
import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
    compatibilityDate: "2024-11-01",
    devtools: {enabled: false},


    buildModules: ["@nuxtjs/i18n"],

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

    clerk: {
        appearance: {
            variables: {
                colorPrimary: 'blue'
            }
        }
    },

    i18n: {
        defaultLocale: "en",
        strategy: "no_prefix",
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
            }
        ],
        bundle: {
            optimizeTranslationDirective: false
        }
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
            start_url: "./",
            theme_color: "#ffffff",
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
                {
                    src: "/icons/SS_144x144.png",
                    sizes: "144x144",
                    type: "image/png",
                    purpose: "any"
                },
                {
                    src: "/icons/SS_192x192.png",
                    sizes: "192x192",
                    type: "image/png",
                    purpose: "any"
                },
                {
                    src: "/icons/SS_512x512.png",
                    sizes: "512x512",
                    type: "image/png",
                    purpose: "any"
                }
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
            globPatterns: ["**/*.{js,css,html,png,svg,ico,woff2}"],
        },
        devOptions: {
            enabled: true,
            type: "module",
        },
    },
    app: {
        head: {
            title: "SuperWise",
            link: [
                {
                    rel: 'icon',
                    type: 'image/svg+xml',
                    href: '/favicon/favicon_light.svg',
                    media: '(prefers-color-scheme: light)'
                },
                {
                    rel: 'icon',
                    type: 'image/svg+xml',
                    href: '/favicon/favicon_dark.svg',
                    media: '(prefers-color-scheme: dark)'
                }
            ]
        },
    },
});
