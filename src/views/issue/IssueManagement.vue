<template>
  <div class="issue-management">
    <!-- 导航栏 -->
    <van-nav-bar
      title="问题管理"
      left-text="返回"
      fixed
      left-arrow
      @click-left="onBack"
      class="nav-bar"
    />

    <!-- 筛选栏 -->
    <div class="filter-bar">
      <!-- <van-search
        v-model="keyword"
        placeholder="请输入关键词搜索（标题/内容）"
        class="filter-item"
        show-action
        @search="onImmediateSearch"
      >
        <template #action>
          <van-button size="small" type="primary" @click="onImmediateSearch">搜索</van-button>
        </template>
      </van-search> -->

      <!-- <div class="date-range">
        <van-field
          v-model="startDate"
          type="date"
          label="开始日期"
          placeholder="选择开始日期"
          class="filter-item"
        />
        <van-field
          v-model="endDate"
          type="date"
          label="结束日期"
          placeholder="选择结束日期"
          class="filter-item"
        />
      </div> -->
    </div>

    <!-- 状态选项卡 -->
    <van-tabs v-model:active="activeTab" @change="onTabChange" class="status-tabs">
      <van-tab title="全部" name="all">
        <IssueList 
          :issues="displayedAllIssues" 
          :loading="loading"
          :finished="finished"
          :custom-status-text="IssueManagementStatusText"
          :custom-status-color="IssueManagementStatusColor"
          @click-item="onIssueClick"
          @refresh="onRefresh"
          @load-more="onLoadMore"
        />
      </van-tab>
      <van-tab title="待回复" name="pending_reply">
        <IssueList 
          :issues="displayedPendingReplyIssues" 
          :loading="loading"
          :finished="finished"
          :custom-status-text="IssueManagementStatusText"
          :custom-status-color="IssueManagementStatusColor"
          @click-item="onIssueClick"
          @refresh="onRefresh"
          @load-more="onLoadMore"
        />
      </van-tab>
      <van-tab title="待督办" name="pending_supervise">
        <IssueList 
          :issues="displayedPendingSuperviseIssues" 
          :loading="loading"
          :finished="finished"
          :custom-status-text="IssueManagementStatusText"
          :custom-status-color="IssueManagementStatusColor"
          @click-item="onIssueClick"
          @refresh="onRefresh"
          @load-more="onLoadMore"
        />
      </van-tab>
      <!-- <van-tab title="已回复" name="replied">
        <IssueList 
          :issues="displayedRepliedIssues" 
          :loading="loading"
          :finished="finished"
          :custom-status-text="IssueManagementStatusText"
          :custom-status-color="IssueManagementStatusColor"
          @click-item="onIssueClick"
          @refresh="onRefresh"
          @load-more="onLoadMore"
        />
      </van-tab> -->
    </van-tabs>
    <!-- <van-floating-bubble
      axis="xy"
      icon="question-o"
      @click="onAskQuestion"
      class="floating-button"
    /> -->
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

const router = useRouter()
const route = useRoute()

// 从URL参数中获取初始tab，如果没有则默认为'all'
const getInitialTab = () => {
  const tabParam = route.query.tab
  const validTabs = ['all', 'pending_reply', 'pending_supervise', 'replied']
  return validTabs.includes(tabParam) ? tabParam : 'all'
}

const activeTab = ref(getInitialTab())
const loading = ref(false)
const finished = ref(false)

// 搜索与日期筛选
const keyword = ref('')
const debouncedKeyword = ref('')
const startDate = ref('')
const endDate = ref('')
let debounceTimer = null

const onImmediateSearch = () => {
  debouncedKeyword.value = keyword.value.trim()
}

watch(keyword, (val) => {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    debouncedKeyword.value = val.trim()
  }, 400)
})

// 将原有数据结构转换为与IssueList组件兼容的格式
const convertToIssueListFormat = (originalIssues) => {
  return originalIssues.map(issue => ({
    id: issue.id,
    title: issue.title,
    content: issue.content,
    status: convertStatus(issue.status),
    category: '问题管理',
    created_at: issue.createTime,
    created_by: 'admin',
    updated_at: issue.updateTime,
    department: '管理部门',
    processing_started_at: null,
    processing_started_by: null,
    resolved_at: null,
    resolved_by: null,
    reviewed_at: null,
    reminder_count: 0,
    attachments: issue.attachments.map(att => ({
      id: Math.random(),
      name: att.name,
      type: att.type === 'image' ? 'image' : 'document',
      url: att.url,
      size: '1.0MB',
      created_at: issue.createTime
    }))
  }))
}

// IssueManagement 专用状态枚举
const IssueManagementStatus = {
  PENDING_REPLY: 'pending_reply',
  PENDING_SUPERVISE: 'pending_supervise', 
  REPLIED: 'replied',
  COMPLETED: 'completed'
}

// IssueManagement 专用状态文本映射
const IssueManagementStatusText = {
  [IssueManagementStatus.PENDING_REPLY]: '待回复',
  [IssueManagementStatus.PENDING_SUPERVISE]: '待督办',
  [IssueManagementStatus.REPLIED]: '已回复',
  [IssueManagementStatus.COMPLETED]: '已完成',
  // 兼容原有 IssueStatus 枚举
  [IssueStatus.PENDING]: '待处理',
  [IssueStatus.PROCESSING]: '处理中',
  [IssueStatus.RESOLVED]: '待评价',
  [IssueStatus.REVIEWED]: '已评价'
}

// IssueManagement 专用状态颜色映射
const IssueManagementStatusColor = {
  [IssueManagementStatus.PENDING_REPLY]: '#ff9500', // 橙色
  [IssueManagementStatus.PENDING_SUPERVISE]: '#1989fa', // 蓝色
  [IssueManagementStatus.REPLIED]: '#07c160', // 绿色
  [IssueManagementStatus.COMPLETED]: '#969799', // 灰色
  // 兼容原有 IssueStatus 枚举
  [IssueStatus.PENDING]: '#ff9500',
  [IssueStatus.PROCESSING]: '#1989fa', 
  [IssueStatus.RESOLVED]: '#07c160',
  [IssueStatus.REVIEWED]: '#969799'
}

// 状态转换函数 - 扩展支持已回复状态
const convertStatus = (originalStatus) => {
  const statusMap = {
    'pending_reply': IssueManagementStatus.PENDING_REPLY,
    'pending_supervise': IssueManagementStatus.PENDING_SUPERVISE,
    'replied': IssueManagementStatus.REPLIED, // 新增已回复状态
    'completed': IssueManagementStatus.COMPLETED
  }
  return statusMap[originalStatus] || IssueManagementStatus.PENDING_REPLY
}

// 原始问题数据
const originalIssues = [
  {
    id: 1,
    title: '关于小区停车位分配不合理的问题反映',
    content: '我们小区停车位分配存在严重不公平现象，希望相关部门能够重视并解决...',
    status: 'pending_supervise',
    createTime: '2024-01-15 10:30:00',
    updateTime: '2024-01-15 10:30:00',
    attachments: [
      { type: 'image', name: '停车位现状.jpg', url: '/images/parking1.jpg' },
      { type: 'document', name: '投诉材料.pdf', url: '/files/complaint.pdf' }
    ]
  },
  {
    id: 2,
    title: '道路积水严重影响出行安全',
    content: '每逢下雨天，我们这条路就会严重积水，给居民出行带来很大不便...',
    status: 'pending_reply',
    createTime: '2024-01-14 14:20:00',
    updateTime: '2024-01-16 09:15:00',
    attachments: [
      { type: 'image', name: '积水现场1.jpg', url: '/images/water1.jpg' },
      { type: 'image', name: '积水现场2.jpg', url: '/images/water2.jpg' }
    ]
  },
  {
    id: 3,
    title: '噪音污染问题持续困扰居民生活质量',
    content: '附近工地夜间施工噪音严重，影响居民正常休息，希望能够规范施工时间...',
    status: 'pending_supervise',
    createTime: '2024-01-13 20:45:00',
    updateTime: '2024-01-17 11:20:00',
    attachments: [
      { type: 'audio', name: '噪音录音.mp3', url: '/audio/noise.mp3' }
    ]
  },
  {
    id: 4,
    title: '公共设施损坏需要及时维修',
    content: '小区内健身器材多处损坏，存在安全隐患，请相关部门尽快维修...',
    status: 'replied',
    createTime: '2024-01-12 16:10:00',
    updateTime: '2024-01-12 16:10:00',
    attachments: [
      { type: 'image', name: '损坏设施1.jpg', url: '/images/facility1.jpg' },
      { type: 'image', name: '损坏设施2.jpg', url: '/images/facility2.jpg' },
      { type: 'document', name: '维修申请表.doc', url: '/files/repair.doc' }
    ]
  },
  {
    id: 5,
    title: '小区绿化带需要补种植物',
    content: '小区部分绿化带植物枯死，影响整体环境美观，希望能够及时补种...',
    status: 'pending_reply',
    createTime: '2024-01-18 09:15:00',
    updateTime: '2024-01-18 09:15:00',
    attachments: [
      { type: 'image', name: '绿化现状.jpg', url: '/images/green1.jpg' }
    ]
  }
]

// 转换后的问题数据
const issues = ref(convertToIssueListFormat(originalIssues))

// 基础分组
const baseAllIssues = computed(() => issues.value)
const basePendingReplyIssues = computed(() => issues.value.filter(issue => issue.status === IssueManagementStatus.PENDING_REPLY))
const basePendingSuperviseIssues = computed(() => issues.value.filter(issue => issue.status === IssueManagementStatus.PENDING_SUPERVISE))
const baseRepliedIssues = computed(() => issues.value.filter(issue => issue.status === IssueManagementStatus.REPLIED))

// 过滤工具
const includesKeyword = (issue) => {
  const kw = debouncedKeyword.value.toLowerCase()
  if (!kw) return true
  return (
    (issue.title || '').toLowerCase().includes(kw) ||
    (issue.content || '').toLowerCase().includes(kw)
  )
}

const inDateRange = (issue) => {
  const sd = startDate.value ? new Date(startDate.value) : null
  const ed = endDate.value ? new Date(endDate.value) : null
  const d = new Date(issue.created_at)
  if (sd && ed && sd > ed) {
    showToast('结束日期不能早于开始日期')
    return true
  }
  if (sd && d < sd) return false
  if (ed) {
    const edEnd = new Date(ed)
    edEnd.setHours(23, 59, 59, 999)
    if (d > edEnd) return false
  }
  return true
}

const applyFilters = (list) => list.filter(issue => includesKeyword(issue) && inDateRange(issue))

// 过滤后的列表
const filteredAllIssues = computed(() => applyFilters(baseAllIssues.value))
const filteredPendingReplyIssues = computed(() => applyFilters(basePendingReplyIssues.value))
const filteredPendingSuperviseIssues = computed(() => applyFilters(basePendingSuperviseIssues.value))
const filteredRepliedIssues = computed(() => applyFilters(baseRepliedIssues.value))

// 分页后的展示列表
const currentPage = ref(1)
const pageSize = ref(10)
const getPaginated = (list) => list.slice(0, currentPage.value * pageSize.value)
const displayedAllIssues = computed(() => getPaginated(filteredAllIssues.value))
const displayedPendingReplyIssues = computed(() => getPaginated(filteredPendingReplyIssues.value))
const displayedPendingSuperviseIssues = computed(() => getPaginated(filteredPendingSuperviseIssues.value))
const displayedRepliedIssues = computed(() => getPaginated(filteredRepliedIssues.value))

// 分页相关状态
const totalCount = ref(0)
const hasMoreData = ref(true)

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

const updatePaginationState = () => {
  const map = {
    all: filteredAllIssues.value,
    pending_reply: filteredPendingReplyIssues.value,
    pending_supervise: filteredPendingSuperviseIssues.value,
    replied: filteredRepliedIssues.value
  }
  const activeList = map[activeTab.value] || filteredAllIssues.value
  const displayed = getPaginated(activeList)
  totalCount.value = activeList.length
  finished.value = displayed.length >= activeList.length
  hasMoreData.value = !finished.value
}

// 选项卡切换
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
  updatePaginationState()
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
      issues.value = convertToIssueListFormat(originalIssues)
      totalCount.value = originalIssues.length
    }
    
    // 根据当前筛选与分页更新状态
    updatePaginationState()
    
  } catch (error) {
    showToast('加载失败，请重试')
  } finally {
    loading.value = false
  }
}

// 点击问题项
const onIssueClick = (issue) => {
  const query = { 
    source: 'issue_management',
    ...(activeTab.value !== 'all' ? { from: activeTab.value } : {}),
    status: issue.status
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
  updatePaginationState()
}

// 返回上一页
const onBack = () => {
  router.back()
}

// 监听路由参数变化，支持通过URL参数切换tab
watch(() => route.query.tab, (newTab) => {
  if (newTab && ['all', 'pending_reply', 'pending_supervise', 'replied'].includes(newTab) && newTab !== activeTab.value) {
    activeTab.value = newTab
    resetPagination()
    scrollToTop()
    loadIssues()
  }
})

onMounted(() => {
  scrollToTop()
  loadIssues()
  updatePaginationState()
})

// 监听筛选条件变化，实时查询
watch([debouncedKeyword, startDate, endDate], () => {
  loading.value = true
  resetPagination()
  updatePaginationState()
  setTimeout(() => { loading.value = false }, 200)
})

// 快捷与重置
const formatDate = (d) => {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

const setRangeDays = (days) => {
  const today = new Date()
  const start = new Date()
  start.setDate(today.getDate() - Math.max(days - 1, 0))
  startDate.value = formatDate(start)
  endDate.value = formatDate(today)
}

const clearDates = () => {
  startDate.value = ''
  endDate.value = ''
}

const resetFilters = () => {
  keyword.value = ''
  debouncedKeyword.value = ''
  clearDates()
  resetPagination()
  updatePaginationState()
}
</script>

<style scoped>
.issue-management {
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
  background-color: white;
  /* margin-bottom: 8px; */
  /* margin-top: 46px; */
}

.filter-bar {
  background-color: #fff;
  padding: 12px;
  margin-top: 8px;
  margin-bottom: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.filter-item {
  margin-bottom: 8px;
}

.date-range {
  display: flex;
  gap: 12px;
}

.quick-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.quick-label {
  color: #969799;
}

.status-tabs :deep(.van-tab) {
  font-weight: 500;
}

.status-tabs :deep(.van-tab--active) {
  color: #1989fa;
  font-weight: 600;
}

.status-tabs :deep(.van-tabs__line) {
  background-color: #1989fa;
}

.issue-list {
  /* padding: 0 16px; */
  /* margin-top: 10px; */
}

.issue-item {
  margin-bottom: 8px;
  border-radius: 8px;
  background-color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.issue-item :deep(.van-cell__title) {
  font-weight: 500;
  color: #323233;
  line-height: 1.4;
}

.issue-item :deep(.van-cell__label) {
  color: #969799;
  font-size: 12px;
  margin-top: 4px;
}

.status-tag {
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 500;
}

.empty-state {
  margin-top: 100px;
}

.empty-state :deep(.van-empty__description) {
  color: #969799;
  font-size: 14px;
}

:deep(.van-floating-bubble){
  top: -100px!important;
}

.floating-button{
  color: red;
}
</style>