<template>
  <div class="login-container">

    <!-- 登录表单 -->
    <div class="login-form">
      <!-- Logo区域 -->
      <div class="logo-section">
        <div class="logo">
          <van-icon name="user-circle-o" size="60" color="#1989fa" />
        </div>
        <!-- <h2 class="app-name">智慧城市</h2>
        <p class="welcome-text">欢迎登录</p> -->
      </div>

      <!-- 主要登录表单 -->
      <div class="main-login-form">
        <!-- 用户名+密码登录 -->
        <div class="form-content">
          <van-form @submit="onPasswordLogin">
            <van-cell-group inset>
              <van-field
                v-model="passwordForm.username"
                name="username"
                label="用户名"
                placeholder="请输入用户名/手机号"
                :rules="usernameRules"
                left-icon="contact"
              />
              <van-field
                v-model="passwordForm.password"
                name="password"
                type="password"
                label="密码"
                placeholder="请输入密码"
                :rules="passwordRules"
                left-icon="lock"
              />
            </van-cell-group>
            
            <div class="login-options">
              <van-checkbox v-model="rememberMe" style="font-size: 14px;">记住密码</van-checkbox>
              <span class="forgot-password" @click="onForgotPassword">忘记密码？</span>
            </div>
            
            <div class="login-btn-wrapper">
              <van-button
                round
                block
                type="primary"
                native-type="submit"
                :loading="passwordLoading"
                loading-text="登录中..."
                class="login-btn"
              >
                登录
              </van-button>
            </div>
          </van-form>
        </div>
      </div>

      <!-- 注册链接 -->
      <div class="register-section">
        <p class="register-text">
          还没有账号？
          <span class="register-link" @click="goToRegister">立即注册</span>
        </p>
      </div>

      <!-- 角色快捷登录 -->
      <div class="quick-login">
        <div class="divider">
          <span>角色快捷登录</span>
        </div>
        <div class="role-login-grid">
          <div 
            v-for="role in quickLoginRoles" 
            :key="role.type"
            class="role-item" 
            @click="quickLogin(role)"
          >
            <van-icon :name="role.icon" size="20" :color="role.color" />
            <span>{{ role.name }}</span>
          </div>
        </div>
      </div>

      <!-- 其他登录方式 -->
      <div class="other-login">
        <div class="divider">
          <span>其他登录方式</span>
        </div>
        <div class="social-login">
          <div class="social-item" @click="showSmsLogin">
            <van-icon name="chat-o" size="24" color="#1989fa" />
            <span>验证码登录</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 验证码登录弹窗 -->
    <van-popup 
      v-model:show="showSmsPopup" 
      position="bottom" 
      :style="{ height: '60%' }"
      round
      closeable
      close-icon-position="top-right"
    >
      <div class="sms-login-popup">
        <div class="popup-header">
          <h3>验证码登录</h3>
        </div>
        <div class="popup-content">
          <van-form @submit="onSmsLogin">
            <van-cell-group inset>
              <van-field
                v-model="smsForm.phone"
                name="phone"
                label="手机号"
                placeholder="请输入手机号"
                :rules="phoneRules"
                left-icon="phone-o"
                maxlength="11"
                type="tel"
              />
              <van-field
                v-model="smsForm.code"
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
            </van-cell-group>
            
            <div class="login-btn-wrapper">
              <van-button
                round
                block
                type="primary"
                native-type="submit"
                :loading="smsLoading"
                loading-text="登录中..."
                class="login-btn"
              >
                登录
              </van-button>
            </div>
          </van-form>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showSuccessToast } from 'vant'
import authService from '@/services/authService'

const router = useRouter()

// 响应式数据
const countdown = ref(0)
const smsLoading = ref(false)
const passwordLoading = ref(false)
const rememberMe = ref(false)
const showSmsPopup = ref(false)

// 表单数据
const smsForm = ref({
  phone: '',
  code: ''
})

const passwordForm = ref({
  username: '',
  password: ''
})

// 验证规则
const phoneRules = [
  { required: true, message: '请输入手机号' },
  { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' }
]

const codeRules = [
  { required: true, message: '请输入验证码' },
  { pattern: /^\d{6}$/, message: '验证码为6位数字' }
]

const usernameRules = [
  { required: true, message: '请输入用户名' },
  { min: 3, message: '用户名至少3位字符' }
]

const passwordRules = [
  { required: true, message: '请输入密码' },
  { min: 8, message: '密码至少8位字符' },
  { pattern: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/, message: '密码需包含字母和数字' }
]

// 角色快捷登录配置
const quickLoginRoles = ref([
  {
    type: 'political_operator',
    name: '问政操作员',
    icon: 'guide-o',
    color: '#ff9f1c',
    username: '问政操作员',
    password: 'Operator123'
  },
  {
    type: 'department_operator',
    name: '部门操作员',
    icon: 'manager-o',
    color: '#ff6b35',
    username: '部门操作员',
    password: 'Operator123'
  },
  {
    type: 'grid_worker', 
    name: '网格员',
    icon: 'location-o',
    color: '#07c160',
    username: '网格员小王',
    password: 'Grid123'
  },
  {
    type: 'expert',
    name: '专家',
    icon: 'certificate',
    color: '#1989fa',
    username: '专家李教授', 
    password: 'Expert123'
  },
  {
    type: 'ordinary_user',
    name: '普通用户',
    icon: 'friends-o',
    color: '#323233',
    username: '市民张三',
    password: 'User123'
  }
])

// 计算属性
const canSendCode = computed(() => {
  return /^1[3-9]\d{9}$/.test(smsForm.value.phone)
})

// 方法
const sendSmsCode = async () => {
  if (!canSendCode.value) {
    showToast('请输入正确的手机号')
    return
  }

  try {
    // 调用实际的认证服务发送验证码
    const result = await authService.sendSmsCode(smsForm.value.phone)
    
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

const onSmsLogin = async () => {
  smsLoading.value = true
  
  try {
    // 调用实际的认证服务进行短信登录
    const result = await authService.loginWithSms(
      smsForm.value.phone, 
      smsForm.value.code
    )
    
    if (result.success) {
      showSuccessToast('登录成功')
      
      // 关闭弹窗
      showSmsPopup.value = false
      
      // 登录成功后跳转
      setTimeout(() => {
        router.push('/profile')
      }, 1000)
    } else {
      showToast(result.message || '登录失败，请重试')
    }
    
  } catch (error) {
    console.error('短信登录错误:', error)
    showToast('登录失败，请重试')
  } finally {
    smsLoading.value = false
  }
}

const onPasswordLogin = async () => {
  passwordLoading.value = true
  
  try {
    // 调用实际的认证服务进行登录
    const result = await authService.loginWithPassword(
      passwordForm.value.username, 
      passwordForm.value.password
    )
    
    if (result.success) {
      // 设置登录状态
      localStorage.setItem('isLoggedIn', 'true')
      
      // 设置用户角色
      const userRole = result.data.user.role
      localStorage.setItem('selectedUserRole', userRole)
      
      console.log('登录成功，设置用户角色:', userRole)
      
      showSuccessToast('登录成功')
      
      // 登录成功后跳转
      setTimeout(() => {
        router.push('/profile')
      }, 1000)
    } else {
      showToast(result.message || '登录失败，请重试')
    }
    
  } catch (error) {
    console.error('登录错误:', error)
    showToast('登录失败，请重试')
  } finally {
    passwordLoading.value = false
  }
}

const onForgotPassword = () => {
  router.push('/forgot-password')
}

const goToRegister = () => {
  router.push('/register')
}

const showSmsLogin = () => {
  showSmsPopup.value = true
}

const quickLogin = async (role) => {
  // 清除localStorage中的用户数据，强制重新初始化
  localStorage.removeItem('mockUsers')
  
  passwordForm.value.username = role.username
  passwordForm.value.password = role.password
  
  showToast(`正在以${role.name}身份登录...`)
  
  // 自动执行登录
  await onPasswordLogin()
}

// 生命周期
onMounted(() => {
  // 检查是否有记住的登录信息
  const savedUsername = localStorage.getItem('rememberedUsername')
  if (savedUsername) {
    passwordForm.value.username = savedUsername
    rememberMe.value = true
  }
})
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow: hidden;
}

.login-container::before {
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
.login-container::after {
  content: '';
  position: absolute;
  top: 10%;
  right: -10%;
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
  border-radius: 50%;
  animation: float 6s ease-in-out infinite;
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

.login-form {
  padding: 20px;
  min-height: calc(100vh - 46px);
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 5;
}

.logo-section {
  text-align: center;
  padding: 40px 0 30px;
  animation: fadeInDown 0.8s ease-out;
}

.logo {
  margin-bottom: 16px;
  animation: pulse 2s infinite;
  position: relative;
}

.logo::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80px;
  height: 80px;
  background: rgba(255,255,255,0.1);
  border-radius: 50%;
  animation: ripple 3s infinite;
}

.app-name {
  font-size: 28px;
  font-weight: bold;
  color: white;
  margin: 0 0 8px 0;
  text-shadow: 0 2px 4px rgba(0,0,0,0.3);
  letter-spacing: 1px;
}

.welcome-text {
  font-size: 16px;
  color: rgba(255,255,255,0.9);
  margin: 0;
  font-weight: 300;
}

.login-tabs {
  flex: 1;
  background: rgba(255,255,255,0.95);
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0,0,0,0.15);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255,255,255,0.2);
  animation: slideInUp 0.6s ease-out 0.2s both;
}

.form-content {
  padding: 15px;
  position: relative;
}

.login-btn-wrapper {
  margin-top: 24px;
}

.login-btn {
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

.login-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
  transition: left 0.5s;
}

.login-btn:active::before {
  left: 100%;
}

.code-btn {
  font-size: 12px;
  padding: 0 8px;
  height: 28px;
}

.login-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 16px 0;
  padding: 0 4px;
}

.forgot-password {
  color: #1989fa;
  font-size: 14px;
  cursor: pointer;
}

.register-section {
  text-align: center;
  margin-top: 20px;
}

.register-text {
  color: rgba(255,255,255,0.8);
  font-size: 14px;
  margin: 0;
}

.register-link {
  color: #ffd700;
  font-weight: bold;
  cursor: pointer;
  text-decoration: underline;
}

.third-party-login {
  margin-top: 30px;
}

.divider {
  position: relative;
  text-align: center;
  margin: 20px 0;
}

.divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: rgba(255,255,255,0.3);
}

.divider-text {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: rgba(255,255,255,0.8);
  padding: 0 16px;
  font-size: 12px;
  position: relative;
  z-index: 1;
}

.third-party-icons {
  display: flex;
  justify-content: center;
  gap: 40px;
  margin-top: 20px;
}

.third-party-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 16px;
  border-radius: 16px;
  background: rgba(255,255,255,0.15);
  backdrop-filter: blur(15px);
  border: 1px solid rgba(255,255,255,0.2);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.third-party-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05));
  opacity: 0;
  transition: opacity 0.3s ease;
}

.third-party-item:hover {
  background: rgba(255,255,255,0.25);
  transform: translateY(-4px) scale(1.05);
  box-shadow: 0 12px 32px rgba(0,0,0,0.2);
}

.third-party-item:hover::before {
  opacity: 1;
}

.third-party-item span {
  font-size: 12px;
  color: rgba(255,255,255,0.9);
}

/* 响应式设计 */
@media (max-width: 375px) {
  .login-form {
    padding: 16px;
  }
  
  .logo-section {
    padding: 30px 0 20px;
  }
  
  .app-name {
    font-size: 24px;
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
  .login-tabs {
    background: rgba(30, 30, 30, 0.95);
    border: 1px solid rgba(255,255,255,0.1);
  }
}

/* 验证码登录弹窗样式 */
.sms-login-popup {
  padding: 20px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.popup-header {
  text-align: center;
  margin-bottom: 20px;
}

.popup-header h3 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.popup-content {
  flex: 1;
}

.other-login {
  margin-top: 30px;
}

.other-login .divider {
  position: relative;
  text-align: center;
  margin: 20px 0;
}

.other-login .divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: rgba(255,255,255,0.3);
}

.other-login .divider span {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: rgba(255,255,255,0.8);
  padding: 0 16px;
  font-size: 12px;
  position: relative;
  z-index: 1;
}

.social-login {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.social-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 16px;
  border-radius: 16px;
  background: rgba(255,255,255,0.15);
  backdrop-filter: blur(15px);
  border: 1px solid rgba(255,255,255,0.2);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.social-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05));
  opacity: 0;
  transition: opacity 0.3s ease;
}

.social-item:hover {
  background: rgba(255,255,255,0.25);
  transform: translateY(-4px) scale(1.05);
  box-shadow: 0 12px 32px rgba(0,0,0,0.2);
}

.social-item:hover::before {
  opacity: 1;
}

.social-item span {
  font-size: 12px;
  color: rgba(255,255,255,0.9);
}

/* 角色快捷登录样式 */
.quick-login {
  margin-top: 20px;
}

.role-login-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-top: 16px;
}

.role-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 16px 12px;
  border-radius: 12px;
  background: rgba(255,255,255,0.15);
  backdrop-filter: blur(15px);
  border: 1px solid rgba(255,255,255,0.2);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  min-height: 70px;
}

.role-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05));
  opacity: 0;
  transition: opacity 0.3s ease;
}

.role-item:hover {
  background: rgba(255,255,255,0.25);
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 8px 24px rgba(0,0,0,0.15);
}

.role-item:hover::before {
  opacity: 1;
}

.role-item:active {
  transform: translateY(0) scale(0.98);
}

.role-item span {
  font-size: 12px;
  color: rgba(255,255,255,0.9);
  font-weight: 500;
  text-align: center;
  line-height: 1.2;
}

.van-cell-group--inset{
  margin: 0!important;
}
</style>