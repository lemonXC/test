<template>
  <div class="change-phone-page">
    <van-nav-bar title="修改手机号" left-text="返回" left-arrow @click-left="$router.go(-1)" />

    <div class="page-content">
      <div class="card">
        <div class="card-header">
          <van-icon name="phone-o" size="24" />
          <span>当前绑定手机号</span>
        </div>
        <div class="card-body">
          <div class="current-phone">{{ maskedCurrentPhone }}</div>
          <!-- <div class="tips">为保障安全，将向当前手机号发送验证码进行二次验证</div> -->
        </div>
      </div>

      <van-form @submit="onSubmit" ref="formRef">
        <van-cell-group class="form-group">
          <!-- <van-field
            v-model="oldCode"
            name="oldCode"
            label="原手机号验证"
            placeholder="请输入6位验证码"
            :rules="codeRules"
            maxlength="6"
          >
            <template #button>
              <van-button size="small" type="primary" :disabled="oldCountdown>0 || oldSending" @click="sendOldCode">
                {{ oldCountdown>0 ? `${oldCountdown}s后重发` : '发送验证码' }}
              </van-button>
            </template>
          </van-field> -->

          <van-field
            v-model="newPhone"
            name="newPhone"
            label="新手机号"
            placeholder="请输入新手机号"
            :rules="phoneRules"
            maxlength="11"
            type="tel"
          />

          <van-field
            v-model="newCode"
            name="newCode"
            label="新手机号验证"
            placeholder="请输入6位验证码"
            :rules="codeRules"
            maxlength="6"
          >
            <template #button>
              <van-button size="small" type="primary" :disabled="newCountdown>0 || newSending || !canSendNew" @click="sendNewCode">
                {{ newCountdown>0 ? `${newCountdown}s后重发` : '发送验证码' }}
              </van-button>
            </template>
          </van-field>
        </van-cell-group>

        <div class="submit-section">
          <van-button type="primary" block native-type="submit" :loading="loading" class="submit-btn">
            {{ loading ? '提交中...' : '确认更换' }}
          </van-button>
        </div>
      </van-form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showSuccessToast } from 'vant'
import authService from '@/services/authService'
import { validatePhone, validateSmsCode } from '@/utils/auth'

const formRef = ref(null)
const loading = ref(false)
const oldSending = ref(false)
const newSending = ref(false)
const oldCountdown = ref(0)
const newCountdown = ref(0)

const currentPhone = ref('')
const newPhone = ref('')
const oldCode = ref('')
const newCode = ref('')

const router = useRouter()

const maskedCurrentPhone = computed(() => {
  if (!currentPhone.value) return '未绑定'
  return currentPhone.value.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
})

const canSendNew = computed(() => {
  const res = validatePhone(newPhone.value)
  return res.isValid && newPhone.value !== currentPhone.value
})

const phoneRules = [
  { required: true, message: '请输入新手机号' },
  { validator: (val) => validatePhone(val).isValid, message: '请输入正确的手机号码' }
]

const codeRules = [
  { required: true, message: '请输入验证码' },
  { validator: (val) => validateSmsCode(val).isValid, message: '验证码为6位数字' }
]

const loadUserPhone = async () => {
  const info = await authService.getUserInfo()
  if (info.success) {
    currentPhone.value = info.data.user.phone || ''
  }
}

onMounted(() => {
  loadUserPhone()
})

const sendOldCode = async () => {
  if (!currentPhone.value) {
    showToast('未绑定手机号，无法发送验证码')
    return
  }
  try {
    oldSending.value = true
    const res = await authService.sendSmsCode(currentPhone.value)
    if (res.success) {
      showToast('验证码已发送')
      oldCountdown.value = 60
      const timer = setInterval(() => {
        oldCountdown.value--
        if (oldCountdown.value <= 0) clearInterval(timer)
      }, 1000)
    } else {
      showToast(res.message || '发送失败')
    }
  } catch (e) {
    showToast(e.message || '发送失败')
  } finally {
    oldSending.value = false
  }
}

const sendNewCode = async () => {
  const resPhone = validatePhone(newPhone.value)
  if (!resPhone.isValid) {
    showToast(resPhone.message)
    return
  }
  try {
    newSending.value = true
    const res = await authService.sendSmsCode(newPhone.value)
    if (res.success) {
      showToast('验证码已发送')
      newCountdown.value = 60
      const timer = setInterval(() => {
        newCountdown.value--
        if (newCountdown.value <= 0) clearInterval(timer)
      }, 1000)
    } else {
      showToast(res.message || '发送失败')
    }
  } catch (e) {
    showToast(e.message || '发送失败')
  } finally {
    newSending.value = false
  }
}

const onSubmit = async () => {
  try {
    await formRef.value?.validate()

    loading.value = true
    const csrf = authService.getCsrfToken()
    const result = await authService.updatePhoneWithVerification({
      oldPhone: currentPhone.value,
      oldCode: oldCode.value,
      newPhone: newPhone.value,
      newCode: newCode.value,
      csrfToken: csrf
    })
    if (result.success) {
      await authService.logout()
      showSuccessToast('手机号已更新，请重新登录')
      setTimeout(() => {
        router.push('/login')
      }, 800)
    } else {
      showToast(result.message || '更新失败')
    }
  } catch (error) {
    if (error?.name === 'ValidationError') {
      showToast('请检查输入信息')
    } else {
      showToast('更新失败，请重试')
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.change-phone-page {
  min-height: 100vh;
  background: #f7f8fa;
}

.page-content {
  padding: 16px;
  padding-bottom: 80px;
}

.page-content {
  max-width: 520px;
  margin: 0 auto;
}

.card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  margin-bottom: 16px;
  overflow: hidden;
}

.card-header {
  font-size: 18px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
  color: #323233;
  font-weight: 500;
}

.card-body {
  padding: 12px 16px;
}

.current-phone {
  font-size: 16px;
  color: #323233;
  margin-bottom: 8px;
}

.tips {
  font-size: 12px;
  color: #646566;
}

.form-group {
  border-radius: 12px;
  overflow: hidden;
}

.submit-section {
  margin-top: 16px;
}

.submit-btn {
  border-radius: 8px;
}
</style>
const canSendNew = computed(() => {
  const res = validatePhone(newPhone.value)
  return !!newPhone.value && res.isValid
})