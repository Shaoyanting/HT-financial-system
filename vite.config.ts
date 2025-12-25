import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // 加载环境变量
  const env = loadEnv(mode, process.cwd(), '')
  
  // 根据环境变量设置base路径
  const basePath = env.VITE_APP_BASE_PATH || '/HT-financial-system/'
  
  return {
    plugins: [react()],
    base: basePath,
  
    // 开发服务器配置
    server: {
      port: 5174, // 开发服务器端口
      host: true, // 监听所有地址
      open: true, // 自动打开浏览器
      
      // 反向代理配置
      proxy: {
        // 开发环境API代理
        '/api': {
          target: 'http://localhost:8080', // 开发环境后端地址
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '/api'),
          // 配置WebSocket代理
          ws: true,
          // 配置超时
          configure: (proxy) => {
            proxy.on('error', (err) => {
              console.log('proxy error', err)
            })
            proxy.on('proxyReq', (_, req) => {
              console.log('Sending Request to the Target:', req.method, req.url)
            })
            proxy.on('proxyRes', (proxyRes, req) => {
              console.log('Received Response from the Target:', proxyRes.statusCode, req.url)
            })
          },
          // 配置安全证书验证
          secure: false,
          // 配置请求头
          headers: {
            'Connection': 'keep-alive',
          },
        },
        
        // 生产环境API代理（备用配置）
        '/prod-api': {
          target: 'http://wcw825.top:8080', // 生产环境后端地址
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/prod-api/, '/api'),
          ws: true,
          timeout: 60000,
          secure: false,
          headers: {
            'Connection': 'keep-alive',
          },
        },
        
        // WebSocket代理配置
        '/ws': {
          target: 'ws://localhost:8080',
          ws: true,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/ws/, ''),
        },
      },
    },
    
    // 构建配置
    build: {
      outDir: 'dist',
      sourcemap: false, // 生产环境关闭sourcemap
      chunkSizeWarningLimit: 1000, // 提高chunk大小警告限制
      rollupOptions: {
        output: {
          // 代码分割配置
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom'],
            antd: ['antd', '@ant-design/icons'],
            charts: ['recharts'],
            utils: ['dayjs'],
          },
        },
      },
    },
    
    // 预览配置
    preview: {
      port: 4174,
      host: true,
      open: true,
      proxy: {
        '/api': {
          target: 'http://wcw825.top:8080', // 预览时使用生产环境
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '/api'),
        },
      },
    },
    
    // 环境变量配置
    define: {
      'process.env': {},
    },
  }
})
