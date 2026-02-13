<template>
  <div class="change-password-page">
    <van-nav-bar title="修改密码" left-text="返回" left-arrow @click-left="$router.go(-1)" />

    <div class="page-content">
      <!-- 安全提示 -->
      <div class="security-notice">
        <van-notice-bar left-icon="info-o" text="为了您的账户安全，请定期更换密码" color="#1989fa"
          background="#ecf9ff" :scrollable="false" />
      </div>

      <!-- 密码修改表单 -->
      <van-form @submit="handleSubmit" ref="formRef">
        <van-cell-group class="form-group">
          <van-field v-model="formData.oldPassword" name="oldPassword" label="当前密码" placeholder="请输入当前密码"
            type="password" :rules="[{ required: true, message: '请输入当前密码' }]"
            :right-icon="showOldPassword ? 'eye-o' : 'closed-eye'"
            @click-right-icon="showOldPassword = !showOldPassword" :type="showOldPassword ? 'text' : 'password'" />

          <van-field v-model="formData.newPassword" name="newPassword" label="新密码" placeholder="请输入新密码"
            :type="showNewPassword ? 'text' : 'password'" :rules="passwordRules"
            :right-icon="showNewPassword ? 'eye-o' : 'closed-eye'"
            @click-right-icon="showNewPassword = !showNewPassword" @input="onPasswordInput" />

          <van-field v-model="formData.confirmPassword" name="confirmPassword" label="确认密码" placeholder="请再次输入新密码"
            :type="showConfirmPassword ? 'text' : 'password'" :rules="confirmPasswordRules"
            :right-icon="showConfirmPassword ? 'eye-o' : 'closed-eye'"
            @click-right-icon="showConfirmPassword = !showConfirmPassword" />
        </van-cell-group>

        <!-- 密码强度指示器 -->
        <!-- <div class="password-strength" v-if="formData.newPassword">
          <div class="strength-label">密码强度：</div>
          <div class="strength-bar">
            <div 
              class="strength-item"
              :class="{ active: passwordStrength >= 1, weak: passwordStrength === 1 }"
            ></div>
            <div 
              class="strength-item"
              :class="{ active: passwordStrength >= 2, medium: passwordStrength === 2 }"
            ></div>
            <div 
              class="strength-item"
              :class="{ active: passwordStrength >= 3, strong: passwordStrength === 3 }"
            ></div>
          </div>
          <div class="strength-text">{{ strengthText }}</div>
        </div> -->

        <!-- 提交按钮 -->
        <div class="submit-section">
          <van-button type="primary" block :loading="loading" native-type="submit" class="submit-btn">
            {{ loading ? '修改中...' : '确认修改' }}
          </van-button>
        </div>
      </van-form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showSuccessToast, showConfirmDialog } from 'vant'
import authService from '@/services/authService'

const router = useRouter()

// 响应式数据
const formRef = ref(null)
const loading = ref(false)
const showOldPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)

const formData = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 密码验证规则
const passwordRules = [
  { required: true, message: '请输入新密码' },
  { min: 8, message: '密码长度至少8位' },
  {
    validator: (value) => {
      const hasLetter = /[a-zA-Z]/.test(value)
      const hasNumber = /\d/.test(value)
      return hasLetter && hasNumber
    },
    message: '密码必须包含字母和数字'
  }
]

const confirmPasswordRules = [
  { required: true, message: '请确认新密码' },
  {
    validator: (value) => value === formData.value.newPassword,
    message: '两次输入的密码不一致'
  }
]

// 密码强度检查
const hasMinLength = computed(() => formData.value.newPassword.length >= 8)
const hasLetter = computed(() => /[a-zA-Z]/.test(formData.value.newPassword))
const hasNumber = computed(() => /\d/.test(formData.value.newPassword))
const hasSpecialChar = computed(() => /[!@#$%^&*(),.?":{}|<>]/.test(formData.value.newPassword))

const passwordStrength = computed(() => {
  let strength = 0
  if (hasMinLength.value) strength++
  if (hasLetter.value && hasNumber.value) strength++
  if (hasSpecialChar.value) strength++
  return strength
})

const strengthText = computed(() => {
  switch (passwordStrength.value) {
    case 1: return '弱'
    case 2: return '中等'
    case 3: return '强'
    default: return ''
  }
})

// 密码输入处理
const onPasswordInput = () => {
  // 当新密码改变时，重新验证确认密码
  if (formData.value.confirmPassword) {
    formRef.value?.validate('confirmPassword')
  }
}

// 提交表单
const handleSubmit = async () => {
  try {
    await formRef.value.validate()

    // 检查新密码是否与旧密码相同
    if (formData.value.newPassword === formData.value.oldPassword) {
      showToast('新密码不能与当前密码相同')
      return
    }

    loading.value = true

    const response = await authService.changePassword(
      formData.value.oldPassword,
      formData.value.newPassword
    )

    if (response.success) {
      showSuccessToast('密码修改成功')

      // 显示重新登录提示
      showConfirmDialog({
        title: '密码修改成功',
        message: '为了您的账户安全，请重新登录',
        confirmButtonText: '立即登录',
        cancelButtonText: '稍后登录'
      }).then(() => {
        // 退出登录并跳转到登录页
        authService.logout()
        router.replace('/login')
      }).catch(() => {
        // 返回上一页
        router.go(-1)
      })
    } else {
      showToast(response.message || '密码修改失败')
    }
  } catch (error) {
    console.error('密码修改失败:', error)
    if (error.name === 'ValidationError') {
      showToast('请检查输入信息')
    } else {
      showToast('密码修改失败，请重试')
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.change-password-page {
  min-height: 100vh;
  background-color: #f7f8fa;
}

.page-content {
  padding: 16px;
  padding-bottom: 80px;
}

/* 安全提示 */
.security-notice {
  margin-bottom: 16px;
}

/* 表单组 */
.form-group {
  margin-bottom: 16px;
  border-radius: 8px;
}

/* 密码强度指示器 */
.password-strength {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: white;
  border-radius: 12px;
  margin-bottom: 16px;
}

.strength-label {
  font-size: 14px;
  color: #646566;
  margin-right: 12px;
}

.strength-bar {
  display: flex;
  gap: 4px;
  margin-right: 12px;
}

.strength-item {
  width: 20px;
  height: 4px;
  background-color: #ebedf0;
  border-radius: 2px;
  transition: background-color 0.3s;
}

.strength-item.active.weak {
  background-color: #ee0a24;
}

.strength-item.active.medium {
  background-color: #ff976a;
}

.strength-item.active.strong {
  background-color: #07c160;
}

.strength-text {
  font-size: 14px;
  font-weight: 500;
}

/* 密码要求 */
.password-requirements {
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 24px;
}

.requirements-title {
  font-size: 16px;
  font-weight: 600;
  color: #323233;
  margin-bottom: 12px;
}

.requirement-item {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  font-size: 14px;
  color: #969799;
  transition: color 0.3s;
}

.requirement-item.valid {
  color: #07c160;
}

.requirement-item .van-icon {
  margin-right: 8px;
  font-size: 16px;
}

.requirement-item:last-child {
  margin-bottom: 0;
}

/* 提交按钮 */
.submit-section {
  margin-bottom: 24px;
}

.submit-btn {
  border-radius: 12px;
  height: 48px;
  font-size: 16px;
  font-weight: 500;
}

/* 安全提醒 */
.security-tips {
  background: white;
  border-radius: 12px;
  padding: 16px;
}

.tips-title {
  font-size: 16px;
  font-weight: 600;
  color: #323233;
  margin-bottom: 12px;
}

.tips-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tip-item {
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #646566;
}

.tip-item .van-icon {
  margin-right: 8px;
  font-size: 16px;
  color: #1989fa;
}

/* 响应式设计 */
@media (max-width: 375px) {
  .page-content {
    padding: 12px;
  }

  .password-strength {
    flex-wrap: wrap;
    gap: 8px;
  }

  .strength-label {
    width: 100%;
    margin-bottom: 4px;
  }

  .submit-btn {
    height: 44px;
    font-size: 15px;
  }
}

:deep(.van-cell) {
  border-radius: 8px;
}
</style>