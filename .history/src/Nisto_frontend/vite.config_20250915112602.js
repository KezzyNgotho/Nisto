import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// Force Vite to use Windows browser through wsl-open
//process.env.BROWSER = "wsl-open"
process.env.BROWSER = "explorer.exe";


// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), ['VITE_', 'CANISTER_ID_', 'DFX_'])
  
  return {
    plugins: [react()],
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
      // Make environment variables available to the app
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
      open: false, // now opens Windows browser via wsl-open
      proxy: {
        '/mpesa': {
          target: 'http://localhost:8787',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/mpesa/, ''),
        },
      }
    }
  }
})
