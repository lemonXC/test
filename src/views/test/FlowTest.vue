<template>
  <div class="flow-test">
    <van-nav-bar
      title="流程测试页面"
      left-arrow
      @click-left="$router.go(-1)"
      class="nav-bar"
    />

    <div class="content">
      <div class="test-section">
        <h3>测试强制留言说明流程</h3>
        <p class="description">
          这个页面用于测试每次访问提交问题页面前都必须先阅读留言说明的流程。
        </p>
        
        <div class="current-status">
          <h4>当前状态</h4>
          <div class="status-item">
            <span class="label">同意状态:</span>
            <span class="value" :class="{ 'agreed': isAgreed }">
              {{ isAgreed ? '已同意' : '未同意' }}
            </span>
          </div>
          <div class="status-item">
            <span class="label">同意时间:</span>
            <span class="value">{{ agreementTime }}</span>
          </div>
        </div>

        <div class="test-buttons">
          <h4>测试步骤</h4>
          <div class="step">
            <span class="step-number">1.</span>
            <van-button type="primary" @click="goToSubmitIssue" class="test-btn">
              访问提交问题页面
            </van-button>
            <span class="step-desc">应该被重定向到留言说明页面</span>
          </div>
          
          <div class="step">
            <span class="step-number">2.</span>
            <van-button type="success" @click="goToGuidelines" class="test-btn">
              直接访问留言说明页面
            </van-button>
            <span class="step-desc">阅读说明并点击同意</span>
          </div>
          
          <div class="step">
            <span class="step-number">3.</span>
            <van-button type="warning" @click="goToSubmitIssueAgain" class="test-btn">
              再次访问提交问题页面
            </van-button>
            <span class="step-desc">应该再次被重定向到留言说明页面</span>
          </div>
        </div>

        <div class="clear-section">
          <h4>重置状态</h4>
          <van-button type="danger" @click="clearStatus" class="test-btn">
            清除所有状态
          </van-button>
        </div>
      </div>

      <div class="log-section">
        <h4>操作日志</h4>
        <div class="log-container">
          <div v-for="(log, index) in logs" :key="index" class="log-item">
            <span class="log-time">{{ log.time }}</span>
            <span class="log-message">{{ log.message }}</span>
          </div>
          <div v-if="logs.length === 0" class="no-logs">
            暂无日志
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'

const router = useRouter()
const isAgreed = ref(false)
const agreementTime = ref('无')
const logs = ref([])

// 添加日志
const addLog = (message) => {
  const now = new Date()
  const timeStr = now.toLocaleTimeString()
  logs.value.unshift({
    time: timeStr,
    message: message
  })
  // 只保留最近10条日志
  if (logs.value.length > 10) {
    logs.value = logs.value.slice(0, 10)
  }
}

// 更新状态
const updateStatus = () => {
  const agreed = sessionStorage.getItem('message_guidelines_agreed_current_session')
  const time = sessionStorage.getItem('message_guidelines_agreed_time')
  
  isAgreed.value = agreed === 'true'
  
  if (time) {
    const date = new Date(parseInt(time))
    agreementTime.value = date.toLocaleString()
  } else {
    agreementTime.value = '无'
  }
  
  addLog(`状态更新: ${isAgreed.value ? '已同意' : '未同意'}`)
}

// 访问提交问题页面
const goToSubmitIssue = () => {
  addLog('尝试访问提交问题页面')
  router.push('/submit-issue')
}

// 访问留言说明页面
const goToGuidelines = () => {
  addLog('访问留言说明页面')
  router.push('/message-guidelines')
}

// 再次访问提交问题页面
const goToSubmitIssueAgain = () => {
  addLog('再次尝试访问提交问题页面')
  router.push('/submit-issue')
}

// 清除状态
const clearStatus = () => {
  sessionStorage.removeItem('message_guidelines_agreed_current_session')
  sessionStorage.removeItem('message_guidelines_agreed_time')
  updateStatus()
  showToast('状态已清除')
  addLog('清除所有状态')
}

onMounted(() => {
  updateStatus()
  addLog('测试页面已加载')
})
</script>

<style scoped>
.flow-test {
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

.test-section,
.log-section {
  background-color: #fff;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

h3, h4 {
  margin: 0 0 12px 0;
  color: #1976d2;
  font-weight: bold;
}

.description {
  color: #666;
  line-height: 1.6;
  margin-bottom: 20px;
}

.current-status {
  margin-bottom: 20px;
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

.test-buttons,
.clear-section {
  margin-bottom: 20px;
}

.step {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  gap: 12px;
}

.step-number {
  font-weight: bold;
  color: #1976d2;
  min-width: 20px;
}

.test-btn {
  min-width: 160px;
}

.step-desc {
  color: #666;
  font-size: 14px;
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

.no-logs {
  color: #999;
  text-align: center;
  padding: 20px;
  font-style: italic;
}
</style>