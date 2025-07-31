import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from "path"
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  plugins: [react(), tailwindcss(), visualizer()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },

  server: {
    host: true,
    port: 5173,
  },

  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Example: common heavy chunks
          react: ['react', 'react-dom'],
          vendor: ['clsx', 'react-router-dom', 'framer-motion'],
          icons: ['lucide-react'],
        },
      },
    },
  },
})
