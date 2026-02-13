<template>
  <div class="notice-detail">
    <!-- 导航栏 -->
    <van-nav-bar title="公告详情" left-text="返回" fixed left-arrow @click-left="onBack" class="nav-bar" />

    <!-- 加载状态 -->
    <div class="loading-container" v-if="loading">
      <div class="loading-content">
        <van-loading size="24px" color="#1989fa">加载中...</van-loading>
      </div>
    </div>

    <!-- 公告详情内容 -->
    <div class="notice-content" v-if="!loading && notice">
      <!-- 公告头部信息 -->
      <div class="notice-header">
        <div class="header-top">
          <van-tag :type="getTagType(notice.type)" size="medium" class="notice-tag">
            {{ getTypeText(notice.type) }}
          </van-tag>
          <!-- <div class="important-badge" v-if="notice.isImportant">
            <van-icon name="warning-o" color="#ff6b35" size="16" />
            <span class="important-text">重要</span>
          </div> -->
        </div>

        <h1 class="notice-title">{{ notice.title }}</h1>

        <div class="notice-meta">
          <!-- <div class="meta-item">
            <van-icon name="contact" size="14" />
            <span>{{ notice.publisher }}</span>
          </div> -->
          <div class="meta-item">
            <van-icon name="clock-o" size="14" />
            <span>{{ formatDateTime(notice.publishTime) }}</span>
          </div>
          <!-- <div class="meta-item">
            <van-icon name="eye-o" size="14" />
            <span>{{ notice.readCount }} 次阅读</span>
          </div> -->
        </div>
      </div>

      <!-- 公告正文 -->
      <div class="notice-body">
        <div class="content-section">
          <!-- <h3 class="section-title">公告内容</h3> -->
          <div class="content-text" v-html="formatContent(notice.content)"></div>
        </div>

        <!-- 附件区域 -->
        <!-- <div class="attachments-section" v-if="notice.attachments && notice.attachments.length > 0">
          <h3 class="section-title">相关附件</h3>
          <div class="attachments-list">
            <div v-for="(attachment, index) in notice.attachments" :key="index" class="attachment-item"
              @click="downloadAttachment(attachment)">
              <div class="attachment-icon">
                <van-icon :name="getAttachmentIcon(attachment.type)" size="20" />
              </div>
              <div class="attachment-info">
                <div class="attachment-name">{{ attachment.name }}</div>
                <div class="attachment-size">{{ getFileSize(attachment) }}</div>
              </div>
              <div class="attachment-action">
                <van-icon name="down" size="16" color="#1989fa" />
              </div>
            </div>
          </div>
        </div> -->
      </div>
    </div>

    <!-- 错误状态 -->
    <div class="error-state" v-if="!loading && !notice">
      <div class="error-content">
        <van-icon name="warning-o" size="48" color="#ee0a24" />
        <h3 class="error-title">公告不存在</h3>
        <p class="error-description">该公告可能已被删除或不存在</p>
        <van-button type="primary" @click="onBack" class="error-btn">
          返回列表
        </van-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast, showConfirmDialog } from 'vant'

const router = useRouter()
const route = useRoute()

// 响应式数据
const loading = ref(true)
const notice = ref(null)
const isCollected = ref(false)
const showShareSheet = ref(false)
const relatedNotices = ref([])

// 分享选项
const shareOptions = [
  { name: '微信', icon: 'wechat' },
  { name: '微博', icon: 'weibo' },
  { name: '复制链接', icon: 'link' },
  { name: '更多', icon: 'more-o' }
]

// 模拟公告数据
const mockNotices = {
  1: {
    id: 1,
    title: '服务器升级公告',
    summary: '为了提供更好的服务体验，我们将于本周末进行系统维护升级，届时部分功能可能暂时无法使用...',
    content: `<p>尊敬的用户：</p>
      <p>为了提供更好的服务体验，我们将于<strong>2024年1月20日22:00-24:00</strong>进行系统维护升级。</p>
      
      <h4>维护内容：</h4>
      <ul>
        <li>服务器硬件升级</li>
        <li>系统安全补丁更新</li>
        <li>数据库性能优化</li>
        <li>新功能模块部署</li>
      </ul>
      
      <h4>影响范围：</h4>
      <p>维护期间，以下功能可能暂时无法使用：</p>
      <ul>
        <li>用户登录和注册</li>
        <li>数据查询和提交</li>
        <li>在线客服功能</li>
      </ul>
      
      <p><strong>注意事项：</strong></p>
      <p>1. 请在维护开始前保存好您的工作内容</p>
      <p>2. 维护期间请勿进行重要操作</p>
      <p>3. 如有紧急问题，请联系客服热线：400-123-4567</p>
      
      <p>给您带来的不便敬请谅解，感谢您的理解与支持！</p>
    `,
    type: 'system',
    isImportant: true,
    publisher: '系统管理员',
    publishTime: '2024-01-18 14:30:00',
    readCount: 1256,
    attachments: [
      { name: '维护计划详情.pdf', url: '/files/maintenance-plan.pdf', type: 'pdf', size: '2.5MB' }
    ]
  },
  2: {
    id: 2,
    title: '新年福利大放送',
    summary: '春节期间，我们为用户准备了丰富的福利活动，包括签到奖励、抽奖活动等，欢迎参与...',
    content: `<p>亲爱的用户：</p>
      <p>春节将至，我们为大家准备了丰富的新年福利活动！</p>
      
      <h4>活动时间：</h4>
      <p>2024年2月1日-2024年2月15日</p>
      
      <h4>活动内容：</h4>
      <ol>
        <li><strong>每日签到送积分</strong><br>连续签到7天可获得额外奖励</li>
        <li><strong>幸运抽奖赢大奖</strong><br>每日可参与一次免费抽奖</li>
        <li><strong>邀请好友享优惠</strong><br>成功邀请好友注册可获得现金红包</li>
      </ol>
      
      <p>更多精彩活动等您参与，祝您新年快乐！</p>
    `,
    type: 'activity',
    isImportant: false,
    publisher: '运营团队',
    publishTime: '2024-01-17 10:15:00',
    readCount: 892,
    attachments: [
      { name: '活动详情.pdf', url: '/files/activity-details.pdf', type: 'pdf', size: '1.8MB' },
      { name: '奖品清单.xlsx', url: '/files/prize-list.xlsx', type: 'excel', size: '156KB' }
    ]
  },
  3: {
    id: 3,
    title: '用户隐私政策更新说明',
    summary: '根据最新的法律法规要求，我们对用户隐私政策进行了更新，请仔细阅读相关条款...',
    content: `<p>尊敬的用户：</p>
      <p>根据《个人信息保护法》等相关法律法规的要求，我们对《用户隐私政策》进行了更新。</p>
      
      <h4>主要更新内容：</h4>
      <ol>
        <li><strong>明确个人信息收集范围</strong><br>详细说明我们收集的个人信息类型和用途</li>
        <li><strong>完善信息使用说明</strong><br>明确个人信息的使用场景和处理方式</li>
        <li><strong>强化用户权利保障</strong><br>保障用户对个人信息的知情权、决定权等</li>
      </ol>
      
      <p>请您仔细阅读更新后的隐私政策，如有疑问请联系客服。</p>
    `,
    type: 'important',
    isImportant: true,
    publisher: '法务部',
    publishTime: '2024-01-16 16:45:00',
    readCount: 2341,
    attachments: [
      { name: '隐私政策更新说明.docx', url: '/files/privacy-policy.docx', type: 'doc', size: '1.2MB' }
    ]
  },
  4: {
    id: 4,
    title: '新增智能客服功能',
    summary: '我们新增了AI智能客服功能，可以为您提供24小时在线服务，快速解答常见问题...',
    content: `<p>为了提升用户服务体验，我们正式上线AI智能客服功能。</p>
      
      <h4>功能特点：</h4>
      <ul>
        <li><strong>24小时在线服务</strong><br>全天候为您提供咨询服务</li>
        <li><strong>快速响应用户咨询</strong><br>秒级响应，即时解答</li>
        <li><strong>智能问题分类处理</strong><br>自动识别问题类型，提供精准答案</li>
        <li><strong>支持多轮对话交互</strong><br>理解上下文，提供连贯服务</li>
      </ul>
      
      <p>欢迎体验我们的智能客服功能！</p>
    `,
    type: 'feature',
    isImportant: false,
    publisher: '产品团队',
    publishTime: '2024-01-15 09:20:00',
    readCount: 567,
    attachments: []
  },
  5: {
    id: 5,
    title: '防范网络诈骗注意事项',
    summary: '近期网络诈骗案件频发，请广大用户提高警惕，注意保护个人信息和财产安全...',
    content: `<p>近期，网络诈骗案件呈上升趋势，为保护用户权益，特发布安全提醒：</p>
      
      <h4>防范要点：</h4>
      <ol>
        <li><strong>不要轻信陌生电话和短信</strong><br>谨慎对待声称来自银行、公安等机构的电话</li>
        <li><strong>不要随意点击可疑链接</strong><br>避免点击来源不明的网址链接</li>
        <li><strong>不要向陌生人透露个人信息</strong><br>保护好身份证号、银行卡号等敏感信息</li>
        <li><strong>如遇可疑情况请及时联系客服</strong><br>我们将为您提供专业的安全指导</li>
      </ol>
      
      <p>请大家提高警惕，共同维护网络安全！</p>
    `,
    type: 'security',
    isImportant: true,
    publisher: '安全中心',
    publishTime: '2024-01-14 11:30:00',
    readCount: 1789,
    attachments: [
      { name: '防诈骗指南.pdf', url: '/files/anti-fraud-guide.pdf', type: 'pdf', size: '2.1MB' }
    ]
  }
}

// 相关公告数据
const mockRelatedNotices = [
  { id: 3, title: '用户隐私政策更新说明', publishTime: '2024-01-16 16:45:00' },
  { id: 4, title: '新增智能客服功能', publishTime: '2024-01-15 09:20:00' },
  { id: 5, title: '防范网络诈骗注意事项', publishTime: '2024-01-14 11:30:00' }
]

// 计算属性
const noticeId = computed(() => route.params.id)

// 方法
const onBack = () => {
  router.back()
}

const getTagType = (type) => {
  const typeMap = {
    important: 'danger',
    system: 'primary',
    activity: 'success',
    feature: 'warning',
    security: 'danger'
  }
  return typeMap[type] || 'default'
}

const getTypeText = (type) => {
  const textMap = {
    important: '重要公告',
    system: '系统通知',
    activity: '活动公告',
    feature: '功能更新',
    security: '安全提醒'
  }
  return textMap[type] || '通知'
}

const formatDateTime = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric'
  })
}

const formatContent = (content) => {
  // 简单的内容格式化，实际项目中可能需要更复杂的处理
  return content.replace(/\n/g, '<br>')
}

const getAttachmentIcon = (type) => {
  const iconMap = {
    pdf: 'description',
    doc: 'description',
    docx: 'description',
    excel: 'description',
    xlsx: 'description',
    image: 'photo-o',
    video: 'video-o'
  }
  return iconMap[type] || 'description'
}

const getFileSize = (attachment) => {
  return attachment.size || '未知大小'
}

const downloadAttachment = async (attachment) => {
  try {
    showToast(`正在下载 ${attachment.name}`)
    // 这里实现实际的下载逻辑
    // window.open(attachment.url, '_blank')
  } catch (error) {
    showToast('下载失败，请重试')
  }
}

const shareNotice = () => {
  showShareSheet.value = true
}

const onShareSelect = (option) => {
  showToast(`分享到${option.name}`)
  showShareSheet.value = false
}

const collectNotice = async () => {
  try {
    isCollected.value = !isCollected.value
    showToast(isCollected.value ? '收藏成功' : '取消收藏')
  } catch (error) {
    showToast('操作失败，请重试')
  }
}

const goToRelated = (relatedNotice) => {
  router.push({
    name: 'NoticeDetail',
    params: { id: relatedNotice.id },
    query: { from: 'related' }
  })
}

// 生命周期
onMounted(async () => {
  try {
    // 模拟API调用
    setTimeout(() => {
      const id = parseInt(noticeId.value)
      notice.value = mockNotices[id] || null

      if (notice.value) {
        // 增加阅读数
        notice.value.readCount += 1

        // 加载相关公告
        relatedNotices.value = mockRelatedNotices.filter(item => item.id !== id)
      }

      loading.value = false
    }, 600)
  } catch (error) {
    console.error('加载公告详情失败:', error)
    showToast('加载失败，请重试')
    loading.value = false
  }
})
</script>

<style scoped>
.notice-detail {
  min-height: 100vh;
  background-color: #f7f8fa;
}

/* 
.nav-bar {
  background-color: #1989fa;
  color: white;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.nav-bar :deep(.van-nav-bar__title) {
  color: white;
}

.nav-bar :deep(.van-nav-bar__text) {
  color: white;
}

.nav-bar :deep(.van-icon) {
  color: white;
} */

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
}

/* 公告内容 */
.notice-content {
  padding: 12px;
  margin-top: 46px;
}

/* 公告头部 */
.notice-header {
  background-color: #fff;
  padding: 20px 16px;
  border-bottom: 1px solid #ebedf0;
  border-radius: 6px;
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.notice-tag {
  font-size: 11px;
  font-weight: 500;
  border-radius: 4px;
  padding: 2px 6px;
  line-height: 1.2;
}

.important-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  background-color: rgba(255, 107, 53, 0.1);
  padding: 4px 8px;
  border-radius: 12px;
}

.important-text {
  font-size: 12px;
  color: #ff6b35;
  font-weight: 500;
}

.notice-title {
  font-size: 20px;
  font-weight: 600;
  color: #323233;
  line-height: 1.4;
  margin: 0 0 16px 0;
}

.notice-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.meta-item {
  display: flex;
  align-items: flex-start;
  gap: 4px;
  font-size: 13px;
  color: #646566;
  line-height: 1.4;
}

.meta-item .van-icon {
  margin-top: 2px;
  flex-shrink: 0;
}

.meta-item span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
  min-width: 0;
}

/* 公告正文 */
.notice-body {
  /* padding: 0 16px; */
}

.content-section {
  background-color: #fff;
  border-radius: 8px;
  padding: 20px;
  margin-top: 12px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #323233;
  margin: 0 0 16px 0;
  padding-bottom: 8px;
  border-bottom: 2px solid #1989fa;
  display: inline-block;
}

.content-text {
  font-size: 15px;
  line-height: 1.6;
  color: #323233;
}

.content-text :deep(p) {
  margin: 0 0 12px 0;
}

.content-text :deep(h4) {
  font-size: 16px;
  font-weight: 600;
  color: #323233;
  margin: 20px 0 12px 0;
}

.content-text :deep(ul),
.content-text :deep(ol) {
  margin: 12px 0;
  padding-left: 20px;
}

.content-text :deep(li) {
  margin: 8px 0;
  line-height: 1.5;
}

.content-text :deep(strong) {
  font-weight: 600;
  color: #1989fa;
}

/* 附件区域 */
.attachments-section {
  background-color: #fff;
  border-radius: 8px;
  padding: 20px;
  margin-top: 12px;
}

.attachments-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.attachment-item {
  display: flex;
  align-items: center;
  padding: 12px;
  background-color: #f7f8fa;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.attachment-item:hover {
  background-color: #f2f3f5;
}

.attachment-item:active {
  background-color: #ebedf0;
}

.attachment-icon {
  width: 40px;
  height: 40px;
  background-color: #1989fa;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  margin-right: 12px;
}

.attachment-info {
  flex: 1;
}

.attachment-name {
  font-size: 14px;
  font-weight: 500;
  color: #323233;
  margin-bottom: 4px;
}

.attachment-size {
  font-size: 12px;
  color: #969799;
}

.attachment-action {
  padding: 8px;
}

/* 操作按钮区域 */
.action-section {
  display: flex;
  gap: 12px;
  margin-top: 20px;
}

.action-btn {
  flex: 1;
  height: 44px;
  border-radius: 22px;
}

/* 相关公告 */
.related-section {
  background-color: #fff;
  border-radius: 8px;
  padding: 20px;
  margin-top: 12px;
}

.related-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.related-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  background-color: #f7f8fa;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.related-item:hover {
  background-color: #f2f3f5;
}

.related-content {
  flex: 1;
}

.related-title {
  font-size: 14px;
  font-weight: 500;
  color: #323233;
  margin: 0 0 4px 0;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.related-date {
  font-size: 12px;
  color: #969799;
  margin: 0;
}

.related-arrow {
  color: #c8c9cc;
  margin-left: 8px;
}

/* 错误状态 */
.error-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  padding: 40px 20px;
}

.error-content {
  text-align: center;
}

.error-title {
  font-size: 18px;
  font-weight: 600;
  color: #323233;
  margin: 16px 0 8px 0;
}

.error-description {
  font-size: 14px;
  color: #969799;
  margin: 0 0 24px 0;
}

.error-btn {
  width: 120px;
  height: 40px;
  border-radius: 20px;
}

/* 响应式设计 */
@media (max-width: 375px) {
  .notice-header {
    padding: 16px 12px;
  }

  .notice-title {
    font-size: 18px;
  }

  .notice-body {
    /* padding: 0 12px; */
  }

  .content-section,
  .attachments-section,
  .related-section {
    padding: 16px;
  }
}

@media (min-width: 768px) {
  .notice-content {
    max-width: 600px;
    margin: 0 auto;
  }
}
</style>