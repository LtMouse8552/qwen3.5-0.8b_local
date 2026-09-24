import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// 构建产物输出到 ../docs，供 GitHub Pages 部署；base 用相对路径
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: '../docs',
    emptyOutDir: true,
  },
  server: {
    host: '127.0.0.1',
    port: 5173,
  },
})
