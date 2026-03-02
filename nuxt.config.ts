// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss'],
  ssr: false,
  app: {
    baseURL: '/GremMigrate/',
    head: {
      htmlAttrs: { lang: 'en' },
      title: 'GremMigrate — Joystick Gremlin Profile Converter',
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      ],
      meta: [
        { name: 'description', content: 'Convert Joystick Gremlin R13 profiles to R14 format. Free, fast, fully client-side.' },
        { 'http-equiv': 'Content-Security-Policy', content: "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://flagcdn.com; font-src 'self'; connect-src 'none'; frame-ancestors 'none'" },
        { 'http-equiv': 'X-Content-Type-Options', content: 'nosniff' },
        { property: 'og:title', content: 'GremMigrate — Joystick Gremlin Profile Converter' },
        { property: 'og:description', content: 'Convert Joystick Gremlin R13 profiles to R14 format. Free, fast, fully client-side.' },
        { property: 'og:type', content: 'website' },
        { property: 'og:image', content: '/og-image.png' },
        { name: 'twitter:card', content: 'summary_large_image' },
      ],
    },
  },
})
