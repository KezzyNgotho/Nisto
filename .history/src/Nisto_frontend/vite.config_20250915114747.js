import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), ['VITE_', 'CANISTER_ID_', 'DFX_'])
  
  // Helper: print the Windows browser link after server starts
  const printWindowsUrl = () => {
    return {
      name: 'print-windows-url',
      configureServer(server) {
        server.httpServer?.once('listening', () => {
          const protocol = server.config.server.https ? 'https' : 'http'
          const port = server.config.server.port
          const url = `${protocol}://localhost:${port}/`
          console.log(`\n👉 Open in Windows browser: ${url}\n`)
          console.log(`💡 Or run: explorer.exe ${url}\n`)
        })
      }
    }
  }

  return {
    plugins: [react(), printWindowsUrl()],
    base: './',
    resolve: {
      alias: {
        '@dfinity/agent': require.resolve('@dfinity/agent'),
        '@dfinity/auth-client': require.resolve('@dfinity/auth-client'),
        '@dfinity/principal': require.resolve('@dfinity/principal'),
        '@dfinity/candid': require.resolve('@dfinity/candid')
      }
    },
    define: {
      global: 'globalThis',
      'import.meta.env.CANISTER_ID_INTERNET_IDENTITY': JSON.stringify(env.CANISTER_ID_INTERNET_IDENTITY),
      'import.meta.env.CANISTER_ID_NISTO_BACKEND': JSON.stringify(env.CANISTER_ID_NISTO_BACKEND),
      'import.meta.env.CANISTER_ID_NISTO_FRONTEND': JSON.stringify(env.CANISTER_ID_NISTO_FRONTEND),
      'import.meta.env.DFX_NETWORK': JSON.stringify(env.DFX_NETWORK),
    },
    optimizeDeps: {
      include: ['@dfinity/agent', '@dfinity/auth-client', '@dfinity/principal', '@dfinity/candid']
    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      rollupOptions: {
        output: {
          manualChunks: {
            'dfinity': ['@dfinity/agent', '@dfinity/auth-client', '@dfinity/principal', '@dfinity/candid']
          },
          entryFileNames: 'assets/[name]-[hash].js',
          chunkFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash].[ext]'
        }
      }
    },
    server: {
      port: 3000,
      host: true,
      open: '/',
    
      proxy: {
        '/mpesa': {
          target: 'http://localhost:8787',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/mpesa/, ''),
        },
      },
    
      // Force Vite to use Windows explorer.exe to open browser
      fs: {
        strict: false,
      }
    },
    
  }
})
