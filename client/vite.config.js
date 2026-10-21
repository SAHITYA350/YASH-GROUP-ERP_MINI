import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath } from 'node:url'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const serverDirectory = fileURLToPath(new URL('../server', import.meta.url))
  const serverEnv = loadEnv(mode, serverDirectory, '')
  const apiPort = serverEnv.PORT || '3001'

  return {
    plugins: [react(), tailwindcss()],
    server: { proxy: { '/api': `http://localhost:${apiPort}` } },
  }
})
