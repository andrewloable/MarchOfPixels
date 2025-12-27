import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['image/march-of-pixels-icon.jpg'],
      manifest: {
        name: 'March of Pixels',
        short_name: 'MarchOfPixels',
        description: 'A number progression shooter game - collect numbers, grow stronger, defeat enemies!',
        theme_color: '#1a1a2e',
        background_color: '#1a1a2e',
        display: 'fullscreen',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          {
            src: 'image/march-of-pixels-icon.jpg',
            sizes: '512x512',
            type: 'image/jpeg',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
  server: {
    host: true
  }
});
