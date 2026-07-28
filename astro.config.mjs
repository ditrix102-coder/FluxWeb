// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  server: {
    host: true
  },

  vite: {
    plugins: [tailwindcss()]
  },

  adapter: cloudflare()
});