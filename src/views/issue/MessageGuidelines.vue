<template>
  <div class="message-guidelines">
    <!-- 导航栏 -->
    <van-nav-bar
      title="《问政河北》平台留言说明"
      left-arrow
      @click-left="$router.go(-1)"
      
      class="nav-bar"
    />

    <!-- 主要内容区域 -->
    <div class="content-wrapper">
      <div class="guidelines-content">
        <!-- 平台简介 -->
        <div class="section intro-section">
          <p class="intro-text">
            《问政河北》平台是河北省委、省政府为加强与人民群众沟通联系，
            畅通民意表达渠道，提高政府工作透明度而设立的网络问政平台。
            为了更好地为您提供服务，请您在留言前仔细阅读以下说明：
          </p>
        </div>

        <!-- 相关要求 -->
        <div class="section">
          <h3 class="section-title">一、相关要求</h3>
          <div class="requirement-list">
            <div class="requirement-item">
              <span class="number">1.</span>
              <span class="text">请您实名留言，并留下真实有效的联系方式，以便我们及时回复和沟通。</span>
            </div>
            <div class="requirement-item">
              <span class="number">2.</span>
              <span class="text">留言内容应当客观真实，语言文明，不得含有违法违规信息。</span>
            </div>
            <div class="requirement-item">
              <span class="number">3.</span>
              <span class="text">请详细描述您要反映的问题，提供相关事实和证据材料。</span>
            </div>
            <div class="requirement-item">
              <span class="number">4.</span>
              <span class="text">同一问题请勿重复提交，我们会在规定时间内给予回复。</span>
            </div>
            <div class="requirement-item">
              <span class="number">5.</span>
              <span class="text">涉及个人隐私的敏感信息，请谨慎填写，避免泄露个人信息。</span>
            </div>
          </div>
        </div>

        <!-- 声明 -->
        <div class="section">
          <h3 class="section-title">二、声明</h3>
          <div class="declaration-list">
            <div class="declaration-item">
              <span class="number">1.</span>
              <span class="text">本平台仅受理河北省范围内的相关问题，超出范围的问题将不予受理。</span>
            </div>
            <div class="declaration-item">
              <span class="number">2.</span>
              <span class="text">对于涉及国家秘密、商业秘密、个人隐私等不宜公开的信息，我们将依法保护。</span>
            </div>
            <div class="declaration-item">
              <span class="number">3.</span>
              <span class="text">留言回复时间一般为7个工作日，复杂问题可能需要更长时间。</span>
            </div>
            <div class="declaration-item">
              <span class="number">4.</span>
              <span class="text">我们保留对留言内容进行审核、编辑和删除的权利。</span>
            </div>
          </div>
        </div>

        <!-- 删除范围 -->
        <div class="section">
          <h3 class="section-title">三、删除范围</h3>
          <div class="delete-scope">
            <p class="scope-intro">以下类型的留言将被删除：</p>
            <div class="scope-list">
              <div class="scope-item">
                <span class="number">1.</span>
                <span class="text">含有违法违规内容的留言；</span>
              </div>
              <div class="scope-item">
                <span class="number">2.</span>
                <span class="text">恶意攻击、诽谤他人的留言；</span>
              </div>
              <div class="scope-item">
                <span class="number">3.</span>
                <span class="text">涉及个人隐私、商业秘密的留言；</span>
              </div>
              <div class="scope-item">
                <span class="number">4.</span>
                <span class="text">重复提交的相同内容留言；</span>
              </div>
              <div class="scope-item">
                <span class="number">5.</span>
                <span class="text">与平台主题无关的留言；</span>
              </div>
              <div class="scope-item">
                <span class="number">6.</span>
                <span class="text">其他不符合平台规定的留言。</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 其他说明 -->
        <div class="section">
          <h3 class="section-title">四、其他说明</h3>
          <div class="other-notes">
            <div class="note-item">
              <span class="number">1.</span>
              <span class="text">
                <strong>紧急情况处理：</strong>如遇紧急情况，请直接拨打相关部门电话或110、119、120等应急电话，
                不要仅通过本平台留言。
              </span>
            </div>
            <div class="note-item">
              <span class="number">2.</span>
              <span class="text">
                <strong>法律责任：</strong>留言者应对所提供信息的真实性负责，
                如因虚假信息造成不良后果，留言者将承担相应法律责任。
              </span>
            </div>
            <div class="note-item">
              <span class="number">3.</span>
              <span class="text">
                <strong>技术支持：</strong>如在使用过程中遇到技术问题，
                请联系平台技术支持人员。
              </span>
            </div>
            <div class="note-item">
              <span class="number">4.</span>
              <span class="text">
                <strong>平台改进：</strong>我们将根据用户反馈不断改进平台功能，
                提升服务质量。
              </span>
            </div>
          </div>
        </div>

        <!-- 结语 -->
        <div class="section conclusion-section">
          <p class="conclusion-text">
            感谢您对《问政河北》平台的关注和支持！我们将认真对待每一条留言，
            努力为您提供优质的服务。请您在充分了解上述说明后，点击下方按钮确认同意。
          </p>
        </div>
      </div>
    </div>

    <!-- 固定底部确认区域 -->
    <div class="bottom-confirm">
      <div class="countdown-tip">
        <span v-if="countdown > 0" class="countdown-text">
          请仔细阅读说明（剩余时间：{{ countdown }}秒）
        </span>
        <span v-else class="ready-text">
          已阅读完毕，可以提交
        </span>
      </div>
      <van-button
        type="primary"
        size="large"
        :disabled="countdown > 0"
        :class="{ 'disabled-button': countdown > 0 }"
        @click="handleConfirm"
        class="confirm-button"
      >
        我已阅读并同意上述内容
      </van-button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { showSuccessToast } from 'vant'

const router = useRouter()
const countdown = ref(5)
let timer = null

// 组件挂载时启动倒计时
onMounted(() => {
  startCountdown()
})

// 组件卸载时清除定时器
onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
  }
})

// 启动倒计时
const startCountdown = () => {
  timer = setInterval(() => {
    if (countdown.value > 0) {
      countdown.value--
    } else {
      clearInterval(timer)
    }
  }, 1000)
}

// 处理确认按钮点击
const handleConfirm = () => {
  if (countdown.value > 0) {
    return
  }
  
  // 存储用户同意状态到会话存储（每次会话都需要重新同意）
  sessionStorage.setItem('message_guidelines_agreed_current_session', 'true')
  sessionStorage.setItem('message_guidelines_agreed_time', Date.now().toString())
  
  console.log('[MessageGuidelines] 用户确认同意留言说明:', {
    timestamp: new Date().toLocaleTimeString(),
    agreed: sessionStorage.getItem('message_guidelines_agreed_current_session')
  })
  
  showSuccessToast('已确认阅读留言说明')
  
  // 跳转到留言提交页面
  setTimeout(() => {
    // 获取原始目标路径，如果有的话
    const targetPath = router.currentRoute.value.query.redirect || '/submit-issue'
    console.log('[MessageGuidelines] 跳转到目标页面:', targetPath)
    router.push(targetPath)
  }, 1000)
}
</script>

<style scoped>
.message-guidelines {
  min-height: 100vh;
  background-color: #f8f9fa;
  padding-bottom: 120px; /* 为底部固定区域留出空间 */
}

.nav-bar {
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.content-wrapper {
  padding: 16px;
}

.guidelines-content {
  background-color: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.section {
  margin-bottom: 24px;
}

.section:last-child {
  margin-bottom: 0;
}

.intro-section .intro-text {
  font-size: 15px;
  line-height: 1.6;
  color: #333;
  margin: 0;
  text-align: justify;
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  color: #1976d2;
  margin: 0 0 12px 0;
  padding-bottom: 8px;
  border-bottom: 2px solid #e3f2fd;
}

.requirement-list,
.declaration-list,
.scope-list,
.other-notes {
  margin: 0;
}

.requirement-item,
.declaration-item,
.scope-item,
.note-item {
  display: flex;
  margin-bottom: 12px;
  line-height: 1.6;
}

.requirement-item:last-child,
.declaration-item:last-child,
.scope-item:last-child,
.note-item:last-child {
  margin-bottom: 0;
}

.number {
  color: #1976d2;
  font-weight: bold;
  margin-right: 8px;
  flex-shrink: 0;
}

.text {
  color: #333;
  font-size: 14px;
  flex: 1;
}

.scope-intro {
  font-size: 14px;
  color: #666;
  margin: 0 0 12px 0;
}

.note-item .text strong {
  color: #d32f2f;
  font-weight: bold;
}

.conclusion-section .conclusion-text {
  font-size: 15px;
  line-height: 1.6;
  color: #333;
  margin: 0;
  text-align: justify;
  background-color: #f5f5f5;
  padding: 16px;
  border-radius: 6px;
  border-left: 4px solid #1976d2;
}

.bottom-confirm {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #fff;
  padding: 16px;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.countdown-tip {
  text-align: center;
  margin-bottom: 12px;
}

.countdown-text {
  color: #ff6b35;
  font-size: 14px;
  font-weight: bold;
}

.ready-text {
  color: #4caf50;
  font-size: 14px;
  font-weight: bold;
}

.confirm-button {
  width: 100%;
  height: 44px;
  border-radius: 6px;
  font-size: 16px;
  font-weight: bold;
  transition: all 0.3s ease;
}

.disabled-button {
  background-color: #e0e0e0 !important;
  border-color: #e0e0e0 !important;
  color: #9e9e9e !important;
  cursor: not-allowed;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .content-wrapper {
    padding: 12px;
  }
  
  .guidelines-content {
    padding: 16px;
  }
  
  .section-title {
    font-size: 15px;
  }
  
  .text {
    font-size: 13px;
  }
  
  .intro-section .intro-text,
  .conclusion-section .conclusion-text {
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  .content-wrapper {
    padding: 8px;
  }
  
  .guidelines-content {
    padding: 12px;
  }
  
  .bottom-confirm {
    padding: 12px;
  }
  
  .confirm-button {
    height: 40px;
    font-size: 15px;
  }
}
</style>