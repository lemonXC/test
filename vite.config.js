import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import postcsspxtoviewport from 'postcss-px-to-viewport-8-plugin'

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  const plugins = [vue()]
  
  // 只在开发环境中启用 Vue DevTools
  if (command === 'serve' && mode === 'development') {
    plugins.push(vueDevTools())
  }
  
  return {
    base: '/',
    plugins,
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      },
    },
    // 构建配置
    build: {
      // 确保资源使用相对路径
      assetsDir: 'assets',
      // 生成manifest文件
      manifest: false,
      // 输出目录
      outDir: 'dist',
      // 清空输出目录
      emptyOutDir: true,
      // 内联小于此大小的资源（设置为0表示不内联，我们稍后手动处理）
      assetsInlineLimit: 0,
      // 代码分割配置
      rollupOptions: {
        output: {
          // 手动分块，避免过多的小文件
          manualChunks: undefined
        }
      }
    },
    css: {
      postcss: {
        plugins: [
          postcsspxtoviewport({
            unitToConvert: 'px', // 要转化的单位
            viewportWidth: 375, // UI设计稿的宽度
            unitPrecision: 6, // 转换后的精度，即小数点位数
            propList: ['*'], // 指定转换的css属性的单位，*代表全部css属性的单位都进行转换
            viewportUnit: 'vw', // 指定需要转换成的视窗单位，默认vw
            fontViewportUnit: 'vw', // 指定字体需要转换成的视窗单位，默认vw
            selectorBlackList: ['ignore-'], // 指定不转换为视窗单位的类名，
            minPixelValue: 1, // 默认值1，小于或等于1px则不进行转换
            mediaQuery: true, // 是否在媒体查询的css代码中也进行转换，默认false
            replace: true, // 是否转换后直接更换属性值
            landscape: false // 是否处理横屏情况
          })
        ]
      }
    },
    server: {
      host: '0.0.0.0', // 允许外部访问
      port: 3000
    }
  }
})
