import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Cổng 5173 khớp app.cors.allowed-origin của backend (bảo mật: CORS chỉ mở cho origin frontend dev).
export default defineConfig({
  plugins: [react()],
  server: { port: 5173, strictPort: true },
});
