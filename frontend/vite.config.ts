import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { copyFileSync, existsSync } from 'fs'

// Plugin to copy PDF.js worker to public directory
const copyPdfWorker = () => {
  return {
    name: 'copy-pdf-worker',
    buildStart() {
      const workerSrc = path.resolve(__dirname, 'node_modules/pdfjs-dist/build/pdf.worker.min.mjs')
      const workerDest = path.resolve(__dirname, 'public/pdf.worker.min.js')
      
      if (existsSync(workerSrc)) {
        try {
          copyFileSync(workerSrc, workerDest)
          console.log('PDF.js worker copied to public directory')
        } catch (error) {
          console.warn('Failed to copy PDF.js worker:', error)
        }
      } else {
        console.warn('PDF.js worker source file not found:', workerSrc)
      }
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), copyPdfWorker()],
  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, '../shared'),
    },
  },
  optimizeDeps: {
    include: ['pdfjs-dist'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'pdfjs': ['pdfjs-dist'],
        },
      },
    },
  },
})
