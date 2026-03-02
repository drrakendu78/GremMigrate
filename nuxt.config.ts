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
      title: 'GremMigrate — Joystick Gremlin R13 to R14 Profile Converter',
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/GremMigrate/favicon.ico' },
        { rel: 'canonical', href: 'https://drrakendu78.github.io/GremMigrate/' },
        { rel: 'apple-touch-icon', href: '/GremMigrate/og-image.png' },
      ],
      meta: [
        // SEO
        { name: 'description', content: 'Convert Joystick Gremlin R13 profiles to R14 format instantly. Free, open-source, fully client-side. Supports remaps, macros, response curves, virtual buttons, and more.' },
        { name: 'keywords', content: 'joystick gremlin, profile converter, R13 to R14, joystick gremlin migration, flight sim, HOTAS, vJoy, joystick profile, gremlin converter' },
        { name: 'author', content: 'Drrakendu78' },
        { name: 'robots', content: 'index, follow' },
        { name: 'theme-color', content: '#09090b' },
        // Open Graph
        { property: 'og:title', content: 'GremMigrate — Joystick Gremlin R13 to R14 Profile Converter' },
        { property: 'og:description', content: 'Convert Joystick Gremlin R13 profiles to R14 format instantly. Free, open-source, fully client-side.' },
        { property: 'og:type', content: 'website' },
        { property: 'og:url', content: 'https://drrakendu78.github.io/GremMigrate/' },
        { property: 'og:image', content: 'https://drrakendu78.github.io/GremMigrate/og-image.png' },
        { property: 'og:image:width', content: '1200' },
        { property: 'og:image:height', content: '630' },
        { property: 'og:site_name', content: 'GremMigrate' },
        { property: 'og:locale', content: 'en_US' },
        // Twitter
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: 'GremMigrate — Joystick Gremlin Profile Converter' },
        { name: 'twitter:description', content: 'Convert R13 profiles to R14 format. Free, open-source, client-side.' },
        { name: 'twitter:image', content: 'https://drrakendu78.github.io/GremMigrate/og-image.png' },
        // Security
        { 'http-equiv': 'Content-Security-Policy', content: "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://flagcdn.com; font-src 'self'; connect-src 'none'; frame-ancestors 'none'" },
        { 'http-equiv': 'X-Content-Type-Options', content: 'nosniff' },
      ],
      script: [
        // JSON-LD Structured Data
        {
          type: 'application/ld+json',
          innerHTML: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            'name': 'GremMigrate',
            'url': 'https://drrakendu78.github.io/GremMigrate/',
            'description': 'Convert Joystick Gremlin R13 profiles to R14 format. Free, open-source, fully client-side.',
            'applicationCategory': 'UtilitiesApplication',
            'operatingSystem': 'Any',
            'offers': { '@type': 'Offer', 'price': '0', 'priceCurrency': 'USD' },
            'author': { '@type': 'Person', 'name': 'Drrakendu78', 'url': 'https://github.com/drrakendu78' },
            'license': 'https://opensource.org/licenses/MIT',
          }),
        },
      ],
    },
  },
})
