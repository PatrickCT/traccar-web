import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';
import svgr from 'vite-plugin-svgr';

export default defineConfig(({ mode }) => {
    // Load env variables based on the current mode (development/production)
    const env = loadEnv(mode, process.cwd(), '');

    return {
        plugins: [react(), svgr()],
        build: {
            outDir: 'build', // CRA's default build output
            sourcemap: true
        },
        server: {
            proxy: {
                '/api/socket': {
                    target: `ws://${env.VITE_APP_URL_NAME}`,
                    ws: true,
                },
                '/api': {
                    target: `http://${env.VITE_APP_URL_NAME}`,
                    changeOrigin: true,
                    // Optional error handling or rewrite here
                },
            },
        },
    };
});
