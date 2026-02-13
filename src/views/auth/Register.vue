<template>
  <div class="register-container">
    <!-- 头部 -->
    <div class="header">
      <van-nav-bar
        title="用户注册"
        left-arrow
        @click-left="$router.go(-1)"
      />
    </div>

    <!-- 注册表单 -->
    <div class="register-form">

      <!-- 表单内容 -->
      <div class="form-content">
        <van-form @submit="onSubmit" ref="formRef">
          <van-cell-group inset>
            <!-- 必填字段 -->
            <!-- <div class="section-title">
              <span class="required-mark">*</span>
              <span>必填信息</span>
            </div> -->
            
            <van-field
              v-model="form.username"
              name="username"
              label="用户名"
              placeholder="请输入用户名"
              :rules="usernameRules"
              left-icon="contact"
              maxlength="20"
            />
            
            <van-field
              v-model="form.phone"
              name="phone"
              label="手机号"
              placeholder="请输入手机号"
              :rules="phoneRules"
              left-icon="phone-o"
              maxlength="11"
              type="tel"
            />
            
            <van-field
              v-model="form.code"
              name="code"
              label="验证码"
              placeholder="请输入验证码"
              :rules="codeRules"
              left-icon="shield-o"
              maxlength="6"
            >
              <template #button>
                <van-button
                  size="small"
                  type="primary"
                  :disabled="!canSendCode || countdown > 0"
                  @click="sendSmsCode"
                  class="code-btn"
                >
                  {{ countdown > 0 ? `${countdown}s后重发` : '发送验证码' }}
                </van-button>
              </template>
            </van-field>
            
            <van-field
              v-model="form.password"
              name="password"
              type="password"
              label="密码"
              placeholder="请输入密码"
              :rules="passwordRules"
              left-icon="lock"
            />
            
            <van-field
              v-model="form.confirmPassword"
              name="confirmPassword"
              type="password"
              label="确认密码"
              placeholder="请再次输入密码"
              :rules="confirmPasswordRules"
              left-icon="lock"
            />
          </van-cell-group>

          <van-cell-group inset style="margin-top: 16px;">
            <!-- 选填字段 -->
            <!-- <div class="section-title">
              <span class="optional-mark">选填</span>
              <span>个人信息</span>
            </div> -->
            
            <van-field
              v-model="form.email"
              name="email"
              label="邮箱"
              placeholder="请输入邮箱地址（选填）"
              :rules="emailRules"
              left-icon="envelop-o"
              type="email"
            />
            
            <van-field
              v-model="form.gender"
              name="gender"
              label="性别"
              placeholder="请选择性别"
              left-icon="friends-o"
              readonly
              is-link
              @click="showGenderPicker = true"
            />
            
            <van-field
              v-model="form.birthday"
              name="birthday"
              label="生日"
              placeholder="请选择生日"
              left-icon="calendar-o"
              readonly
              is-link
              @click="showDatePicker = true"
            />
          </van-cell-group>

          <!-- 协议同意 -->
          <div class="agreement-section">
            <van-checkbox v-model="agreeTerms" icon-size="14px">
              我已阅读并同意
              <span class="link-text" @click="showUserAgreement">《用户协议》</span>
              和
              <span class="link-text" @click="showPrivacyPolicy">《隐私政策》</span>
            </van-checkbox>
          </div>

          <!-- 注册按钮 -->
          <div class="register-btn-wrapper">
            <van-button
              round
              block
              type="primary"
              native-type="submit"
              :loading="loading"
              loading-text="注册中..."
              :disabled="!agreeTerms"
              class="register-btn"
            >
              立即注册
            </van-button>
          </div>
        </van-form>

        <!-- 登录链接 -->
        <div class="login-section">
          <p class="login-text">
            已有账号？
            <span class="login-link" @click="goToLogin">立即登录</span>
          </p>
        </div>
      </div>
    </div>

    <!-- 性别选择器 -->
    <van-popup v-model:show="showGenderPicker" position="bottom">
      <van-picker
        :columns="genderColumns"
        @confirm="onGenderConfirm"
        @cancel="showGenderPicker = false"
      />
    </van-popup>

    <!-- 日期选择器 -->
    <van-popup v-model:show="showDatePicker" position="bottom">
      <van-date-picker
        v-model="currentDate"
        @confirm="onDateConfirm"
        @cancel="showDatePicker = false"
        :min-date="minDate"
        :max-date="maxDate"
      />
    </van-popup>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showSuccessToast, showDialog } from 'vant'
import authService from '@/services/authService'

const router = useRouter()

// 响应式数据
const loading = ref(false)
const countdown = ref(0)
const agreeTerms = ref(false)
const showGenderPicker = ref(false)
const showDatePicker = ref(false)
const formRef = ref()

// 表单数据
const form = reactive({
  username: '',
  phone: '',
  code: '',
  password: '',
  confirmPassword: '',
  email: '',
  gender: '',
  birthday: ''
})

// 日期相关
const currentDate = ref(new Date())
const minDate = new Date(1900, 0, 1)
const maxDate = new Date()

// 性别选项
const genderColumns = [
  { text: '男', value: 'male' },
  { text: '女', value: 'female' },
  { text: '保密', value: 'secret' }
]

// 验证规则
const usernameRules = [
  { required: true, message: '请输入用户名' },
  { min: 3, max: 20, message: '用户名长度为3-20个字符' },
  { pattern: /^[a-zA-Z0-9_\u4e00-\u9fa5]+$/, message: '用户名只能包含字母、数字、下划线和中文' }
]

const phoneRules = [
  { required: true, message: '请输入手机号' },
  { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' }
]

const codeRules = [
  { required: true, message: '请输入验证码' },
  { pattern: /^\d{6}$/, message: '验证码为6位数字' }
]

const passwordRules = [
  { required: true, message: '请输入密码' },
  { min: 8, message: '密码至少8位字符' },
  { pattern: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/, message: '密码需包含字母和数字' }
]

const confirmPasswordRules = [
  { required: true, message: '请确认密码' },
  {
    validator: (value) => {
      if (value !== form.password) {
        return '两次输入的密码不一致'
      }
      return true
    }
  }
]

const emailRules = [
  {
    validator: (value) => {
      if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        return '请输入正确的邮箱地址'
      }
      return true
    }
  }
]

// 计算属性
const canSendCode = computed(() => {
  return /^1[3-9]\d{9}$/.test(form.phone)
})

// 方法
const sendSmsCode = async () => {
  if (!canSendCode.value) {
    showToast('请输入正确的手机号')
    return
  }

  try {
    // 调用实际的认证服务发送验证码
    const result = await authService.sendSmsCode(form.phone)
    
    if (result.success) {
      showToast('验证码已发送')
      
      // 开始倒计时
      countdown.value = 60
      const timer = setInterval(() => {
        countdown.value--
        if (countdown.value <= 0) {
          clearInterval(timer)
        }
      }, 1000)
    } else {
      showToast(result.message || '发送失败，请重试')
    }
    
  } catch (error) {
    console.error('发送验证码错误:', error)
    showToast('发送失败，请重试')
  }
}

const onGenderConfirm = (value) => {
  if (value && value.selectedOptions && value.selectedOptions.length > 0) {
    form.gender = value.selectedOptions[0]?.text || ''
  }
  showGenderPicker.value = false
}

const onDateConfirm = (value) => {
  const year = value.getFullYear()
  const month = String(value.getMonth() + 1).padStart(2, '0')
  const day = String(value.getDate()).padStart(2, '0')
  form.birthday = `${year}-${month}-${day}`
  showDatePicker.value = false
}

const onSubmit = async () => {
  if (!agreeTerms.value) {
    showToast('请先同意用户协议和隐私政策')
    return
  }

  loading.value = true
  
  try {
    // 调用实际的认证服务进行注册
    const result = await authService.register({
      username: form.username,
      phone: form.phone,
      code: form.code,
      password: form.password,
      email: form.email,
      gender: form.gender,
      birthday: form.birthday
    })
    
    if (result.success) {
      showSuccessToast('注册成功')
      
      // 注册成功后跳转到登录页
      setTimeout(() => {
        router.push('/login')
      }, 1000)
    } else {
      showToast(result.message || '注册失败，请重试')
    }
    
  } catch (error) {
    console.error('注册错误:', error)
    showToast('注册失败，请重试')
  } finally {
    loading.value = false
  }
}

const goToLogin = () => {
  router.push('/login')
}

const showUserAgreement = () => {
  showDialog({
    title: '用户协议',
    message: '这里是用户协议的内容...',
    confirmButtonText: '我知道了'
  })
}

const showPrivacyPolicy = () => {
  showDialog({
    title: '隐私政策',
    message: '这里是隐私政策的内容...',
    confirmButtonText: '我知道了'
  })
}
</script>

<style scoped>
.register-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow: hidden;
}

.register-container::before {
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
.register-container::after {
  content: '';
  position: absolute;
  top: 20%;
  left: -15%;
  width: 250px;
  height: 250px;
  background: radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%);
  border-radius: 50%;
  animation: float 8s ease-in-out infinite reverse;
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

.register-form {
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
  background: rgba(255,255,255,0.1);
  border-radius: 50%;
  animation: ripple 3s infinite;
}

.title {
  font-size: 24px;
  font-weight: bold;
  color: white;
  margin: 0 0 8px 0;
  text-shadow: 0 2px 4px rgba(0,0,0,0.3);
  letter-spacing: 0.5px;
}

.subtitle {
  font-size: 14px;
  color: rgba(255,255,255,0.9);
  margin: 0;
  font-weight: 300;
}

.form-content {
  background: rgba(255,255,255,0.95);
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.15);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255,255,255,0.2);
  animation: slideInUp 0.6s ease-out 0.2s both;
  position: relative;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  padding: 0 16px;
  font-size: 14px;
  font-weight: bold;
  color: #323233;
}

.required-mark {
  color: #ee0a24;
  font-size: 16px;
}

.optional-mark {
  background: #1989fa;
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
}

.code-btn {
  font-size: 12px;
  padding: 0 8px;
  height: 28px;
}

.agreement-section {
  margin: 20px 0;
  padding: 0 4px;
  font-size: 14px;
}

.link-text {
  color: #1989fa;
  cursor: pointer;
  text-decoration: underline;
}

.register-btn-wrapper {
  margin-top: 24px;
}

.register-btn {
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

.register-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
  transition: left 0.5s;
}

.register-btn:active::before {
  left: 100%;
}

.register-btn:disabled {
  background: #c8c9cc;
  border-color: #c8c9cc;
  box-shadow: none;
}

.login-section {
  text-align: center;
  margin-top: 20px;
}

.login-text {
  color: #646566;
  font-size: 14px;
  margin: 0;
}

.login-link {
  color: #1989fa;
  font-weight: bold;
  cursor: pointer;
  text-decoration: underline;
}

/* 表单字段样式优化 */
:deep(.van-field__label) {
  width: 56px;
  font-weight: 500;
}

:deep(.van-field__control) {
  font-size: 14px;
}

:deep(.van-field--error .van-field__control) {
  color: #ee0a24;
}

/* 响应式设计 */
@media (max-width: 375px) {
  .register-form {
    padding: 16px;
  }
  
  .logo-section {
    padding: 20px 0 16px;
  }
  
  .title {
    font-size: 20px;
  }
  
  .form-content {
    padding: 16px;
  }
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
  0%, 100% {
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
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
  }
  33% {
    transform: translateY(-20px) rotate(120deg);
  }
  66% {
    transform: translateY(10px) rotate(240deg);
  }
}

/* 深色模式适配 */
@media (prefers-color-scheme: dark) {
  .form-content {
    background: rgba(30, 30, 30, 0.95);
    border: 1px solid rgba(255,255,255,0.1);
  }
  
  .section-title {
    color: #f0f0f0;
  }
  
  .login-text {
    color: #969799;
  }
}

::v-deep(.van-cell-group--inset) {
  margin: 0 !important;
}
</style>