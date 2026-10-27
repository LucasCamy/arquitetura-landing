import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: { port: 5317, strictPort: true },
  preview: { port: 4317, strictPort: true },
  build: {
    rolldownOptions: {
      output: {
        // Bibliotecas em chunks próprios: mudam pouco e ficam em cache entre deploys.
        codeSplitting: {
          groups: [
            { name: 'react', test: /node_modules[\/](react|react-dom|scheduler)[\/]/ },
            { name: 'gsap', test: /node_modules[\/](gsap|@gsap)[\/]/ },
          ],
        },
      },
    },
  },
})
