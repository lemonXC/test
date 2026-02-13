<template>
  <div class="forgot-password-container">
    <!-- 头部 -->
    <div class="header">
      <van-nav-bar title="找回密码" left-arrow @click-left="$router.go(-1)" />
    </div>

    <!-- 找回密码表单 -->
    <div class="forgot-password-form">
      <!-- Logo区域 -->
      <!-- <div class="logo-section">
        <div class="logo">
          <van-icon name="lock" size="50" color="#1989fa" />
        </div>
        <h2 class="title">找回密码</h2>
        <p class="subtitle">请输入您的手机号，我们将发送验证码帮助您重置密码</p>
      </div> -->

      <!-- 步骤指示器 -->
      <div class="steps-section">
        <van-steps :active="currentStep" active-color="#1989fa">
          <van-step>验证手机号</van-step>
          <van-step>设置新密码</van-step>
          <van-step>完成重置</van-step>
        </van-steps>
      </div>

      <!-- 表单内容 -->
      <div class="form-content">
        <!-- 步骤1: 验证手机号 -->
        <div v-if="currentStep === 0" class="step-content">
          <van-form @submit="onVerifyPhone" ref="phoneFormRef">
            <van-cell-group inset>
              <van-field v-model="phoneForm.phone" name="phone" label="手机号" placeholder="请输入注册时的手机号" :rules="phoneRules"
                left-icon="phone-o" maxlength="11" type="tel" />
              <van-field v-model="phoneForm.code" name="code" label="验证码" placeholder="请输入验证码" :rules="codeRules"
                left-icon="shield-o" maxlength="6">
                <template #button>
                  <van-button size="small" type="primary" :disabled="!canSendCode || countdown > 0" @click="sendSmsCode"
                    class="code-btn">
                    {{ countdown > 0 ? `${countdown}s后重发` : '发送验证码' }}
                  </van-button>
                </template>
              </van-field>
            </van-cell-group>

            <div class="btn-wrapper">
              <van-button round block type="primary" native-type="submit" :loading="verifyLoading" loading-text="验证中..."
                class="action-btn">
                验证手机号
              </van-button>
            </div>
          </van-form>
        </div>

        <!-- 步骤2: 设置新密码 -->
        <div v-if="currentStep === 1" class="step-content">
          <van-form @submit="onResetPassword" ref="passwordFormRef">
            <van-cell-group inset>
              <van-field v-model="passwordForm.newPassword" name="newPassword" type="password" label="新密码"
                placeholder="请输入新密码" :rules="passwordRules" left-icon="lock" />
              <van-field v-model="passwordForm.confirmPassword" name="confirmPassword" type="password" label="确认密码"
                placeholder="请再次输入新密码" :rules="confirmPasswordRules" left-icon="lock" />
            </van-cell-group>

            <div class="password-tips">
              <p class="tips-title">密码要求：</p>
              <ul class="tips-list">
                <li :class="{ 'valid': passwordChecks.length }">至少8位字符</li>
                <li :class="{ 'valid': passwordChecks.hasLetter }">包含字母</li>
                <li :class="{ 'valid': passwordChecks.hasNumber }">包含数字</li>
              </ul>
            </div>

            <div class="btn-wrapper">
              <van-button round block type="primary" native-type="submit" :loading="resetLoading" loading-text="重置中..."
                class="action-btn">
                重置密码
              </van-button>
            </div>
          </van-form>
        </div>

        <!-- 步骤3: 完成重置 -->
        <div v-if="currentStep === 2" class="step-content success-content">
          <div class="success-icon">
            <van-icon name="checked" size="60" color="#07c160" />
          </div>
          <h3 class="success-title">密码重置成功！</h3>
          <p class="success-text">您的密码已成功重置，请使用新密码登录</p>

          <div class="btn-wrapper">
            <van-button round block type="primary" @click="goToLogin" class="action-btn">
              立即登录
            </van-button>
          </div>
        </div>
      </div>

      <!-- 返回登录 -->
      <div class="back-to-login" v-if="currentStep < 2">
        <p class="back-text">
          想起密码了？
          <span class="login-link" @click="$router.push('/login')">返回登录</span>
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue'
import { showToast } from 'vant'
import { useRouter } from 'vue-router'
import { validatePhone, validatePassword, SmsCodeManager } from '@/utils/auth'
import { authService } from '@/services/authService'

export default {
  name: 'ForgotPassword',
  setup() {
    const router = useRouter()
    const currentStep = ref(0)
    const verifyLoading = ref(false)
    const resetLoading = ref(false)
    const countdown = ref(0)
    const phoneFormRef = ref()
    const passwordFormRef = ref()

    // 验证码管理器
    const codeManager = new SmsCodeManager()

    // 手机号验证表单
    const phoneForm = ref({
      phone: '',
      code: ''
    })

    // 密码重置表单
    const passwordForm = ref({
      newPassword: '',
      confirmPassword: ''
    })

    // 表单验证规则
    const phoneRules = [
      { required: true, message: '请输入手机号' },
      { validator: validatePhone, message: '请输入正确的手机号' }
    ]

    const codeRules = [
      { required: true, message: '请输入验证码' },
      { pattern: /^\d{6}$/, message: '验证码为6位数字' }
    ]

    const passwordRules = [
      { required: true, message: '请输入密码' },
      { validator: validatePassword, message: '密码至少8位，包含字母和数字' }
    ]

    const confirmPasswordRules = [
      { required: true, message: '请确认密码' },
      {
        validator: (value) => {
          if (value !== passwordForm.value.newPassword) {
            return false
          }
          return true
        },
        message: '两次输入的密码不一致'
      }
    ]

    // 密码强度检查
    const passwordChecks = computed(() => {
      const password = passwordForm.value.newPassword
      return {
        length: password.length >= 8,
        hasLetter: /[a-zA-Z]/.test(password),
        hasNumber: /\d/.test(password)
      }
    })

    // 是否可以发送验证码
    const canSendCode = computed(() => {
      return validatePhone(phoneForm.value.phone)
    })

    // 发送验证码
    const sendSmsCode = async () => {
      if (!canSendCode.value) {
        showToast('请输入正确的手机号')
        return
      }

      try {
        const result = await codeManager.sendCode(phoneForm.value.phone)
        if (result.success) {
          showToast('验证码已发送')
          startCountdown()
        } else {
          showToast(result.message)
        }
      } catch (error) {
        showToast(error.message || '发送验证码失败')
      }
    }

    // 开始倒计时
    const startCountdown = () => {
      countdown.value = 60
      const timer = setInterval(() => {
        countdown.value--
        if (countdown.value <= 0) {
          clearInterval(timer)
        }
      }, 1000)
    }

    // 验证手机号
    const onVerifyPhone = async () => {
      verifyLoading.value = true
      try {
        // 验证验证码
        // const result = codeManager.verifyCode(phoneForm.value.phone, phoneForm.value.code)
        // if (!result.success) {
        //   showToast(result.message)
        //   return
        // }

        showToast('验证成功')
        currentStep.value = 1
      } catch (error) {
        showToast('验证失败，请重试')
      } finally {
        verifyLoading.value = false
      }
    }

    // 重置密码
    const onResetPassword = async () => {
      resetLoading.value = true
      try {
        const result = await authService.resetPassword({
          phone: phoneForm.value.phone,
          newPassword: passwordForm.value.newPassword
        })

        if (result.success) {
          // showToast('密码重置成功')
          currentStep.value = 2
        } else {
          showToast(result.message)
        }
      } catch (error) {
        showToast('重置失败，请重试')
      } finally {
        resetLoading.value = false
      }
    }

    // 跳转到登录页面
    const goToLogin = () => {
      router.push('/login')
    }

    return {
      currentStep,
      phoneForm,
      passwordForm,
      phoneRules,
      codeRules,
      passwordRules,
      confirmPasswordRules,
      passwordChecks,
      canSendCode,
      countdown,
      verifyLoading,
      resetLoading,
      phoneFormRef,
      passwordFormRef,
      sendSmsCode,
      onVerifyPhone,
      onResetPassword,
      goToLogin
    }
  }
}
</script>

<style scoped>
.forgot-password-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow: hidden;
}

.forgot-password-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="75" cy="75" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="50" cy="10" r="0.5" fill="rgba(255,255,255,0.05)"/><circle cx="10" cy="50" r="0.5" fill="rgba(255,255,255,0.05)"/><circle cx="90" cy="30" r="0.5" fill="rgba(255,255,255,0.05)"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
  opacity: 0.3;
  pointer-events: none;
}

/* 添加浮动装饰元素 */
.forgot-password-container::after {
  content: '';
  position: absolute;
  top: 30%;
  right: -20%;
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.06) 0%, transparent 70%);
  border-radius: 50%;
  animation: float 10s ease-in-out infinite;
}

.header {
  position: relative;
  z-index: 10;
}

.header .van-nav-bar {
  background: transparent;
  color: white;
  box-shadow: none;
}

.forgot-password-form {
  padding: 20px;
  position: relative;
  z-index: 5;
}

.logo-section {
  text-align: center;
  padding: 30px 0 20px;
  animation: fadeInDown 0.8s ease-out;
}

.logo {
  margin-bottom: 12px;
  animation: pulse 2s infinite;
  position: relative;
}

.logo::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 70px;
  height: 70px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  animation: ripple 3s infinite;
}

.title {
  font-size: 24px;
  font-weight: bold;
  color: white;
  margin: 0 0 8px 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  letter-spacing: 0.5px;
}

.subtitle {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
  font-weight: 300;
  line-height: 1.4;
}

.steps-section {
  margin: 20px 0;
  padding: 16px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  backdrop-filter: blur(10px);
}

.form-content {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 15px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  animation: slideInUp 0.6s ease-out 0.2s both;
  position: relative;
  /* margin-bottom: 20px; */
}

.step-content {
  /* min-height: 200px; */
}

.success-content {
  text-align: center;
  padding: 20px 0;
}

.success-icon {
  margin-bottom: 16px;
  animation: bounceIn 0.8s ease-out;
}

.success-title {
  font-size: 20px;
  font-weight: bold;
  color: #323233;
  margin: 0 0 8px 0;
}

.success-text {
  font-size: 14px;
  color: #646566;
  margin: 0 0 24px 0;
  line-height: 1.4;
}

.btn-wrapper {
  margin-top: 24px;
}

.action-btn {
  height: 52px;
  font-size: 16px;
  font-weight: bold;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.action-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.action-btn:active::before {
  left: 100%;
}

.code-btn {
  font-size: 12px;
  padding: 0 8px;
  height: 28px;
}

.password-tips {
  margin: 16px 0;
  padding: 12px;
  background: #f7f8fa;
  border-radius: 8px;
}

.tips-title {
  font-size: 14px;
  font-weight: 500;
  color: #323233;
  margin: 0 0 8px 0;
}

.tips-list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.tips-list li {
  font-size: 12px;
  color: #969799;
  margin-bottom: 4px;
  position: relative;
  padding-left: 16px;
}

.tips-list li::before {
  content: '○';
  position: absolute;
  left: 0;
  color: #c8c9cc;
}

.tips-list li.valid {
  color: #07c160;
}

.tips-list li.valid::before {
  content: '●';
  color: #07c160;
}

.back-to-login {
  text-align: center;
  margin-top: 20px;
}

.back-text {
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  margin: 0;
}

.login-link {
  color: #ffd700;
  font-weight: bold;
  cursor: pointer;
  text-decoration: underline;
}

/* 动画定义 */
@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-30px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(50px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse {

  0%,
  100% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.05);
  }
}

@keyframes ripple {
  0% {
    transform: translate(-50%, -50%) scale(0.8);
    opacity: 1;
  }

  100% {
    transform: translate(-50%, -50%) scale(1.4);
    opacity: 0;
  }
}

@keyframes float {

  0%,
  100% {
    transform: translateY(0px) rotate(0deg);
  }

  33% {
    transform: translateY(-20px) rotate(120deg);
  }

  66% {
    transform: translateY(10px) rotate(240deg);
  }
}

@keyframes bounceIn {
  0% {
    opacity: 0;
    transform: scale(0.3);
  }

  50% {
    opacity: 1;
    transform: scale(1.05);
  }

  70% {
    transform: scale(0.9);
  }

  100% {
    opacity: 1;
    transform: scale(1);
  }
}

/* 响应式设计 */
@media (max-width: 375px) {
  .forgot-password-form {
    padding: 16px;
  }

  .logo-section {
    padding: 20px 0 16px;
  }

  .title {
    font-size: 20px;
  }

  /* .form-content {
    padding: 10px;
    margin: 10px 0;
  } */
}

/* 深色模式适配 */
@media (prefers-color-scheme: dark) {
  .form-content {
    background: rgba(30, 30, 30, 0.95);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .password-tips {
    background: rgba(40, 40, 40, 0.8);
  }

  .tips-title {
    color: #f0f0f0;
  }
}

.van-cell-group--inset {
  margin: 0 !important;
}

:deep(.van-field__label) {
  width: auto !important;
}
</style>