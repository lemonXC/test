<template>
  <div class="test-guidelines-page">
    <van-nav-bar title="测试留言说明流程" left-text="返回" left-arrow @click-left="$router.go(-1)" fixed placeholder />
    
    <div class="test-container">
      <van-cell-group inset title="当前状态">
        <van-cell title="是否已同意留言说明" :value="agreementStatus" />
        <van-cell title="同意时间" :value="agreementTime" />
      </van-cell-group>
      
      <van-cell-group inset title="测试操作">
        <van-cell title="清除同意状态" is-link @click="clearAgreement" />
        <van-cell title="设置已同意状态" is-link @click="setAgreement" />
      </van-cell-group>
      
      <van-cell-group inset title="测试链接">
        <van-cell title="直接访问提交问题页面" is-link @click="goToSubmitIssue" />
        <van-cell title="访问留言说明页面" is-link @click="goToGuidelines" />
      </van-cell-group>
      
      <div class="test-instructions">
        <h3>测试说明：</h3>
        <p><strong>重要：</strong>现在每次新的浏览器会话都需要重新阅读留言说明！</p>
        <p>1. 点击"清除同意状态"后，再点击"直接访问提交问题页面"，应该会自动跳转到留言说明页面</p>
        <p>2. 在留言说明页面等待5秒倒计时结束，点击"确认"按钮，应该会跳转到提交问题页面</p>
        <p>3. 设置已同意状态后，可以直接访问提交问题页面（仅限当前会话）</p>
        <p>4. <strong>刷新页面或重新打开浏览器后，需要重新阅读留言说明</strong></p>
        <p>5. 这确保了每次访问提交问题页面前都必须先阅读留言说明</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'

const router = useRouter()
const agreementStatus = ref('未同意')
const agreementTime = ref('无')

// 更新状态显示
const updateStatus = () => {
  const agreed = sessionStorage.getItem('message_guidelines_agreed_current_session')
  const time = sessionStorage.getItem('message_guidelines_agreed_time')
  
  agreementStatus.value = agreed === 'true' ? '已同意（当前会话）' : '未同意'
  
  if (time) {
    const date = new Date(parseInt(time))
    agreementTime.value = date.toLocaleString()
  } else {
    agreementTime.value = '无'
  }
}

// 清除同意状态
const clearAgreement = () => {
  sessionStorage.removeItem('message_guidelines_agreed_current_session')
  sessionStorage.removeItem('message_guidelines_agreed_time')
  updateStatus()
  showToast('已清除同意状态')
}

// 设置已同意状态
const setAgreement = () => {
  sessionStorage.setItem('message_guidelines_agreed_current_session', 'true')
  sessionStorage.setItem('message_guidelines_agreed_time', Date.now().toString())
  updateStatus()
  showToast('已设置为同意状态')
}

// 跳转到提交问题页面
const goToSubmitIssue = () => {
  router.push('/submit-issue')
}

// 跳转到留言说明页面
const goToGuidelines = () => {
  router.push('/message-guidelines')
}

onMounted(() => {
  updateStatus()
})
</script>

<style scoped>
.test-guidelines-page {
  min-height: 100vh;
  background-color: #f7f8fa;
}

.test-container {
  padding: 16px;
}

.test-instructions {
  margin-top: 20px;
  padding: 16px;
  background: white;
  border-radius: 8px;
}

.test-instructions h3 {
  margin: 0 0 12px 0;
  color: #323233;
  font-size: 16px;
  font-weight: 600;
}

.test-instructions p {
  margin: 8px 0;
  color: #646566;
  font-size: 14px;
  line-height: 1.5;
}
</style>