// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },

  // SPA mode
  ssr: false,

  nitro: {
    preset: 'static'
  },

  routeRules: {
    '/auth/reset-password/**': {
      prerender: false
    }
  },

  modules: [
    '@nuxt/ui',
    '@nuxt/eslint',
    '@nuxt/fonts',
    '@nuxt/icon',
    '@nuxt/image',
    '@nuxt/scripts'
  ],

  css: ['~/assets/css/index.css'],

  colorMode: {
    preference: 'light'
  },

  runtimeConfig: {
    public: {
      apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:9000'
    }
  },

  image: {
    provider: 'ipx'
  },

  compatibilityDate: '2025-04-02',
})