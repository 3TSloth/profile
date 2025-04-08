import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  server : {
    //Normally this wouldn't be a good idea (exposing the server to all IP addresses)
    //but this is protected against as we're using the docker container to only expose it to the host
    host: "0.0.0.0",
    port: 5178
  },
  plugins: [
    react(),
    tailwindcss(),
  ],
})


