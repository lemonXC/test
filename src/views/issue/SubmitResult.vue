<template>
  <div class="submit-result-page">
    <!-- 导航栏 -->
    <van-nav-bar title="提交结果" left-text="返回" left-arrow @click-left="goBack" fixed placeholder />

    <!-- 结果内容 -->
    <div class="result-container">
      <!-- 成功图标 -->
      <div class="success-icon">
        <van-icon name="checked" />
      </div>

      <!-- 成功标题 -->
      <div class="success-title">问题提交成功！</div>

      <!-- 已登录用户提示 -->
      <div v-if="isLoggedIn" class="logged-in-tips">
        <div class="tip-item">
          <van-icon name="info-o" />
          <span>可到"我的-<span class="clickable-link" @click="goToIssueManagement">问题管理</span>"查看问题处理进度</span>
        </div>
      </div>

      <div class="query-code-section" v-else>
        <div class="query-code-label">查询码</div>
        <div class="query-code-value">{{ queryCode }}</div>
        <div class="tip-header">
          <van-icon name="info-o" />
          <span style="text-align: left;">请保存好查询码，您可以随时通过以下两种方式查询处理进度：</span>
        </div>
        <div class="tip-list">
          <div class="tip-item">
            <span class="tip-number">1</span>
            <span>凭查询码，在"我有诉求"页面查询</span>
          </div>
          <div class="tip-item">
            <span class="tip-number">2</span>
            <span><span class="clickable-link" @click="goToLogin">登录账号</span>后，在"问题管理"中查询</span>
          </div>
        </div>
      </div>
      <!-- 未登录用户提示 -->
      <!-- <div class="not-logged-in-tips">
        <div class="tip-header">
          <van-icon name="info-o" />
          <span>查询码已发送至您登记的手机号或邮箱，请您注意查收。</span>
        </div>

        <div class="tip-content">
          <div class="tip-subtitle">您可通过以下两种方式查询问题处理进度：</div>
          <div class="tip-list">
            <div class="tip-item">
              <span class="tip-number">1</span>
              <span>凭查询码，在"我有诉求"页面直接查询</span>
            </div>
            <div class="tip-item">
              <span class="tip-number">2</span>
              <span><span class="clickable-link" @click="goToLogin">登录账号</span>后，在"问题管理"模块中查询</span>
            </div>
          </div>
        </div>
      </div> -->
      <div class="countdown-section logged-in-countdown">
        <div class="countdown-text">
          {{ countdown }}秒后自动或手动<span class="clickable-link" @click="goToHome">返回首页</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { authService } from '@/services/authService'

export default {
  name: 'SubmitResultPage',
  setup() {
    const route = useRoute()
    const router = useRouter()

    const issueType = ref(route.query.type || 'complaint')
    const queryCode = ref(route.query.queryCode || '')
    const countdown = ref(5)
    let countdownTimer = null

    // 检查用户登录状态
    const isLoggedIn = computed(() => {
      return authService.isLoggedIn()
    })

    // 获取类型名称
    const getTypeName = (type) => {
      const typeMap = {
        complaint: '我有诉求',
        suggestion: '我要建言',
        consultation: '我要咨询',
        report: '我要爆料'
      }
      return typeMap[type] || '问题反馈'
    }

    // 开始倒计时（所有用户）
    const startCountdown = () => {
      countdownTimer = setInterval(() => {
        countdown.value--
        if (countdown.value <= 0) {
          clearInterval(countdownTimer)
          goToHome()
        }
      }, 1000)
    }

    // 返回上一页
    const goBack = () => {
      router.go(-1)
    }

    // 返回首页
    const goToHome = () => {
      router.push('/')
    }

    // 跳转到问题管理
    const goToIssueManagement = () => {
      router.push('/issue-management')
    }

    // 跳转到诉求页面
    const goToAppeal = () => {
      router.push('/appeal')
    }

    // 跳转到登录页面
    const goToLogin = () => {
      router.push('/login')
    }

    onMounted(() => {
      // 如果没有查询码，返回上一页
      if (!queryCode.value) {
        router.go(-1)
        return
      }

      // 开始倒计时
      // startCountdown()
    })

    onUnmounted(() => {
      if (countdownTimer) {
        clearInterval(countdownTimer)
      }
    })

    return {
      issueType,
      queryCode,
      countdown,
      isLoggedIn,
      getTypeName,
      goBack,
      goToHome,
      goToIssueManagement,
      goToAppeal,
      goToLogin
    }
  }
}
</script>

<style scoped>
.submit-result-page {
  background: #f7f8fa;
  min-height: 100vh;
}

.result-container {
  padding: 40px 20px 20px;
  text-align: center;
}

/* 成功图标 */
.success-icon {
  margin-bottom: 20px;
}

.success-icon .van-icon {
  font-size: 60px;
  color: #07c160;
}

/* 成功标题 */
.success-title {
  font-size: 20px;
  font-weight: bold;
  color: #323233;
  margin-bottom: 30px;
}

/* 查询码区域 */
.query-code-section {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 30px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.query-code-label {
  font-size: 14px;
  color: #646566;
  margin-bottom: 8px;
}

.query-code-value {
  font-size: 24px;
  font-weight: bold;
  color: #323233;
  font-family: 'Courier New', monospace;
  letter-spacing: 2px;
  margin-bottom: 12px;

  text-align: center;
}

.query-code-tip {
  font-size: 12px;
  color: #969799;
}

/* 已登录用户提示 */
.logged-in-tips {
  background: #e8f4ff;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 30px;
}

.logged-in-tips .tip-item {
  display: flex;
  align-items: center;
  color: #1989fa;
  font-size: 14px;
}

.logged-in-tips .van-icon {
  margin-right: 8px;
  font-size: 16px;
}

/* 可点击链接样式 */
.clickable-link {
  color: #1989fa;
  text-decoration: underline;
  cursor: pointer;
  font-weight: 500;
}

.clickable-link:hover {
  color: #0570d9;
  text-decoration: underline;
}

.clickable-link:active {
  color: #0570d9;
}

/* 未登录用户提示 */
.not-logged-in-tips {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  text-align: left;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.tip-header {
  display: flex;
  align-items: flex-start;
  margin-bottom: 6px;
  color: #323233;
  font-size: 14px;
  line-height: 1.5;
}

.tip-header .van-icon {
  margin-right: 8px;
  margin-top: 2px;
  color: #1989fa;
  font-size: 16px;
  flex-shrink: 0;
}

.tip-subtitle {
  font-size: 14px;
  color: #323233;
  margin-bottom: 12px;
  font-weight: 500;
}

.tip-list {
  margin-left: 0;
}

.tip-item {
  display: flex;
  align-items: center;
  margin-bottom: 5px;
  font-size: 14px;
  color: #646566;
  line-height: 1.5;
}

.tip-number {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  background: #1989fa;
  color: white;
  border-radius: 50%;
  font-size: 12px;
  font-weight: bold;
  margin-right: 8px;
  margin-top: 1px;
  flex-shrink: 0;
}

/* 倒计时区域 */
.countdown-section {
  margin-top: 20px;
  padding: 12px;
  background: #fff7e6;
  border-radius: 8px;
  border: 1px solid #ffd591;
}

.countdown-text {
  color: #fa8c16;
  font-size: 14px;
  font-weight: 500;
}

/* 已登录用户倒计时样式 */
.logged-in-countdown {
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid #b3d8ff;
  margin-top: 16px;
}

.logged-in-countdown .countdown-text {
  color: #1989fa;
  font-weight: 600;
}

/* 倒计时区域内的可点击链接样式 */
.countdown-section .clickable-link {
  color: #1989fa;
  text-decoration: underline;
  cursor: pointer;
  font-weight: 600;
}

.countdown-section .clickable-link:hover {
  color: #0570d9;
}

/* 未登录用户倒计时区域内的链接样式（橙色主题） */
.not-logged-in-tips .countdown-section .clickable-link {
  color: #d46b08;
  font-weight: 600;
}

.not-logged-in-tips .countdown-section .clickable-link:hover {
  color: #ad4e00;
}

/* 操作按钮 */
.action-buttons {
  margin-bottom: 30px;
}

.home-button {
  margin-bottom: 12px;
}

.appeal-button {
  border-color: #1989fa;
  color: #1989fa;
}

/* 处理时间提示 */
.process-time-tip {
  font-size: 12px;
  color: #969799;
  line-height: 1.5;
}

span {
  font-size: 16px;
  text-align: left;
}
</style>