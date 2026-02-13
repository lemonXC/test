<template>
  <div class="forgot-query-code-page">
    <!-- 导航栏 -->
    <van-nav-bar
      title="找回查询码"
      left-text="返回"
      left-arrow
      @click-left="onBack"
      fixed
      placeholder
    />

    <!-- 页面内容 -->
    <div class="page-content">
      <!-- 表单区域 -->
      <div class="form-section">
        <!-- 手机号输入 -->
        <div class="input-group">
          <div class="input-label">手机号码</div>
          <van-field
            v-model="phoneNumber"
            placeholder="请输入手机号码"
            type="tel"
            clearable
            maxlength="11"
            class="input-field"
          >
            <template #left-icon>
              <van-icon name="phone-o" />
            </template>
          </van-field>
        </div>

        <!-- 验证码输入 -->
        <div class="input-group">
          <div class="input-label">短信验证码</div>
          <div class="verification-input-wrapper">
            <van-field
              v-model="verificationCode"
              placeholder="请输入6位验证码"
              type="number"
              maxlength="6"
              clearable
              class="verification-input"
              :disabled="!codeSent"
            >
              <template #left-icon>
                <van-icon name="shield-o" />
              </template>
            </van-field>
            <van-button
              type="primary"
              size="small"
              plain
              :disabled="!canSendCode"
              :loading="submitting"
              @click="sendVerificationCode"
              class="send-code-btn"
            >
              {{ codeSent ? (countdown > 0 ? `${countdown}s` : '重新发送') : '发送验证码' }}
            </van-button>
          </div>
          
          <!-- 验证码发送提示 -->
          <div v-if="codeSent" class="verification-tip">
            <van-icon name="success" color="#52c41a" />
            <span>验证码已发送至 <span class="contact-highlight">{{ maskedPhoneNumber }}</span></span>
          </div>
        </div>

        <!-- 提交按钮 -->
        <div class="submit-section">
          <van-button
            type="primary"
            size="large"
            :disabled="!canVerify"
            :loading="verifying"
            @click="verifyCode"
            class="submit-btn"
          >
            验证并继续
          </van-button>
        </div>
      </div>

      <!-- 温馨提示 -->
      <div class="tips-section">
        <div class="tips-title">
          <van-icon name="info-o" />
          温馨提示
        </div>
        <ul class="tips-list">
          <li>请确保输入的手机号为提交问题时使用的手机号</li>
          <li>验证码有效期为10分钟，请及时输入</li>
          <li>如果未收到验证码，请检查垃圾短信或重新发送</li>
          <!-- <li>每个手机号每天最多可发送10次验证码</li> -->
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'

export default {
  name: 'ForgotQueryCode',
  setup() {
    const router = useRouter()
    const phoneNumber = ref('')
    const submitting = ref(false)
    const codeSent = ref(false)
    const verificationCode = ref('')
    const verifying = ref(false)
    const verified = ref(false)
    const countdown = ref(0)
    const resending = ref(false)
    const countdownTimer = ref(null)

    // 返回上一页
    const onBack = () => {
      router.back()
    }

    // 脱敏显示手机号
    const maskedPhoneNumber = computed(() => {
      if (!phoneNumber.value || phoneNumber.value.length !== 11) return ''
      return phoneNumber.value.substring(0, 3) + '****' + phoneNumber.value.substring(7)
    })

    // 验证手机号是否有效
    const isValidPhoneNumber = computed(() => {
      if (!phoneNumber.value.trim()) return false
      const phoneRegex = /^1[3-9]\d{9}$/
      return phoneRegex.test(phoneNumber.value)
    })

    // 是否可以发送验证码
    const canSendCode = computed(() => {
      return isValidPhoneNumber.value && (countdown.value === 0 || !codeSent.value)
    })

    // 是否可以验证
    const canVerify = computed(() => {
      return codeSent.value && verificationCode.value.length === 6
    })

    // 开始倒计时
    const startCountdown = () => {
      countdown.value = 60
      countdownTimer.value = setInterval(() => {
        countdown.value--
        if (countdown.value <= 0) {
          clearInterval(countdownTimer.value)
        }
      }, 1000)
    }

    // 发送验证码
    const sendVerificationCode = async () => {
      if (!canSendCode.value) {
        if (!isValidPhoneNumber.value) {
          showToast('请输入正确的11位手机号码')
        } else if (countdown.value > 0) {
          showToast(`请等待 ${countdown.value} 秒后重新发送`)
        }
        return
      }

      submitting.value = true

      try {
        // 模拟发送验证码请求
        await new Promise(resolve => setTimeout(resolve, 1500))
        
        showToast(codeSent.value ? '短信验证码已重新发送' : '短信验证码已发送')
        codeSent.value = true
        startCountdown()
        
      } catch (error) {
        showToast('发送失败，请重试')
      } finally {
        submitting.value = false
      }
    }

    // 重新发送验证码
    const resendCode = async () => {
      resending.value = true
      
      try {
        // 模拟重新发送请求
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        showToast('验证码已重新发送')
        startCountdown()
      } catch (error) {
        showToast('发送失败，请重试')
      } finally {
        resending.value = false
      }
    }

    // 验证验证码
    const verifyCode = async () => {
      if (!verificationCode.value || verificationCode.value.length !== 6) {
        showToast('请输入6位验证码')
        return
      }

      verifying.value = true

      try {
        // 模拟验证码验证请求
        await new Promise(resolve => setTimeout(resolve, 1500))
        
        // 模拟验证成功 (实际项目中这里应该调用真实的API)
        const isValidCode = verificationCode.value === '123456' || verificationCode.value === '888888'
        
        if (isValidCode) {
          verified.value = true
          showToast('验证成功！正在跳转...')
          
          // 跳转到查询码列表页面，传递用户信息
           setTimeout(() => {
             router.push({
               path: '/query-code-list',
               query: {
                 contact: phoneNumber.value,
                 type: 'phone',
                 verified: 'true'
               }
             })
           }, 1500)
        } else {
          showToast('验证码错误，请重新输入')
          verificationCode.value = ''
        }
      } catch (error) {
        console.error('验证码验证失败:', error)
        showToast('验证失败，请重试')
      } finally {
        verifying.value = false
      }
    }

    // 组件卸载时清除定时器
    onUnmounted(() => {
      if (countdownTimer.value) {
        clearInterval(countdownTimer.value)
      }
    })

    return {
      phoneNumber,
      submitting,
      codeSent,
      verificationCode,
      verifying,
      verified,
      countdown,
      resending,
      maskedPhoneNumber,
      isValidPhoneNumber,
      canSendCode,
      canVerify,
      onBack,
      sendVerificationCode,
      resendCode,
      verifyCode
    }
  }
}
</script>

<style scoped>
.forgot-query-code-page {
  background: #f7f8fa;
  min-height: 100vh;
  height: auto;
  overflow-y: visible;
  position: relative;
}

.page-content {
  padding: 20px 16px;
  padding-bottom: 60px;
  min-height: calc(100vh - 46px);
}

/* 页面说明 */
.page-description {
  text-align: center;
  margin-bottom: 24px;
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.desc-icon {
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, #4ecdc4, #44a08d);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  font-size: 32px;
  color: white;
}

.desc-title {
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin: 0 0 8px 0;
}

.desc-text {
  font-size: 14px;
  color: #666;
  margin: 0;
  line-height: 1.5;
}

/* 表单区域 */
.form-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.input-group {
  margin-bottom: 20px;
}

.input-group:last-child {
  margin-bottom: 0;
}

.input-label {
  font-size: 14px;
  color: #333;
  margin-bottom: 8px;
  font-weight: 500;
}

.input-field {
  background: #f7f8fa;
  border-radius: 8px;
}

/* 验证码输入区域 */
.verification-input-wrapper {
  display: flex;
  gap: 12px;
  align-items: center;
}

.verification-input {
  flex: 1;
  background: #f7f8fa;
  border-radius: 8px;
}

.send-code-btn {
  height: 44px;
  min-width: 100px;
  font-size: 13px;
  white-space: nowrap;
  flex-shrink: 0;
  border-radius: 8px;
}

.verification-tip {
  display: flex;
  align-items: center;
  margin-top: 8px;
  padding: 8px 12px;
  background: #f6ffed;
  border: 1px solid #b7eb8f;
  border-radius: 6px;
  font-size: 12px;
  color: #52c41a;
}

.verification-tip .van-icon {
  margin-right: 6px;
  font-size: 14px;
}

.contact-highlight {
  color: #1989fa;
  font-weight: 500;
}

/* 提交按钮 */
.submit-section {
  margin-bottom: 15px;
}

.submit-btn {
  width: 100%;
  height: 48px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: bold;
}

/* 温馨提示 */
.tips-section {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.tips-title {
  display: flex;
  align-items: center;
  font-size: 14px;
  font-weight: bold;
  color: #333;
  margin-bottom: 5px;
}

.tips-title .van-icon {
  color: #1989fa;
  margin-right: 6px;
}

.tips-list {
  margin: 0;
  padding-left: 16px;
}

.tips-list li {
  font-size: 12px;
  color: #666;
  line-height: 1.6;
  margin-bottom: 4px;
}

.tips-list li:last-child {
  margin-bottom: 0;
}

/* 响应式设计 */
@media (max-width: 375px) {
  .page-content {
    padding: 16px 12px;
  }
  
  .page-description {
    padding: 20px 16px;
  }
  
  .desc-icon {
    width: 56px;
    height: 56px;
    font-size: 28px;
  }
  
  .desc-title {
    font-size: 20px;
  }
  
  .form-section {
    padding: 20px 16px;
  }
  
  .verification-input-wrapper {
    gap: 8px;
  }
  
  .send-code-btn {
    min-width: 80px;
    font-size: 12px;
    padding: 0 8px;
  }
}

/* 深色模式适配 */
@media (prefers-color-scheme: dark) {
  .forgot-query-code-page {
    background: #1a1a1a;
  }
  
  .page-description,
  .form-section,
  .tips-section {
    background: #2a2a2a;
    border-color: #333;
  }
  
  .input-field,
  .verification-input {
    background: #333;
  }
  
  .verification-tip {
    background: #1f2f1f;
    border-color: #3a5a3a;
  }
  
  .desc-title,
  .input-label,
  .tips-title {
    color: #fff;
  }
  
  .desc-text,
  .tips-list li {
    color: #ccc;
  }
}
</style>