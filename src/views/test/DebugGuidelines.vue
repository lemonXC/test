<template>
  <div class="debug-guidelines">
    <van-nav-bar
      title="调试留言说明流程"
      left-arrow
      @click-left="$router.go(-1)"
      class="nav-bar"
    />

    <div class="content">
      <div class="debug-section">
        <h3>当前状态</h3>
        <div class="status-item">
          <span class="label">SessionStorage状态:</span>
          <span class="value" :class="{ 'agreed': agreementStatus === '已同意' }">
            {{ agreementStatus }}
          </span>
        </div>
        <div class="status-item">
          <span class="label">同意时间:</span>
          <span class="value">{{ agreementTime }}</span>
        </div>
        <div class="status-item">
          <span class="label">当前路径:</span>
          <span class="value">{{ currentPath }}</span>
        </div>
        <div class="status-item">
          <span class="label">来源路径:</span>
          <span class="value">{{ fromPath }}</span>
        </div>
      </div>

      <div class="debug-section">
        <h3>SessionStorage详情</h3>
        <div class="storage-details">
          <div class="storage-item">
            <span class="key">message_guidelines_agreed_current_session:</span>
            <span class="value">{{ sessionStorageDetails.agreed }}</span>
          </div>
          <div class="storage-item">
            <span class="key">message_guidelines_agreed_time:</span>
            <span class="value">{{ sessionStorageDetails.time }}</span>
          </div>
        </div>
      </div>

      <div class="debug-section">
        <h3>操作按钮</h3>
        <div class="button-group">
          <van-button type="danger" @click="clearAgreement" class="action-btn">
            清除同意状态
          </van-button>
          <van-button type="success" @click="setAgreement" class="action-btn">
            设置已同意状态
          </van-button>
          <van-button type="primary" @click="refreshStatus" class="action-btn">
            刷新状态
          </van-button>
        </div>
      </div>

      <div class="debug-section">
        <h3>测试导航</h3>
        <div class="button-group">
          <van-button type="warning" @click="goToSubmitIssue" class="action-btn">
            直接访问提交问题页面
          </van-button>
          <van-button type="default" @click="goToGuidelines" class="action-btn">
            访问留言说明页面
          </van-button>
        </div>
      </div>

      <div class="debug-section">
        <h3>路由守卫测试</h3>
        <div class="guard-test">
          <p>点击下面的按钮测试路由守卫是否正常工作：</p>
          <van-button type="primary" @click="testRouteGuard" class="action-btn">
            测试路由守卫
          </van-button>
          <div v-if="guardTestResult" class="test-result">
            <p>测试结果: {{ guardTestResult }}</p>
          </div>
        </div>
      </div>

      <div class="debug-section">
        <h3>调试日志</h3>
        <div class="log-container">
          <div v-for="(log, index) in debugLogs" :key="index" class="log-item">
            <span class="log-time">{{ log.time }}</span>
            <span class="log-message">{{ log.message }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast } from 'vant'

const router = useRouter()
const route = useRoute()

const agreementStatus = ref('未同意')
const agreementTime = ref('无')
const currentPath = ref('')
const fromPath = ref('')
const sessionStorageDetails = ref({
  agreed: '',
  time: ''
})
const guardTestResult = ref('')
const debugLogs = ref([])

// 添加调试日志
const addLog = (message) => {
  const now = new Date()
  const timeStr = now.toLocaleTimeString()
  debugLogs.value.unshift({
    time: timeStr,
    message: message
  })
  // 只保留最近20条日志
  if (debugLogs.value.length > 20) {
    debugLogs.value = debugLogs.value.slice(0, 20)
  }
}

// 更新状态显示
const updateStatus = () => {
  const agreed = sessionStorage.getItem('message_guidelines_agreed_current_session')
  const time = sessionStorage.getItem('message_guidelines_agreed_time')
  
  agreementStatus.value = agreed === 'true' ? '已同意' : '未同意'
  
  if (time) {
    const date = new Date(parseInt(time))
    agreementTime.value = date.toLocaleString()
  } else {
    agreementTime.value = '无'
  }

  // 更新详细信息
  sessionStorageDetails.value = {
    agreed: agreed || '(空)',
    time: time || '(空)'
  }

  currentPath.value = route.fullPath
  fromPath.value = router.options.history.state?.back || '无'

  addLog(`状态更新: ${agreementStatus.value}`)
}

// 清除同意状态
const clearAgreement = () => {
  sessionStorage.removeItem('message_guidelines_agreed_current_session')
  sessionStorage.removeItem('message_guidelines_agreed_time')
  updateStatus()
  showToast('已清除同意状态')
  addLog('清除同意状态')
}

// 设置已同意状态
const setAgreement = () => {
  sessionStorage.setItem('message_guidelines_agreed_current_session', 'true')
  sessionStorage.setItem('message_guidelines_agreed_time', Date.now().toString())
  updateStatus()
  showToast('已设置为同意状态')
  addLog('设置同意状态')
}

// 刷新状态
const refreshStatus = () => {
  updateStatus()
  showToast('状态已刷新')
  addLog('手动刷新状态')
}

// 跳转到提交问题页面
const goToSubmitIssue = () => {
  addLog('尝试跳转到提交问题页面')
  router.push('/submit-issue')
}

// 跳转到留言说明页面
const goToGuidelines = () => {
  addLog('跳转到留言说明页面')
  router.push('/message-guidelines')
}

// 测试路由守卫
const testRouteGuard = () => {
  const agreed = sessionStorage.getItem('message_guidelines_agreed_current_session')
  const hasAgreed = agreed === 'true'
  
  guardTestResult.value = hasAgreed 
    ? '路由守卫应该允许访问提交问题页面' 
    : '路由守卫应该重定向到留言说明页面'
  
  addLog(`路由守卫测试: ${guardTestResult.value}`)
}

onMounted(() => {
  updateStatus()
  addLog('调试页面已加载')
})
</script>

<style scoped>
.debug-guidelines {
  min-height: 100vh;
  background-color: #f8f9fa;
}

.nav-bar {
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.content {
  padding: 16px;
}

.debug-section {
  background-color: #fff;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.debug-section h3 {
  margin: 0 0 12px 0;
  color: #1976d2;
  font-size: 16px;
  font-weight: bold;
  border-bottom: 2px solid #e3f2fd;
  padding-bottom: 8px;
}

.status-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.status-item:last-child {
  border-bottom: none;
}

.label {
  font-weight: bold;
  color: #666;
}

.value {
  color: #333;
}

.value.agreed {
  color: #4caf50;
  font-weight: bold;
}

.storage-details {
  font-family: monospace;
  font-size: 12px;
}

.storage-item {
  display: flex;
  margin-bottom: 8px;
  word-break: break-all;
}

.key {
  color: #666;
  margin-right: 8px;
  min-width: 200px;
}

.button-group {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.action-btn {
  flex: 1;
  min-width: 120px;
}

.guard-test p {
  margin: 0 0 12px 0;
  color: #666;
}

.test-result {
  margin-top: 12px;
  padding: 8px;
  background-color: #f5f5f5;
  border-radius: 4px;
}

.log-container {
  max-height: 200px;
  overflow-y: auto;
  background-color: #f5f5f5;
  border-radius: 4px;
  padding: 8px;
}

.log-item {
  display: flex;
  margin-bottom: 4px;
  font-size: 12px;
  font-family: monospace;
}

.log-time {
  color: #666;
  margin-right: 8px;
  min-width: 80px;
}

.log-message {
  color: #333;
}
</style>