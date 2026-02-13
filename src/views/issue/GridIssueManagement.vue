<template>
  <div class="user-issue-management">
    <!-- 导航栏 -->
    <van-nav-bar 
      title="我的诉求" 
      left-text="返回" 
      left-arrow 
      @click-left="onBack"
      fixed
      class="nav-bar"
    />
    
    <div class="content">
      <!-- 标签页 -->
      <van-tabs v-model:active="activeTab" @change="onTabChange" sticky>
        <van-tab title="全部问题" name="all">
          <IssueList 
            :issues="allIssues" 
            :loading="loading"
            :finished="finished"
            @click-item="onIssueClick"
            @refresh="onRefresh"
            @load-more="onLoadMore"
          />
        </van-tab>
        
        <van-tab title="待处理" name="pending">
          <IssueList 
            :issues="pendingIssues" 
            :loading="loading"
            :finished="finished"
            show-urge-button
            @click-item="onIssueClick"
            @urge="onUrgeIssue"
            @refresh="onRefresh"
            @load-more="onLoadMore"
          />
        </van-tab>
        
        <van-tab title="待评价" name="evaluate">
          <IssueList 
            :issues="evaluateIssues" 
            :loading="loading"
            :finished="finished"
            show-evaluate-button
            @click-item="onIssueClick"
            @evaluate="onEvaluateIssue"
            @refresh="onRefresh"
            @load-more="onLoadMore"
          />
        </van-tab>
      </van-tabs>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed, nextTick, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast, showConfirmDialog, showSuccessToast } from 'vant'
import IssueList from '@/components/IssueList.vue'
import { 
  getIssuesByStatus, 
  IssueStatus, 
  StatusText, 
  StatusColor,
  IssueStatusManager 
} from '@/data/mockIssueData.js'

export default {
  name: 'UserIssueManagement',
  components: {
    IssueList
  },
  setup() {
    const router = useRouter()
    const route = useRoute()
    
    // 从URL参数中获取初始tab，如果没有则默认为'all'
    const getInitialTab = () => {
      const tabParam = route.query.tab
      const validTabs = ['all', 'pending', 'evaluate']
      return validTabs.includes(tabParam) ? tabParam : 'all'
    }
    
    const activeTab = ref(getInitialTab())
    const loading = ref(false)
    const finished = ref(false)
    const issues = ref([])
    
    // 分页相关状态
    const currentPage = ref(1)
    const pageSize = ref(10)
    const totalCount = ref(0)
    const hasMoreData = ref(true)

    // 计算不同状态的问题列表
    const allIssues = computed(() => issues.value)
    
    const pendingIssues = computed(() => 
      issues.value.filter(issue => 
        issue.status === IssueStatus.PENDING || issue.status === IssueStatus.PROCESSING
      )
    )
    
    const evaluateIssues = computed(() => 
      issues.value.filter(issue => 
        issue.status === IssueStatus.RESOLVED
      )
    )

    // 获取当前标签页对应的数据
    const getCurrentTabData = () => {
      switch (activeTab.value) {
        case 'pending':
          return issues.value.filter(issue => 
            issue.status === IssueStatus.PENDING || issue.status === IssueStatus.PROCESSING
          )
        case 'evaluate':
          return issues.value.filter(issue => 
            issue.status === IssueStatus.RESOLVED
          )
        default:
          return issues.value
      }
    }

    // 获取所有问题数据
    const getAllIssuesData = () => {
      return getIssuesByStatus('all')
    }

    // 滚动到页面顶部
    const scrollToTop = () => {
      // 使用 nextTick 确保 DOM 更新完成后再滚动
      nextTick(() => {
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        })
        // 同时重置 document.documentElement 的滚动位置
        document.documentElement.scrollTop = 0
        document.body.scrollTop = 0
      })
    }

    // 重置分页状态
    const resetPagination = () => {
      currentPage.value = 1
      issues.value = []
      finished.value = false
      hasMoreData.value = true
    }

    // 返回上一页
    const onBack = () => {
      router.back()
    }

    // 标签页切换
    const onTabChange = (name) => {
      activeTab.value = name
      
      // 更新URL参数，保持状态同步
      router.replace({
        path: route.path,
        query: { ...route.query, tab: name }
      })
      
      resetPagination()
      scrollToTop() // 切换标签页时滚动到顶部
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
          // 初始加载或刷新时，先获取所有数据
          const allData = getAllIssuesData()
          issues.value = allData
          totalCount.value = allData.length
        }
        
        // 检查是否还有更多数据（这里简化处理，实际项目中会有真正的分页）
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
      router.push(`/user-issue-detail/${issue.id}`)
    }

    // 催办问题
    const onUrgeIssue = async (issue) => {
      try {
        // 检查是否可以催办
        if (!IssueStatusManager.canUrge(issue)) {
          showToast('当前状态不支持催办')
          return
        }

        // 检查今天是否已经催办过
        if (!IssueStatusManager.canUrgeToday(issue.id)) {
          showToast('今天已经催办过了，请明天再试')
          return
        }

        // 显示确认对话框
        await showConfirmDialog({
          title: '催办确认',
          message: '确定要催办此问题吗？每天只能催办一次。',
        })

        loading.value = true
        
        // 使用新的催办方法
        IssueStatusManager.addReminder(issue.id, 'current_user', '请尽快处理')
        
        showSuccessToast('催办成功')
        
        // 刷新列表
        resetPagination()
        await loadIssues()
      } catch (error) {
        if (error !== 'cancel') {
          console.error('催办失败:', error)
          showToast(error.message || '催办失败，请重试')
        }
      } finally {
        loading.value = false
      }
    }

    // 评价问题
    const onEvaluateIssue = (issue) => {
      router.push(`/user-issue-detail/${issue.id}`)
    }

    // 下拉刷新
    const onRefresh = () => {
      resetPagination()
      loadIssues()
    }

    // 加载更多
    const onLoadMore = () => {
      // 检查是否满足加载更多的条件
      if (loading.value || finished.value || !hasMoreData.value) {
        return
      }
      
      // 检查当前是否有足够的数据显示（避免页面加载后立即触发）
      if (issues.value.length === 0) {
        return
      }
      
      currentPage.value += 1
      loadIssues(true)
    }

    // 监听路由参数变化，支持通过URL参数切换tab
    watch(() => route.query.tab, (newTab) => {
      if (newTab && ['all', 'pending', 'evaluate'].includes(newTab) && newTab !== activeTab.value) {
        activeTab.value = newTab
        resetPagination()
        scrollToTop()
        loadIssues()
      }
    })

    // 页面初始化
    onMounted(() => {
      scrollToTop() // 页面加载时滚动到顶部
      loadIssues()
    })

    return {
      activeTab,
      loading,
      finished,
      allIssues,
      pendingIssues,
      evaluateIssues,
      onBack,
      onTabChange,
      onIssueClick,
      onUrgeIssue,
      onEvaluateIssue,
      onRefresh,
      onLoadMore
    }
  }
}
</script>

<style scoped>
.user-issue-management {
  min-height: 100vh;
  background: #f7f8fa;
}

.content {
  margin-top: 46px;
  padding-bottom: 20px;
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

.van-tabs__content {
  background: #f7f8fa;
}

/* 应用 IssueDetail.vue 的 meta-item 样式以保持一致性 */
.meta-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 8px;
  font-size: 14px;
  line-height: 1.4;
  gap: 8px;
}

.meta-item .van-icon {
  margin-top: 2px;
  flex-shrink: 0;
}

.meta-item .label {
  color: #646566;
  width: 80px;
  flex-shrink: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.meta-item .value {
  color: #323233;
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>