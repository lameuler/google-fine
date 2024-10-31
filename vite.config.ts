import { defineConfig } from 'vite'

export default defineConfig({
    base: '/google-fine/',
    root: 'src',
    publicDir: '../public',
    build: {
        outDir: '../dist',
        emptyOutDir: true,
        rollupOptions: {
            input: {
                index: 'src/index.html',
                404: 'src/404.html'
            }
        }
    },
    appType: 'mpa'
})