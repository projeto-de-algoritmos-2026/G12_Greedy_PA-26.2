export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  ssr: false,
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss'],
  app: {
    head: {
      htmlAttrs: { lang: 'pt-BR' },
      title: 'G12 Greedy'
    }
  }
})
