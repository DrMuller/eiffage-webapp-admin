// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },

  app: {
    head: {
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon-72x72.png' },
        { rel: 'icon', type: 'image/x-icon', href: '/favicon-144x144.png' }
      ]
    }
  },

  // SPA mode
  ssr: false,

  nitro: {
    preset: 'static',
    minify: true
  },

  // Optimize build for memory-constrained environments
  vite: {
    build: {
      // Disable source maps in production to save memory
      sourcemap: false,
      // Reduce chunk size to lower memory usage
      chunkSizeWarningLimit: 500,
      rollupOptions: {
        output: {
          // Manual chunk splitting to reduce memory pressure
          manualChunks: (id) => {
            if (id.includes('node_modules')) {
              // Split vendor code into smaller chunks
              if (id.includes('chart.js') || id.includes('vue-chartjs')) {
                return 'vendor-charts';
              }
              if (id.includes('@nuxt/ui')) {
                return 'vendor-ui';
              }
              if (id.includes('vue')) {
                return 'vendor-vue';
              }
              return 'vendor';
            }
          }
        }
      }
    },
    optimizeDeps: {
      include: ['vue', 'vue-router']
    }
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
    '@nuxt/scripts',
    '@nuxtjs/i18n',
  ],

  fonts: {
    families: [
      { name: 'DM Serif Text', provider: 'google' },
      { name: 'Montserrat', provider: 'google' }
    ]
  },

  plugins: ['~/plugins/i18n.ts'],

  css: ['~/assets/css/index.css'],

  colorMode: {
    preference: 'light'
  },

  runtimeConfig: {
    public: {
      apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:9001'
    }
  },

  image: {
    provider: 'ipx'
  },

  // Disable source maps in production
  sourcemap: {
    server: false,
    client: false
  },

  // Optimize builds
  experimental: {
    payloadExtraction: false
  },

  compatibilityDate: '2025-04-02',
})