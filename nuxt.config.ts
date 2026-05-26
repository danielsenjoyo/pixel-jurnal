// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: false,
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  modules: ["@mekari/pixel3-nuxt", "@nuxt/eslint"],

  // Register components by filename only — no folder-prefix (AppHeader not
  // ComponentsAppHeader). Resolves under Nuxt 4's `app/` directory layout.
  components: [{ path: "~/components", pathPrefix: false }],

  // Pixel 3 base CSS is auto-injected by @mekari/pixel3-nuxt. These entries
  // layer Jurnal's project-specific tokens + global resets on top.
  css: ["~/assets/css/tokens.css", "~/assets/css/global.css"],

  app: {
    head: {
      title: "Mekari Jurnal",
      htmlAttrs: { lang: "en" },
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        { name: "description", content: "Mekari Jurnal accounting workspace" }
      ],
      link: [
        { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
        }
      ]
    }
  },

  vite: {
    optimizeDeps: {
      include: ["@mekari/pixel3"]
    }
  },

  // TODO: Remove this once this issue is fixed https://github.com/nuxt/nuxt/issues/35033
  experimental: {
    viteEnvironmentApi: true
  }
});
