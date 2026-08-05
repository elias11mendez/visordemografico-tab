import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    tailwindcss(),
  ],
  define: {
    // Define process.env vacío para evitar que rompan dependencias antiguas
    'process.env': {},
  },
})