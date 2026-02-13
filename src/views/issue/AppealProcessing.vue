<template>
  <div class="appeal-processing">
    <!-- 顶部导航栏 -->
    <van-nav-bar title="诉求处理" left-text="返回" fixed left-arrow @click-left="onBack" class="nav-bar" />
    <!-- 搜索与筛选栏 -->
    <div class="filter-bar">
      <!-- 搜索固定顶部，占满宽度 -->
      <van-search v-model="keyword" placeholder="请输入关键词搜索" class="filter-item" @search="onImmediateSearch">
        <!-- <template #action> -->
        <!-- <van-button size="small" type="primary" @click="onImmediateSearch">搜索</van-button> -->
        <!-- <div @click="onImmediateSearch" style="font-size: 16px; font-weight: 500;color: #1989fa;">搜索</div>
        </template> -->
      </van-search>

      <!-- 第一行：类型、状态、更多（均匀分布） -->
      <div class="primary-row">
        <van-dropdown-menu class="dropdown" :close-on-click-outside="false">
          <van-dropdown-item v-model="selectedType" :options="typeOptions" />
          <van-dropdown-item v-model="selectedStatus" :options="statusOptions" />
          <van-dropdown-item title="更多筛选" ref="custom">
            <van-field :model-value="typeText" readonly label="留言类型" placeholder="请选择留言类型"
              @click="openTypeActionSheet" />
            <van-field :model-value="topRegionText" readonly label="事件区域" placeholder="请选择区域"
              @click="openRegionPopup('top')" />
            <van-field :model-value="dateRangeText" readonly label="提问时间" placeholder="请选择日期范围"
              @click="openTopCalendar" />
            <van-button style="width: 96%;margin: auto;margin-bottom: 10px; " type="primary" border-color="transparent"
             block @click="onConfirm2">确认</van-button>
          </van-dropdown-item>
        </van-dropdown-menu>
      </div>

      <!-- 顶部日历（范围选择） -->
      <van-calendar v-model:show="showTopCalendar" type="range" @confirm="onTopCalendarConfirm" />
      <van-action-sheet v-model:show="showActionSheet" :actions="actions" cancel-text="取消" @select="selectType"
        @cancel="closeTypeActionSheet" />
    </div>

    <!-- 问题列表（无顶部tabs，保持与IssueManagement一致的样式与交互） -->
    <div style="margin-top: 188px;">
      <IssueList :issues="displayedIssues" :loading="loading" :finished="finished"
        :custom-status-text="IssueManagementStatusText" :custom-status-color="IssueManagementStatusColor"
        @click-item="onIssueClick" @refresh="onRefresh" @load-more="onLoadMore" />
    </div>

    <!-- 全局区域选择弹框：供顶部二级筛选与侧栏共同使用 -->
    <van-popup v-model:show="showRegionPopup" position="bottom" round :style="{ maxHeight: '75vh' }">
      <div class="region-popup">
        <van-cascader title="请选择区域"
          :model-value="regionPopupTarget === 'sidebar' ? advDraft.regionValue : selectedRegion"
          :options="regionOptions" :field-names="cascaderFieldNames" @change="onRegionChange"
          @finish="onRegionFinish" />
        <van-button style="width: 96%; margin: 10px auto;" type="primary" block
          @click="confirmCurrentRegion">确认</van-button>
      </div>
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast } from 'vant'
import IssueList from '@/components/IssueList.vue'
import { IssueStatus } from '@/data/mockIssueData.js'

const router = useRouter()
const route = useRoute()

// 加载状态
const loading = ref(false)
const finished = ref(false)
const actions = ref([
  { name: '我有诉求' },
  { name: '我要建言' },
  { name: '我要咨询' },
  { name: '我要爆料' }
])

// 搜索与日期筛选
const keyword = ref<string>('')
const debouncedKeyword = ref<string>('')
const showAction = ref<boolean>(false)
const startDate = ref<string>('')
const endDate = ref<string>('')
let debounceTimer = null

const onImmediateSearch = () => {
  debouncedKeyword.value = keyword.value.trim()
}

const onFocus = () => {
  showAction.value = true;
}
const onCancel = () => {
  showAction.value = false;
}

watch(keyword, (val) => {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    debouncedKeyword.value = val.trim()
  }, 300)
})

// 下拉筛选：问题类型与处理状态
const selectedType = ref<string>('all')
const selectedStatus = ref<string>('all')

const typeOptions = [
  { text: '全部类型', value: 'all' },
  { text: '反映人问题', value: 'traffic' },
  { text: '举报问题', value: 'municipal' },
  { text: '网格员问题', value: 'environment' }
]

// IssueManagement 专用状态枚举与显示（与 IssueManagement.vue 保持一致）
const IssueManagementStatus = {
  PENDING_REPLY: 'pending_reply',
  PENDING_SUPERVISE: 'pending_supervise',
  REPLIED: 'replied',
  COMPLETED: 'completed'
}

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

// 状态下拉选项（与 IssueManagement 状态保持一致）
const statusOptions = [
  { text: '全部状态', value: 'all' },
  { text: '待审核', value: IssueManagementStatus.PENDING_REPLY },
  { text: '待分拨', value: IssueManagementStatus.PENDING_SUPERVISE },
  { text: '待答复', value: IssueManagementStatus.REPLIED },
  { text: '回复待审核', value: IssueManagementStatus.REPLIED },
  { text: '已完结', value: IssueManagementStatus.COMPLETED }
]

// 状态转换函数（保持与 IssueManagement.vue 一致）
const convertStatus = (originalStatus) => {
  const statusMap = {
    'pending_reply': IssueManagementStatus.PENDING_REPLY,
    'pending_supervise': IssueManagementStatus.PENDING_SUPERVISE,
    'replied': IssueManagementStatus.REPLIED,
    'completed': IssueManagementStatus.COMPLETED
  }
  return statusMap[originalStatus] || IssueManagementStatus.PENDING_REPLY
}

// 原始问题数据（增加 issueType 字段用于类型筛选）
const originalIssues = [
  {
    id: 101,
    title: '关于小区停车位分配不合理的问题反映',
    content: '我们小区停车位分配存在严重不公平现象，希望相关部门能够重视并解决...',
    status: 'pending_supervise',
    issueType: 'community',
    createTime: '2024-02-15 10:30:00',
    updateTime: '2024-02-15 10:30:00',
    attachments: [
      { type: 'image', name: '停车位现状.jpg', url: '/images/parking1.jpg' },
      { type: 'document', name: '投诉材料.pdf', url: '/files/complaint.pdf' }
    ]
  },
  {
    id: 102,
    title: '道路积水严重影响出行安全',
    content: '每逢下雨天，我们这条路就会严重积水，给居民出行带来很大不便...',
    status: 'pending_reply',
    issueType: 'traffic',
    createTime: '2024-02-14 14:20:00',
    updateTime: '2024-02-16 09:15:00',
    attachments: [
      { type: 'image', name: '积水现场1.jpg', url: '/images/water1.jpg' },
      { type: 'image', name: '积水现场2.jpg', url: '/images/water2.jpg' }
    ]
  },
  {
    id: 103,
    title: '噪音污染问题持续困扰居民生活质量',
    content: '附近工地夜间施工噪音严重，影响居民正常休息，希望能够规范施工时间...',
    status: 'pending_supervise',
    issueType: 'environment',
    createTime: '2024-02-13 20:45:00',
    updateTime: '2024-02-17 11:20:00',
    attachments: [
      { type: 'audio', name: '噪音录音.mp3', url: '/audio/noise.mp3' }
    ]
  },
  {
    id: 104,
    title: '公共设施损坏需要及时维修',
    content: '小区内健身器材多处损坏，存在安全隐患，请相关部门尽快维修...',
    status: 'replied',
    issueType: 'municipal',
    createTime: '2024-02-12 16:10:00',
    updateTime: '2024-02-12 16:10:00',
    attachments: [
      { type: 'image', name: '损坏设施1.jpg', url: '/images/facility1.jpg' },
      { type: 'image', name: '损坏设施2.jpg', url: '/images/facility2.jpg' },
      { type: 'document', name: '维修申请表.doc', url: '/files/repair.doc' }
    ]
  },
  {
    id: 105,
    title: '小区绿化带需要补种植物',
    content: '小区部分绿化带植物枯死，影响整体环境美观，希望能够及时补种...',
    status: 'pending_reply',
    issueType: 'environment',
    createTime: '2024-02-18 09:15:00',
    updateTime: '2024-02-18 09:15:00',
    attachments: [
      { type: 'image', name: '绿化现状.jpg', url: '/images/green1.jpg' }
    ]
  }
]

// 转换为 IssueList 兼容格式（保留 issue_type 用于本页筛选）
const convertToIssueListFormat = (originalIssues) => {
  return originalIssues.map(issue => ({
    id: issue.id,
    title: issue.title,
    content: issue.content,
    status: convertStatus(issue.status),
    category: '诉求处理',
    issue_type: issue.issueType,
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
    attachments: (issue.attachments || []).map(att => ({
      id: Math.random(),
      name: att.name,
      type: att.type === 'image' ? 'image' : (att.type === 'audio' ? 'audio' : 'document'),
      url: att.url,
      size: '1.0MB',
      created_at: issue.createTime
    }))
  }))
}

// 问题数据与分组
const issues = ref(convertToIssueListFormat(originalIssues))

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

const matchesType = (issue) => {
  if (selectedType.value === 'all') return true
  return issue.issue_type === selectedType.value
}

const matchesStatus = (issue) => {
  if (selectedStatus.value === 'all') return true
  return issue.status === selectedStatus.value
}

// 新增：留言类型筛选（次级筛选）
const selectedMessageType = ref('all')
const messageTypeOptions = [
  { text: '全部留言', value: 'all' },
  { text: '咨询', value: 'consult' },
  { text: '建议', value: 'suggest' },
  { text: '投诉', value: 'complaint' }
]
const matchesMessageType = (issue) => {
  if (selectedMessageType.value === 'all') return true
  // 若数据暂不包含 messageType 字段，则不影响筛选
  const msgType = (issue.messageType || issue.issue_type || '')
  return msgType === selectedMessageType.value
}

// 高级筛选：区域与部门（若列表项无相关字段则不影响筛选）
const selectedRegion = ref<string>('') // 形如 '省/市/区'
const selectedDepartment = ref<string>('') // 形如 '部门/科室/...'

const matchesRegion = (issue: any) => {
  if (!selectedRegion.value) return true
  const region = (issue.region_code || '') as string
  return region.includes(selectedRegion.value)
}

const matchesDepartment = (issue: any) => {
  if (!selectedDepartment.value) return true
  const dept = (issue.department_path || '') as string
  return dept.includes(selectedDepartment.value)
}

const applyFilters = (list) => list.filter(issue => includesKeyword(issue) && inDateRange(issue) && matchesType(issue) && matchesStatus(issue) && matchesMessageType(issue) && matchesRegion(issue) && matchesDepartment(issue))

// 过滤后的列表与分页
const filteredIssues = computed(() => applyFilters(issues.value))
const currentPage = ref(1)
const pageSize = ref(10)
const getPaginated = (list) => list.slice(0, currentPage.value * pageSize.value)
const displayedIssues = computed(() => getPaginated(filteredIssues.value))

// 分页相关状态
const totalCount = ref(0)
const hasMoreData = ref(true)

// 滚动到页面顶部
const scrollToTop = () => {
  nextTick(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
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
  const activeList = filteredIssues.value
  const displayed = getPaginated(activeList)
  totalCount.value = activeList.length
  finished.value = displayed.length >= activeList.length
  hasMoreData.value = !finished.value
}

// 加载问题列表
const loadIssues = async (isLoadMore = false) => {
  if (loading.value) return

  loading.value = true
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 500))

    if (!isLoadMore) {
      issues.value = convertToIssueListFormat(originalIssues)
      totalCount.value = originalIssues.length
    }

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
    source: 'appeal_processing',
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
  if (loading.value || finished.value || !hasMoreData.value) return
  if (issues.value.length === 0) return
  currentPage.value += 1
  updatePaginationState()
}

// 返回上一页
const onBack = () => {
  router.back()
}

// 规范化 URL 参数（string | string[] | undefined -> string）
const normalizeQueryParam = (v: unknown, defaultVal: string): string => {
  if (v == null) return defaultVal
  if (Array.isArray(v)) return (v[0] ?? defaultVal) as string
  return String(v)
}

// URL 参数持久化：读取初始参数
const initFromQuery = () => {
  const q = route.query || {}
  keyword.value = normalizeQueryParam(q.keyword, '')
  debouncedKeyword.value = keyword.value.trim()
  selectedType.value = normalizeQueryParam(q.type, 'all')
  selectedStatus.value = normalizeQueryParam(q.status, 'all')
  selectedMessageType.value = normalizeQueryParam(q.msgType, 'all')
  startDate.value = normalizeQueryParam(q.start, '')
  endDate.value = normalizeQueryParam(q.end, '')
  selectedRegion.value = normalizeQueryParam(q.region, '')
  selectedDepartment.value = normalizeQueryParam(q.dept, '')
}

// 将当前筛选条件写回URL
const persistToQuery = () => {
  router.replace({
    path: route.path,
    query: {
      ...route.query,
      keyword: debouncedKeyword.value || undefined,
      type: selectedType.value !== 'all' ? selectedType.value : undefined,
      status: selectedStatus.value !== 'all' ? selectedStatus.value : undefined,
      msgType: selectedMessageType.value !== 'all' ? selectedMessageType.value : undefined,
      start: startDate.value || undefined,
      end: endDate.value || undefined,
      region: selectedRegion.value || undefined,
      dept: selectedDepartment.value || undefined
    }
  })
}

// 监听路由参数变化，支持外部变更
watch(() => route.query, (newQuery) => {
  const nq = newQuery || {}
  const k = normalizeQueryParam(nq.keyword, '')
  const type = normalizeQueryParam(nq.type, 'all')
  const status = normalizeQueryParam(nq.status, 'all')
  const msgType = normalizeQueryParam(nq.msgType, 'all')
  const start = normalizeQueryParam(nq.start, '')
  const end = normalizeQueryParam(nq.end, '')
  const region = normalizeQueryParam(nq.region, '')
  const dept = normalizeQueryParam(nq.dept, '')
  const shouldUpdate = (
    k !== debouncedKeyword.value ||
    type !== selectedType.value ||
    status !== selectedStatus.value ||
    msgType !== selectedMessageType.value ||
    start !== startDate.value ||
    end !== endDate.value ||
    region !== selectedRegion.value ||
    dept !== selectedDepartment.value
  )
  if (shouldUpdate) {
    initFromQuery()
    resetPagination()
    updatePaginationState()
  }
})

// 监听筛选条件变化，实时刷新并持久化到URL
watch([debouncedKeyword, selectedType, selectedStatus, selectedMessageType, startDate, endDate, selectedRegion, selectedDepartment], () => {
  loading.value = true
  persistToQuery()
  resetPagination()
  updatePaginationState()
  setTimeout(() => { loading.value = false }, 200)
})

onMounted(() => {
  initFromQuery()
  scrollToTop()
  loadIssues()
  updatePaginationState()
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

// ====== 更多筛选：侧边栏逻辑 ======
const showMoreFilter = ref(false)
const sidebarWidth = computed(() => '100vw')

// 二级筛选展开状态（用于“更多”按钮展开/收起）
const showSecondaryFilters = ref(false)
const toggleSecondaryFilters = () => { showSecondaryFilters.value = !showSecondaryFilters.value }

// 顶部日期范围显示文案
const dateRangeText = computed(() => {
  if (startDate.value && endDate.value) return `${startDate.value} 至 ${endDate.value}`
  if (startDate.value) return `${startDate.value} 起`
  if (endDate.value) return `至 ${endDate.value}`
  return ''
})

// 侧栏日期范围显示文案
const advDateRangeText = computed(() => {
  const s = advDraft.value.dateStart
  const e = advDraft.value.dateEnd
  if (s && e) return `${s} 至 ${e}`
  if (s) return `${s} 起`
  if (e) return `至 ${e}`
  return ''
})

type CascaderOption = { text: string; value: string; children?: CascaderOption[]; loading?: boolean }
type AdvancedDraft = {
  dateStart: string
  dateEnd: string
  regionValue: string | undefined
  departmentValue: string | undefined
}

const advDraft = ref<AdvancedDraft>({ dateStart: '', dateEnd: '', regionValue: undefined, departmentValue: undefined })

const cascaderFieldNames = { text: 'text', value: 'value', children: 'children' }

// 模拟懒加载区域数据
const regionOptions = ref<CascaderOption[]>([
  {
    text: '石家庄市', value: '石家庄市', children: [{
      text: '长安区', value: '长安区', children: [{
        text: '广安街道', value: '广安街道',
      }, {
        text: '青龙街道', value: '青龙街道',
      }]
    }]
  },
  {
    text: '唐山市', value: '唐山市', children: [{
      text: '路北区', value: '路北区', children: [{
        text: '缸窑街道', value: '缸窑街道',
      }, {
        text: '乔屯街道', value: '乔屯街道',
      }]
    }]
  },
  {
    text: '保定市', value: '保定市', children: [{
      text: '莲池区', value: '莲池区', children: [{
        text: '裕华街道', value: '裕华街道',
      }, {
        text: '五四东路街道', value: '五四东路街道',
      }]
    }, {
      text: '清苑区', value: '清苑区', children: [{
        text: '清苑镇', value: '清苑镇',
      }, {
        text: '臧村镇', value: '臧村镇',
      }]
    }]
  },
  {
    text: '邯郸市', value: '邯郸市', children: [{
      text: '丛台区', value: '丛台区', children: [{
        text: '丛台西街道', value: '丛台西街道',
      }, {
        text: '丛台东街道', value: '丛台东街道',
      }]
    }, {
      text: '邯山区', value: '邯山区', children: [{
        text: '贸东街道', value: '贸东街道',
      }, {
        text: '贸西街道', value: '贸西街道',
      }]
    }]
  },
  {
    text: '秦皇岛市', value: '秦皇岛市', children: [{
      text: '海港区', value: '海港区', children: [{
        text: '海阳路街道', value: '海阳路街道',
      }, {
        text: '燕山大街街道', value: '燕山大街街道',
      }]
    }, {
      text: '山海关区', value: '山海关区', children: [{
        text: '路南街道', value: '路南街道',
      }, {
        text: '路北街道', value: '路北街道',
      }]
    }]
  },
  {
    text: '沧州市', value: '沧州市', children: [{
      text: '运河区', value: '运河区', children: [{
        text: '南环中街道', value: '南环中街道',
      }, {
        text: '北环中街道', value: '北环中街道',
      }]
    }, {
      text: '新华区', value: '新华区', children: [{
        text: '道东街道', value: '道东街道',
      }, {
        text: '道西街道', value: '道西街道',
      }]
    }]
  },
  {
    text: '廊坊市', value: '廊坊市', children: [{
      text: '安次区', value: '安次区', children: [{
        text: '银河北路街道', value: '银河北路街道',
      }, {
        text: '永华道街道', value: '永华道街道',
      }]
    }, {
      text: '广阳区', value: '广阳区', children: [{
        text: '爱民东道街道', value: '爱民东道街道',
      }, {
        text: '北旺乡', value: '北旺乡',
      }]
    }]
  },
  { text: '沧州市', value: '沧州市', children: [] },
  { text: '廊坊市', value: '廊坊市', children: [] },
  { text: '衡水市', value: '衡水市', children: [] },
  { text: '张家口市', value: '张家口市', children: [] },
  { text: '承德市', value: '承德市', children: [] },
])

const REGION_DATA: Record<string, any> = {
  '石家庄市': {
    '长安区': ['广安街道', '青龙街道', '建北街道'],
    '桥西区': ['裕西街道', '东里街道', '维明街道']
  },
  '唐山市': {
    '路北区': ['缸窑街道', '乔屯街道'],
    '路南区': ['文北街道', '广场街道']
  },
  '保定市': {
    '莲池区': ['裕华街道', '五四东路街道'],
    '清苑区': ['清苑镇', '臧村镇']
  },
  '邯郸市': {
    '丛台区': ['丛台西街道', '丛台东街道'],
    '邯山区': ['贸东街道', '贸西街道']
  },
  '秦皇岛市': {
    '海港区': ['海阳路街道', '燕山大街街道'],
    '山海关区': ['路南街道', '路北街道']
  },
  '沧州市': {
    '运河区': ['南环中街道', '北环中街道'],
    '新华区': ['道东街道', '道西街道']
  },
  '廊坊市': {
    '安次区': ['银河北路街道', '永华道街道'],
    '广阳区': ['爱民东道街道', '北旺乡']
  },
  '衡水市': {
    '桃城区': ['河东街道', '河西街道'],
    '冀州区': ['冀州镇', '周村镇']
  },
  '张家口市': {
    '桥西区': ['明德南街道', '工业街街道'],
    '桥东区': ['建国路街道', '胜利北路街道']
  },
  '承德市': {
    '双桥区': ['新华路街道', '西大街街道'],
    '双滦区': ['滦河街道', '元宝山街道']
  }
}

const lazyLoadChildren = (option: CascaderOption) => {
  if (option.children && option.children!.length > 0) return
  const path = String(option.value)
  const parts = path.split('/')
  option.loading = true
  setTimeout(() => {
    let children: CascaderOption[] = []
    if (parts.length === 1) {
      const prov = parts[0]
      const cities = Object.keys(REGION_DATA[prov] || {})
      children = cities.map(c => ({ text: c, value: `${prov}/${c}` }))
    } else if (parts.length === 2) {
      const [prov, city] = parts
      const districts = Object.keys(((REGION_DATA[prov] || {})[city]) || {})
      children = districts.map(d => ({ text: d, value: `${prov}/${city}/${d}` }))
    } else if (parts.length === 3) {
      const [prov, city, dist] = parts
      const streets = (((REGION_DATA[prov] || {})[city] || {})[dist] || [])
      children = streets.map(s => ({ text: s, value: `${prov}/${city}/${dist}/${s}` }))
    } else {
      children = []
    }
    option.children = children
    option.loading = false
    console.log('lazyLoadChildren', option)
  }, 300)
}

// 解析 Cascader 变更值为路径片段（兼容 Vant change(value, selectedOptions)）
const getPathPartsFromCascader = (val: unknown, selectedOptions?: any[]): string[] => {
  if (Array.isArray(selectedOptions) && selectedOptions.length) {
    return selectedOptions.map((o: any) => String(o?.value ?? ''))
  }
  if (typeof val === 'string') return val.split('/')
  if (Array.isArray(val)) return (val as any[]).map(v => String(v))
  if (val && typeof val === 'object' && 'value' in (val as Record<string, any>)) {
    return String((val as Record<string, any>).value).split('/')
  }
  return []
}

// 监听级联选择器的 change，模拟懒加载下一层
const onRegionChange = (val: unknown, selectedOptions?: CascaderOption[]) => {
  const parts = getPathPartsFromCascader(val, selectedOptions)
  console.log('onRegionChange', parts)
  if (!parts.length) return
  let current: CascaderOption | undefined = regionOptions.value.find(o => {
    const ov = String(o.value)
    return ov === parts[0] || ov === parts.slice(0, 2).join('/')
  })
  if (current) lazyLoadChildren(current)
  const start = String(current?.value || '').split('/').length
  for (let i = start; i < parts.length; i++) {
    if (!current) break
    lazyLoadChildren(current)
    const prefix = parts.slice(0, i + 1).join('/')
    current = (current.children || []).find(c => c.value === prefix)
  }
  currentCascaderPath.value = parts.filter(Boolean).join('/')
  console.log('onRegionChange', currentCascaderPath.value)
  currentSelectedOptions.value = Array.isArray(selectedOptions) ? selectedOptions : []
}

const typeText = ref<string>('')
const showActionSheet = ref<boolean>(false)
const openTypeActionSheet = () => { showActionSheet.value = true }
const selectType = (item: any) => { typeText.value = item.name; closeTypeActionSheet() }
const closeTypeActionSheet = () => { showActionSheet.value = false }

// 底部区域选择弹框（全局复用，支持顶部二级筛选与侧栏）
const showRegionPopup = ref(false)
const regionPopupTarget = ref<'top' | 'sidebar'>('sidebar')
const openRegionPopup = (target: 'top' | 'sidebar' = 'sidebar') => { regionPopupTarget.value = target; showRegionPopup.value = true }
const closeRegionPopup = () => { showRegionPopup.value = false }
const formatRegionDisplay = (path?: string): string => {
  const p = String(path || '')
  if (!p) return ''
  const parts = p.split('/').filter(Boolean)
  if (parts[0] === '河北省') parts.shift()
  return parts.join('/') || ''
}
const advRegionText = computed(() => formatRegionDisplay(advDraft.value.regionValue))
const topRegionText = computed(() => formatRegionDisplay(selectedRegion.value))
const onRegionFinish = (payload: any, selectedOptions?: CascaderOption[]) => {
  let parts: string[] = []
  if (payload && Array.isArray(payload.selectedOptions)) {
    parts = (payload.selectedOptions as any[]).map(o => String((o as any)?.value ?? ''))
  } else {
    parts = getPathPartsFromCascader(payload, selectedOptions)
  }
  const path = parts.filter(Boolean).join('/') || undefined
  if (regionPopupTarget.value === 'sidebar') {
    advDraft.value.regionValue = path
  } else {
    selectedRegion.value = path || ''
  }
  closeRegionPopup()
}

const confirmCurrentRegion = () => {
  const path = currentCascaderPath.value || ''
  if (regionPopupTarget.value === 'sidebar') {
    advDraft.value.regionValue = path || undefined
  } else {
    selectedRegion.value = path
  }
  closeRegionPopup()
}

const currentCascaderPath = ref<string>('')
const currentSelectedOptions = ref<CascaderOption[]>([])

const openMoreFilter = () => {
  advDraft.value.dateStart = startDate.value
  advDraft.value.dateEnd = endDate.value
  advDraft.value.regionValue = selectedRegion.value || undefined
  advDraft.value.departmentValue = selectedDepartment.value || undefined
  showMoreFilter.value = true
}

const closeMoreFilter = () => {
  showMoreFilter.value = false
}

const resetAdvancedFilters = () => {
  advDraft.value = { dateStart: '', dateEnd: '', regionValue: undefined, departmentValue: undefined }
}

// 日期选择：使用日历组件，支持选择开始或结束
const showCalendar = ref(false)
const calendarType = ref<'range' | 'single'>('range')
let calendarTarget: 'start' | 'end' | 'range' = 'range'

const openCalendar = (target: 'start' | 'end' | 'range' = 'range') => {
  calendarTarget = target
  calendarType.value = target === 'range' ? 'range' : 'single'
  showCalendar.value = true
}

const onCalendarConfirm = (value: any) => {
  if (calendarTarget === 'range' && Array.isArray(value)) {
    let [start, end] = value
    const s = new Date(start)
    const e = new Date(end)
    if (s > e) [start, end] = [end, start]
    advDraft.value.dateStart = formatDate(new Date(start))
    advDraft.value.dateEnd = formatDate(new Date(end))
  } else if (calendarTarget === 'start') {
    advDraft.value.dateStart = formatDate(new Date(value))
  } else if (calendarTarget === 'end') {
    advDraft.value.dateEnd = formatDate(new Date(value))
    const s = advDraft.value.dateStart ? new Date(advDraft.value.dateStart) : null
    const e = new Date(value)
    if (s && s > e) {
      // 纠正日期逻辑：开始晚于结束时，交换
      advDraft.value.dateEnd = advDraft.value.dateStart
      advDraft.value.dateStart = formatDate(e)
    }
  }
  showCalendar.value = false
}

// 顶部范围日历
const showTopCalendar = ref(false)
const openTopCalendar = () => { showTopCalendar.value = true }
const onTopCalendarConfirm = (value: any) => {
  if (Array.isArray(value)) {
    let [start, end] = value
    const s = new Date(start)
    const e = new Date(end)
    if (s > e) [start, end] = [end, start]
    startDate.value = formatDate(new Date(start))
    endDate.value = formatDate(new Date(end))
  }
  showTopCalendar.value = false
}

const custom = ref(null)
const onConfirm2 = () => {
  custom.value.toggle();
}

const applyAdvancedFilters = () => {
  startDate.value = advDraft.value.dateStart || ''
  endDate.value = advDraft.value.dateEnd || ''
  selectedRegion.value = advDraft.value.regionValue || ''
  selectedDepartment.value = advDraft.value.departmentValue || ''
  closeMoreFilter()
}

// ====== 触控滑动关闭（右滑关闭） ======
const touchStartX = ref(0)
const touchStartY = ref(0)
const touchDeltaX = ref(0)
const touchDeltaY = ref(0)
const touching = ref(false)

const onTouchStart = (e: TouchEvent) => {
  const t = e.touches[0]
  touchStartX.value = t.clientX
  touchStartY.value = t.clientY
  touching.value = true
}

const onTouchMove = (e: TouchEvent) => {
  if (!touching.value) return
  const t = e.touches[0]
  touchDeltaX.value = t.clientX - touchStartX.value
  touchDeltaY.value = t.clientY - touchStartY.value
}

const onTouchEnd = () => {
  if (!touching.value) return
  const THRESHOLD = 60
  if (touchDeltaX.value > THRESHOLD && Math.abs(touchDeltaX.value) > Math.abs(touchDeltaY.value)) {
    closeMoreFilter()
  }
  touching.value = false
  touchDeltaX.value = 0
  touchDeltaY.value = 0
}
</script>

<style scoped>
.appeal-processing {
  min-height: 100vh;
  background-color: #f7f8fa;
  overflow-x: hidden;
}

.status-tabs {
  background-color: white;
}

.filter-bar {
  background-color: #fff;
  /* padding: 12px; */
  margin-top: 46px;
  margin-bottom: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  position: fixed;
  z-index: 999;
  width: 100%;
}

/* 第一行：类型、状态、更多（均匀分布） */
.primary-row {
  /* display: grid;
  grid-template-columns: 1fr 1fr auto;
  align-items: center;
  gap: 8px; */
}

.dropdown {
  width: 100%;
}

.more-wrap {
  display: flex;
  justify-content: flex-end;
}

.more-filter-btn {
  padding: 8px 12px;
  /* border: 1px solid #ff6a00; */
  background: white;
  border: none;
  color: rgb(25, 137, 250);
  /* border-radius: 999px; */
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 48px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  /* 图标与文本间距 */
  -webkit-tap-highlight-color: transparent;
  /* 移动端触控体验 */
}

/* .more-filter-btn:hover { background: #ffe9d9; }
.more-filter-btn:active { background: #ffd7b8; transform: scale(0.98); } */

/* 二级筛选区域（展开/收起动画） */
.secondary-filters {
  overflow: hidden;
}

.row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
}

.two-cols {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.col {
  width: 100%;
}

.collapse-enter-active,
.collapse-leave-active {
  transition: max-height 0.25s ease, opacity 0.25s ease;
}

.collapse-enter-from,
.collapse-leave-to {
  max-height: 0;
  opacity: 0;
}

/* 图标切换的平滑过渡 */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-2px);
}

.more-icon {
  font-size: 16px;
  transform-origin: 50% 50%;
  -webkit-transform-origin: 50% 50%;
  transform: rotate(0deg);
  -webkit-transform: rotate(0deg);
  transition: transform 300ms ease;
  -webkit-transition: -webkit-transform 300ms ease;
}

.more-icon.rotated {
  transform: rotate(180deg);
  -webkit-transform: rotate(180deg);
}

.more-text {
  line-height: 1;
}

/* 按钮悬停与按下反馈（桌面端更友好） */
.more-filter-btn:hover {
  background-color: #f5faff;
}

.more-filter-btn:active {
  opacity: 0.9;
}

.collapse-enter-to,
.collapse-leave-from {
  max-height: 480px;
  opacity: 1;
}

.sidebar {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  font-size: 14px;
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.sidebar-header .title {
  font-weight: 600;
}

.sidebar-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
  padding-bottom: 8px;
}

.sidebar-section {
  padding: 12px;
  border-bottom: 1px solid #f6f6f6;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 6px;
}

.section-desc {
  font-size: 12px;
  color: #969799;
  margin-bottom: 8px;
}

.date-range-display {
  display: flex;
  gap: 8px;
}

.sidebar-footer {
  display: flex;
  gap: 12px;
  padding: 12px;
  border-top: 1px solid #f0f0f0;
  padding-bottom: calc(12px + env(safe-area-inset-bottom));
}

.btn-cancel {
  flex: 1;
  min-height: 48px;
}

.btn-confirm {
  flex: 1;
  min-height: 48px;
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

/* 提升触控区域与选项可读性 */
:deep(.van-cell) {
  min-height: 48px;
}

:deep(.van-button) {
  min-height: 48px;
}

:deep(.van-cascader__option) {
  min-height: 48px;
}

:deep(.van-field__control) {
  min-height: 48px;
}

/* 禁止横向滚动 */
.filter-bar,
.sidebar,
.sidebar-content {
  overflow-x: hidden;
}

/* 底部区域弹框内容安全区与滚动 */
.region-popup {
  max-height: 75vh;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding-bottom: env(safe-area-inset-bottom);
}

:deep(.van-dropdown-menu__bar) {
  /* background: none !important;
  box-shadow: none !important; */
}

:deep(.van-field__label) {
  line-height: 48px;
}

:deep(.van-tabs__content--animated) {
  max-height: 336px;
}

:deep(.van-search) {
  margin: var(--van-search-padding);
  padding: 0;
  border: 2px solid #f7f8fa;
  /* background: var(--van-search-background); */
}

:deep(.van-search__action) {
  padding: 0 10px 0 0;
}

/* :deep(.van-search__content) {
  background-color: white;
} */

:deep(.van-field__label){
  margin-right: -10px;
}
</style>
