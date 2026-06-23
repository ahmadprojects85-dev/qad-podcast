import build from '@hono/vite-build/netlify-functions'
import devServer from '@hono/vite-dev-server'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    build(),
    devServer({
      entry: 'src/index.tsx',
      env: {
        DATABASE_URL: 'mysql://2xep5bQAAdyKm3h.root:q8srV12X7EeO8Wfc@gateway01.eu-central-1.prod.aws.tidbcloud.com:4000/test'
      }
    })
  ]
})
