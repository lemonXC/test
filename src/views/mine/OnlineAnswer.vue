<template>
  <div class="online-answer">
    <!-- 导航栏 -->
    <van-nav-bar
      title="在线解答"
      left-text="返回"
      left-arrow
      @click-left="onBack"
      class="nav-bar"
    />

    <!-- 状态选项卡 -->
    <van-tabs v-model:active="activeTab" @change="onTabChange" class="status-tabs">
      <van-tab title="全部" name="all">
        <IssueList 
          :issues="allIssues" 
          :loading="loading"
          :finished="finished"
          :custom-status-text="OnlineAnswerStatusText"
          :custom-status-color="OnlineAnswerStatusColor"
          @click-item="onIssueClick"
          @refresh="onRefresh"
          @load-more="onLoadMore"
        />
      </van-tab>
      <van-tab title="待回复" name="pending_reply">
        <IssueList 
          :issues="pendingReplyIssues" 
          :loading="loading"
          :finished="finished"
          :custom-status-text="OnlineAnswerStatusText"
          :custom-status-color="OnlineAnswerStatusColor"
          @click-item="onIssueClick"
          @refresh="onRefresh"
          @load-more="onLoadMore"
        />
      </van-tab>
    </van-tabs>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast } from 'vant'
import IssueList from '@/components/IssueList.vue'
import { 
  IssueStatus, 
  StatusText, 
  StatusColor 
} from '@/data/mockIssueData.js'

// OnlineAnswer 页面专用的状态标签配置
const OnlineAnswerStatus = {
  PENDING_REPLY: 'PENDING_REPLY',  // 待回复
  REPLIED: 'REPLIED'               // 已回复
}

// OnlineAnswer 页面专用的状态文本映射
const OnlineAnswerStatusText = {
  [OnlineAnswerStatus.PENDING_REPLY]: '待回复',
  [OnlineAnswerStatus.REPLIED]: '已回复',
  // 保持与原有状态的兼容性
  [IssueStatus.PENDING]: '待处理',
  [IssueStatus.PROCESSING]: '处理中', 
  [IssueStatus.RESOLVED]: '已处理',
  [IssueStatus.REVIEWED]: '已评价'
}

// OnlineAnswer 页面专用的状态颜色映射
const OnlineAnswerStatusColor = {
  [OnlineAnswerStatus.PENDING_REPLY]: '#ff976a',  // 橙色 - 待回复
  [OnlineAnswerStatus.REPLIED]: '#07c160',        // 绿色 - 已回复
  // 保持与原有状态的兼容性
  [IssueStatus.PENDING]: '#ff976a',
  [IssueStatus.PROCESSING]: '#1989fa',
  [IssueStatus.RESOLVED]: '#07c160',
  [IssueStatus.REVIEWED]: '#969799'
}

const router = useRouter()
const route = useRoute()

// 从URL参数中获取初始tab，如果没有则默认为'all'
const getInitialTab = () => {
  const tabParam = route.query.tab
  const validTabs = ['all', 'pending_reply']
  return validTabs.includes(tabParam) ? tabParam : 'all'
}

const activeTab = ref(getInitialTab())
const loading = ref(false)
const finished = ref(false)

// 原始问题数据
const originalIssues = ref([
  {
    id: 1,
    title: '关于小区停车位分配不合理的问题反映',
    content: '我们小区停车位分配存在严重不公平现象，希望相关部门能够重视并解决...',
    status: 'pending_reply',
    createTime: '2024-01-15 10:30:00',
    updateTime: '2024-01-15 10:30:00',
    attachments: [
      { type: 'image', name: '停车位现状.jpg', url: '/images/parking1.jpg' },
      { type: 'document', name: '投诉材料.pdf', url: '/files/complaint.pdf' }
    ],
    departmentReplies: [],
    expertHelp: null
  },
  {
    id: 2,
    title: '道路积水严重影响出行安全',
    content: '每逢下雨天，我们这条路就会严重积水，给居民出行带来很大不便...',
    status: 'pending_reply',
    createTime: '2024-01-14 14:20:00',
    updateTime: '2024-01-14 14:20:00',
    attachments: [
      { type: 'image', name: '积水照片1.jpg', url: '/images/water1.jpg' },
      { type: 'image', name: '积水照片2.jpg', url: '/images/water2.jpg' }
    ],
    departmentReplies: [],
    expertHelp: null
  },
  {
    id: 3,
    title: '社区健身器材损坏需要维修',
    content: '社区内多个健身器材出现损坏，存在安全隐患，请尽快安排维修...',
    status: 'replied',
    createTime: '2024-01-13 09:15:00',
    updateTime: '2024-01-13 16:45:00',
    attachments: [
      { type: 'image', name: '损坏器材.jpg', url: '/images/equipment.jpg' }
    ],
    departmentReplies: [
      {
        id: 1,
        department: '社区管理办',
        content: '您好，我们已收到您的反映，将在3个工作日内安排专业人员进行检修。',
        replyTime: '2024-01-13 16:45:00',
        attachments: []
      }
    ],
    expertHelp: null
  }
])

// 状态映射函数 - 扩展支持 OnlineAnswer 专用状态
const convertStatus = (originalStatus) => {
  const statusMap = {
    'pending_assign': IssueStatus.PENDING,
    'pending_reply': OnlineAnswerStatus.PENDING_REPLY,  // 映射到专用的"待回复"状态
    'pending_supervise': IssueStatus.PROCESSING,
    'replied': OnlineAnswerStatus.REPLIED,              // 映射到专用的"已回复"状态
    'resolved': IssueStatus.RESOLVED,
    'closed': IssueStatus.REVIEWED
  }
  return statusMap[originalStatus] || IssueStatus.PENDING
}

// 转换为 IssueList 组件所需的格式
const convertToIssueListFormat = (originalData) => {
  return originalData.map(issue => ({
    id: issue.id,
    title: issue.title,
    content: issue.content,
    status: convertStatus(issue.status),
    category: '在线解答',
    created_at: issue.createTime,
    created_by: 'current_user',
    updated_at: issue.updateTime,
    department: '相关部门',
    processing_started_at: null,
    processing_started_by: null,
    resolved_at: null,
    resolved_by: null,
    reviewed_at: null,
    reminder_count: 0,
    attachments: issue.attachments || []
  }))
}

// 转换后的问题数据
const issues = ref(convertToIssueListFormat(originalIssues.value))

// 分页相关状态
const currentPage = ref(1)
const pageSize = ref(10)
const totalCount = ref(0)
const hasMoreData = ref(true)

// 计算不同状态的问题列表
const allIssues = computed(() => issues.value)

const pendingReplyIssues = computed(() => 
  issues.value.filter(issue => {
    // 支持新的 OnlineAnswer 专用状态
    return issue.status === OnlineAnswerStatus.PENDING_REPLY
  })
)

// 获取当前标签页对应的数据
const getCurrentTabData = () => {
  switch (activeTab.value) {
    case 'pending_reply':
      return pendingReplyIssues.value
    default:
      return allIssues.value
  }
}

// 滚动到页面顶部
const scrollToTop = () => {
  nextTick(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0
  })
}

// 重置分页状态
const resetPagination = () => {
  currentPage.value = 1
  finished.value = false
  hasMoreData.value = true
}

// 切换标签页
const onTabChange = (name) => {
  activeTab.value = name
  
  // 更新URL参数，保持状态同步
  router.replace({
    path: route.path,
    query: { ...route.query, tab: name }
  })
  
  resetPagination()
  scrollToTop()
  loadIssues()
}

// 加载问题列表
const loadIssues = async (isLoadMore = false) => {
  if (loading.value) return
  
  loading.value = true
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 800))
    
    if (!isLoadMore) {
      // 初始加载或刷新时，重新转换数据
      issues.value = convertToIssueListFormat(originalIssues.value)
      totalCount.value = issues.value.length
    }
    
    // 检查是否还有更多数据
    hasMoreData.value = false
    finished.value = true
    
  } catch (error) {
    showToast('加载失败，请重试')
  } finally {
    loading.value = false
  }
}

// 点击问题项
const onIssueClick = (issue) => {
  const query = { 
    source: 'online_answer',
    ...(activeTab.value !== 'all' ? { from: activeTab.value } : {})
  }
  router.push({
    name: 'IssueDetail',
    params: { id: issue.id },
    query
  })
}

// 下拉刷新
const onRefresh = () => {
  resetPagination()
  loadIssues()
}

// 加载更多
const onLoadMore = () => {
  if (loading.value || finished.value || !hasMoreData.value) {
    return
  }
  
  if (issues.value.length === 0) {
    return
  }
  
  currentPage.value += 1
  loadIssues(true)
}

// 返回上一页
const onBack = () => {
  router.back()
}

// 监听路由参数变化，支持通过URL参数切换tab
watch(() => route.query.tab, (newTab) => {
  if (newTab && ['all', 'pending_reply'].includes(newTab) && newTab !== activeTab.value) {
    activeTab.value = newTab
    resetPagination()
    scrollToTop()
    loadIssues()
  }
})

// 页面加载时的初始化
onMounted(() => {
  scrollToTop()
  loadIssues()
})
</script>

<style scoped>
.online-answer {
  min-height: 100vh;
  background-color: #f7f8fa;
}

/* 
.nav-bar {
  background-color: #1989fa;
  color: white;
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

.status-tabs {
  background-color: #fff;
  margin-bottom: 10px;
}

.status-tabs :deep(.van-tabs__content) {
  background: #f7f8fa;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .status-tabs {
    margin-bottom: 8px;
  }
}
</style>