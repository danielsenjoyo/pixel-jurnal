import withNuxt from "./.nuxt/eslint.config.mjs";
import prettier from "eslint-config-prettier";

export default withNuxt(prettier, {
  rules: {
    // Pixel3 components use camelCase props
    "vue/attribute-hyphenation": "off",
    "vue/v-on-event-hyphenation": "off",
    // Pixel3 uses v-html internally in some components
    "vue/no-v-text-v-html-on-component": "off",
    // Vue 3 supports fragments (multiple root elements)
    "vue/no-multiple-template-root": "off",
    // Prototype app — optional props don't need defaults
    "vue/require-default-prop": "off",
    // v-html used intentionally in some places
    "vue/no-v-html": "off"
  }
});
