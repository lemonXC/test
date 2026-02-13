import './assets/main.css'
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// 导入Vant组件库
import Vant from 'vant'
import 'vant/lib/index.css'

// 导入移动端适配
import 'amfe-flexible'

// 禁用 Vue DevTools
if (typeof window !== 'undefined') {
  try {
    // 尝试禁用 Vue DevTools
    if (!window.__VUE_DEVTOOLS_GLOBAL_HOOK__) {
      window.__VUE_DEVTOOLS_GLOBAL_HOOK__ = {
        Vue: () => {},
        enabled: false,
        emit: () => {},
        on: () => {},
        once: () => {},
        off: () => {},
        apps: []
      }
    } else {
      // 如果已存在，尝试禁用它
      if (window.__VUE_DEVTOOLS_GLOBAL_HOOK__.enabled !== undefined) {
        window.__VUE_DEVTOOLS_GLOBAL_HOOK__.enabled = false
      }
    }
  } catch (e) {
    // 如果设置失败，静默忽略（可能是只读属性）
    console.debug('Vue DevTools hook is read-only')
  }
}

// 禁用开发者工具相关功能
if (typeof window !== 'undefined') {
  // 禁用右键菜单
  document.addEventListener('contextmenu', function(e) {
    e.preventDefault()
    return false
  })

  // 禁用F12、Ctrl+Shift+I、Ctrl+Shift+J、Ctrl+U等快捷键
  document.addEventListener('keydown', function(e) {
    // F12
    if (e.key === 'F12') {
      e.preventDefault()
      return false
    }
    
    // Ctrl+Shift+I (开发者工具)
    if (e.ctrlKey && e.shiftKey && e.key === 'I') {
      e.preventDefault()
      return false
    }
    
    // Ctrl+Shift+J (控制台)
    if (e.ctrlKey && e.shiftKey && e.key === 'J') {
      e.preventDefault()
      return false
    }
    
    // Ctrl+U (查看源代码)
    if (e.ctrlKey && e.key === 'u') {
      e.preventDefault()
      return false
    }
    
    // Ctrl+Shift+C (元素选择器)
    if (e.ctrlKey && e.shiftKey && e.key === 'C') {
      e.preventDefault()
      return false
    }
    
    // Ctrl+S (保存页面)
    if (e.ctrlKey && e.key === 's') {
      e.preventDefault()
      return false
    }
  })

  // 检测开发者工具是否打开
  let devtools = {
    open: false,
    orientation: null
  }
  
  const threshold = 160
  
  setInterval(() => {
    if (window.outerHeight - window.innerHeight > threshold || 
        window.outerWidth - window.innerWidth > threshold) {
      if (!devtools.open) {
        devtools.open = true
        // 可以在这里添加检测到开发者工具打开时的处理逻辑
        console.clear()
        // 重定向到其他页面或显示警告
        // window.location.href = 'about:blank'
      }
    } else {
      devtools.open = false
    }
  }, 500)
  
  // 禁用选择文本
  document.addEventListener('selectstart', function(e) {
    e.preventDefault()
    return false
  })
  
  // 禁用拖拽
  document.addEventListener('dragstart', function(e) {
    e.preventDefault()
    return false
  })
}

const app = createApp(App)

// 注册路由和Vant
app.use(router)
app.use(Vant)

app.mount('#app')
