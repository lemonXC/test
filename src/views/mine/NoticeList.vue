<template>
  <div class="notice-list">
    <!-- 导航栏 -->
    <van-nav-bar title="公告通知" left-text="返回" fixed left-arrow @click-left="onBack" class="nav-bar" />

    <!-- 加载状态 -->
    <div class="loading-container" v-if="loading">
      <div class="loading-content">
        <van-loading size="24px" color="#1989fa">加载中...</van-loading>
      </div>
    </div>

    <!-- 公告列表 -->
    <div class="notice-content" v-if="!loading">
      <!-- 搜索框 -->
      <div class="search-section">
        <van-search v-model="searchKeyword" placeholder="搜索公告标题或内容" fixed @search="onSearch" @clear="onClear" show-action>
          <template #action>
            <div @click="onSearch">搜索</div>
          </template>
        </van-search>
      </div>

      <!-- 筛选标签 -->
      <!-- <div class="filter-section">
        <van-tabs v-model:active="activeTab" @change="onTabChange" class="filter-tabs">
          <van-tab title="全部" name="all"></van-tab>
          <van-tab title="重要公告" name="important"></van-tab>
          <van-tab title="系统通知" name="system"></van-tab>
          <van-tab title="活动公告" name="activity"></van-tab>
        </van-tabs>
      </div> -->

      <!-- 公告列表区域 -->
      <div class="notice-list-container">
        <div v-if="filteredNotices.length === 0" class="empty-state">
          <div class="empty-icon">
            <van-icon name="notes-o" size="48" color="#c8c9cc" />
          </div>
          <div class="empty-text">
            <h3 class="empty-title">暂无公告</h3>
            <p class="empty-description">当前没有符合条件的公告信息</p>
          </div>
        </div>

        <div v-else class="notice-items">
          <div v-for="notice in filteredNotices" :key="notice.id" class="notice-item" @click="goToDetail(notice)">
            <!-- 公告类型标签和日期 -->
            <div class="notice-header">
              <van-tag
                :type="getTagType(notice.type)"
                size="small"
                class="notice-tag"
              >
                {{ getTypeText(notice.type) }}
              </van-tag>
              <span class="notice-date">{{ notice.publishTime }}</span>
            </div>

            <!-- 公告标题 -->
            <h3 class="notice-title">{{ notice.title }}</h3>

            <!-- 公告摘要 -->
            <p class="notice-summary">{{ notice.summary }}</p>

            <!-- 公告底部信息 -->
            <!-- <div class="notice-footer">
              <div class="notice-meta">
                <span class="publisher">{{ notice.publisher }}</span>
                <span class="read-count">阅读 {{ notice.readCount }}</span>
              </div>
              <van-icon name="arrow" class="arrow-icon" />
            </div> -->

            <!-- 重要公告标识 -->
            <!-- <div v-if="notice.isImportant" class="important-badge">
              <van-icon name="warning-o" color="#ff6b35" />
            </div> -->
          </div>
        </div>
      </div>

      <!-- 加载更多 -->
      <div class="load-more-section" v-if="hasMore && filteredNotices.length > 0">
        <van-button type="default" size="large" :loading="loadingMore" @click="loadMore" class="load-more-btn">
          {{ loadingMore ? '加载中...' : '加载更多' }}
        </van-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'

const router = useRouter()

// 响应式数据
const loading = ref(true)
const loadingMore = ref(false)
const hasMore = ref(true)
const searchKeyword = ref('')
const activeTab = ref('all')
const notices = ref([])

// 模拟公告数据
const mockNotices = [
  {
    id: 1,
    title: '服务器升级公告',
    summary: '为了提供更好的服务体验，我们将于本周末进行系统维护升级，届时部分功能可能暂时无法使用...',
    content: '尊敬的用户，为了提供更好的服务体验，我们将于2024年1月20日22:00-24:00进行系统维护升级。维护期间，部分功能可能暂时无法使用，给您带来的不便敬请谅解。',
    type: 'system',
    isImportant: true,
    publisher: '系统管理员',
    publishTime: '2024-01-18 14:30:00',
    readCount: 1256,
    attachments: []
  },
  {
    id: 2,
    title: '新年福利大放送',
    summary: '春节期间，我们为用户准备了丰富的福利活动，包括签到奖励、抽奖活动等，欢迎参与...',
    content: '亲爱的用户，春节将至，我们为大家准备了丰富的新年福利活动。活动时间：2024年2月1日-2月15日。活动内容包括：1.每日签到送积分 2.幸运抽奖赢大奖 3.邀请好友享优惠',
    type: 'activity',
    isImportant: false,
    publisher: '运营团队',
    publishTime: '2024-01-17 10:15:00',
    readCount: 892,
    attachments: [
      { name: '活动详情.pdf', url: '/files/activity-details.pdf', type: 'pdf' }
    ]
  },
  {
    id: 3,
    title: '用户隐私政策更新说明',
    summary: '根据最新的法律法规要求，我们对用户隐私政策进行了更新，请仔细阅读相关条款...',
    content: '尊敬的用户，根据《个人信息保护法》等相关法律法规的要求，我们对《用户隐私政策》进行了更新。主要更新内容包括：1.明确个人信息收集范围 2.完善信息使用说明 3.强化用户权利保障',
    type: 'important',
    isImportant: true,
    publisher: '法务部',
    publishTime: '2024-01-16 16:45:00',
    readCount: 2341,
    attachments: [
      { name: '隐私政策更新说明.docx', url: '/files/privacy-policy.docx', type: 'doc' }
    ]
  },
  {
    id: 4,
    title: '新增智能客服功能',
    summary: '我们新增了AI智能客服功能，可以为您提供24小时在线服务，快速解答常见问题...',
    content: '为了提升用户服务体验，我们正式上线AI智能客服功能。该功能具备以下特点：1.24小时在线服务 2.快速响应用户咨询 3.智能问题分类处理 4.支持多轮对话交互',
    type: 'feature',
    isImportant: false,
    publisher: '产品团队',
    publishTime: '2024-01-15 09:20:00',
    readCount: 567,
    attachments: []
  },
  {
    id: 5,
    title: '防范网络诈骗注意事项',
    summary: '近期网络诈骗案件频发，请广大用户提高警惕，注意保护个人信息和财产安全...',
    content: '近期，网络诈骗案件呈上升趋势，为保护用户权益，特发布安全提醒：1.不要轻信陌生电话和短信 2.不要随意点击可疑链接 3.不要向陌生人透露个人信息 4.如遇可疑情况请及时联系客服',
    type: 'security',
    isImportant: true,
    publisher: '安全中心',
    publishTime: '2024-01-14 11:30:00',
    readCount: 1789,
    attachments: [
      { name: '防诈骗指南.pdf', url: '/files/anti-fraud-guide.pdf', type: 'pdf' }
    ]
  }
]

// 计算属性：过滤后的公告列表
const filteredNotices = computed(() => {
  let result = notices.value

  // 按类型筛选
  if (activeTab.value !== 'all') {
    result = result.filter(notice => notice.type === activeTab.value)
  }

  // 按关键词搜索
  if (searchKeyword.value.trim()) {
    const keyword = searchKeyword.value.trim().toLowerCase()
    result = result.filter(notice =>
      notice.title.toLowerCase().includes(keyword) ||
      notice.summary.toLowerCase().includes(keyword)
    )
  }

  // 按时间倒序排列
  return result.sort((a, b) => new Date(b.publishTime) - new Date(a.publishTime))
})

// 方法
const onBack = () => {
  router.back()
}

const onSearch = () => {
  // 搜索逻辑已在计算属性中实现
  showToast(`搜索"${searchKeyword.value}"`)
}

const onClear = () => {
  searchKeyword.value = ''
}

const onTabChange = (name) => {
  activeTab.value = name
}

const goToDetail = (notice) => {
  router.push({
    name: 'NoticeDetail',
    params: { id: notice.id },
    query: { from: 'notice-list' }
  })
}

const loadMore = async () => {
  loadingMore.value = true

  // 模拟加载更多数据
  setTimeout(() => {
    // 这里可以添加更多数据到 notices.value
    loadingMore.value = false
    hasMore.value = false // 模拟没有更多数据
    showToast('已加载全部公告')
  }, 1000)
}

const getTagType = (type) => {
  const typeMap = {
    important: 'danger',    // 红色 - 重要公告
    system: 'primary',      // 蓝色 - 系统通知
    activity: 'success',    // 绿色 - 活动公告
    feature: 'warning',     // 橙色 - 功能更新
    security: 'danger'      // 红色 - 安全提醒
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

const formatDate = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now - date
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days === 0) {
    return '今天'
  } else if (days === 1) {
    return '昨天'
  } else if (days < 7) {
    return `${days}天前`
  } else {
    return date.toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric'
    })
  }
}

// 生命周期
onMounted(async () => {
  try {
    // 模拟API调用
    setTimeout(() => {
      notices.value = mockNotices
      loading.value = false
    }, 800)
  } catch (error) {
    console.error('加载公告列表失败:', error)
    showToast('加载失败，请重试')
    loading.value = false
  }
})
</script>

<style scoped>
.notice-list {
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

.notice-content {
  /* padding: 10px; */
  margin-top: 46px;
}

/* 搜索区域 */
.search-section {
  background-color: #fff;
  border-bottom: 1px solid #ebedf0;
}

/* 筛选区域 */
.filter-section {
  background-color: #fff;
  border-bottom: 1px solid #ebedf0;
}

.filter-tabs :deep(.van-tabs__nav) {
  padding: 0 16px;
}

.filter-tabs :deep(.van-tab) {
  font-size: 14px;
}

/* 公告列表容器 */
.notice-list-container {
  padding: 0 16px;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.empty-icon {
  margin-bottom: 16px;
}

.empty-title {
  font-size: 16px;
  font-weight: 500;
  color: #323233;
  margin: 0 0 8px 0;
}

.empty-description {
  font-size: 14px;
  color: #969799;
  margin: 0;
}

/* 公告条目 */
.notice-items {
  margin-top: 12px;
}

.notice-item {
  background-color: #fff;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.notice-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transform: translateY(-1px);
}

.notice-item:active {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

/* 公告头部 */
.notice-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.notice-tag {
  font-size: 11px;
  font-weight: 500;
  border-radius: 12px;
  padding: 2px 8px;
  line-height: 1.4;
}

.notice-date {
  font-size: 12px;
  color: #969799;
  font-weight: 400;
}

/* 公告标题 */
.notice-title {
  font-size: 16px;
  font-weight: 600;
  color: #323233;
  margin: 0 0 8px 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 公告摘要 */
.notice-summary {
  font-size: 14px;
  color: #646566;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 公告底部 */
.notice-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.notice-meta {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: #969799;
}

.arrow-icon {
  color: #c8c9cc;
  font-size: 14px;
}

/* 重要公告标识 */
.important-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  background-color: rgba(255, 107, 53, 0.1);
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 加载更多 */
.load-more-section {
  padding: 20px 16px;
  text-align: center;
}

.load-more-btn {
  width: 100%;
  height: 44px;
  border-radius: 22px;
  background-color: #f7f8fa;
  border: 1px solid #ebedf0;
  color: #646566;
}

.load-more-btn:active {
  background-color: #f2f3f5;
}

/* 响应式设计 */
@media (max-width: 375px) {
  .notice-item {
    /* padding: 12px; */
    margin-bottom: 8px;
  }

  .notice-title {
    font-size: 15px;
  }

  .notice-summary {
    font-size: 13px;
  }
}

@media (min-width: 768px) {
  .notice-list-container {
    max-width: 600px;
    margin: 0 auto;
    padding: 0 20px;
  }
}
</style>