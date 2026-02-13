<template>
  <div class="task-management">
    <!-- 导航栏 -->
    <van-nav-bar 
      title="任务管理" 
      left-arrow 
      @click-left="onBack"
      fixed
    />

    <div class="task-content">
      <!-- Tab栏 -->
      <van-tabs 
        v-model:active="activeTab" 
        @change="onTabChange"
        sticky
        offset-top="46"
      >
        <van-tab title="我的任务" name="my">
          <task-list 
            :tasks="myTasks"
            :loading="loading"
            :finished="finished"
            :error="error"
            @load="onLoad"
            @refresh="onRefresh"
            @task-click="onTaskClick"
          />
        </van-tab>
        
        <van-tab title="待反馈" name="feedback">
          <task-list 
            :tasks="feedbackTasks"
            :loading="loading"
            :finished="finished"
            :error="error"
            @load="onLoad"
            @refresh="onRefresh"
            @task-click="onTaskClick"
          />
        </van-tab>
        
        <van-tab title="可领取" name="available">
          <div class="available-tab">
            <!-- 一键领取按钮 -->
            <!-- <div v-if="availableTasks.length > 0" class="batch-claim-section">
              <van-button 
                type="primary" 
                size="large" 
                block
                :loading="claimAllLoading"
                @click="onClaimAll"
                class="claim-all-btn"
              >
                一键领取全部任务 ({{ availableTasks.length }})
              </van-button>
            </div>
             -->
            <task-list 
              :tasks="availableTasks"
              :loading="loading"
              :finished="finished"
              :error="error"
              @load="onLoad"
              @refresh="onRefresh"
              @task-click="onTaskClick"
            />
          </div>
        </van-tab>
      </van-tabs>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast, showConfirmDialog } from 'vant'
import { taskService } from '@/services/taskService'
import TaskList from '../../components/TaskList.vue'

export default {
  name: 'TaskManagement',
  components: {
    TaskList
  },
  setup() {
    const router = useRouter()
    const route = useRoute()
    
    // 根据URL参数设置默认标签页
    const getInitialTab = () => {
      const tab = route.query.tab
      if (tab && ['my', 'feedback', 'available'].includes(tab)) {
        return tab
      }
      return 'my'
    }
    
    const activeTab = ref(getInitialTab())
    const loading = ref(false)
    const finished = ref(false)
    const error = ref(false)
    const claimAllLoading = ref(false)
    
    // 任务数据
    const taskData = reactive({
      my: { tasks: [], page: 1, hasMore: true },
      feedback: { tasks: [], page: 1, hasMore: true },
      available: { tasks: [], page: 1, hasMore: true }
    })

    // 计算属性
    const myTasks = computed(() => taskData.my.tasks)
    const feedbackTasks = computed(() => taskData.feedback.tasks)
    const availableTasks = computed(() => taskData.available.tasks)

    // 返回上一页
    const onBack = () => {
      router.back()
    }

    // Tab切换
    const onTabChange = (name) => {
      activeTab.value = name
      // 如果当前Tab没有数据，则加载数据
      if (taskData[name].tasks.length === 0) {
        loadTasks(name, true)
      }
    }

    // 加载任务数据
    const loadTasks = async (tabName = null, isRefresh = false) => {
      const currentTab = tabName || activeTab.value
      const currentData = taskData[currentTab]
      
      if (loading.value) return
      
      loading.value = true
      error.value = false

      try {
        const page = isRefresh ? 1 : currentData.page
        const response = await taskService.getTaskList(currentTab, page, 20)
        
        if (isRefresh) {
          currentData.tasks = response.data
          currentData.page = 1
        } else {
          currentData.tasks.push(...response.data)
        }
        
        currentData.hasMore = response.hasMore
        currentData.page = page + 1
        finished.value = !response.hasMore
        
      } catch (err) {
        error.value = true
        showToast('加载失败，请重试')
      } finally {
        loading.value = false
      }
    }

    // 上拉加载
    const onLoad = () => {
      const currentData = taskData[activeTab.value]
      if (currentData.hasMore) {
        loadTasks()
      } else {
        finished.value = true
      }
    }

    // 下拉刷新
    const onRefresh = () => {
      finished.value = false
      loadTasks(activeTab.value, true)
    }

    // 任务点击
    const onTaskClick = (task) => {
      router.push(`/task-detail/${task.id}`)
    }

    // 一键领取所有任务
    const onClaimAll = async () => {
      if (availableTasks.value.length === 0) {
        showToast('暂无可领取的任务')
        return
      }

      const result = await showConfirmDialog({
        title: '确认领取',
        message: `确定要领取全部 ${availableTasks.value.length} 个任务吗？`
      }).catch(() => false)

      if (!result) return

      claimAllLoading.value = true
      
      try {
        const response = await taskService.claimAllTasks()
        showToast(response.message)
        
        // 刷新所有Tab的数据
        await Promise.all([
          loadTasks('my', true),
          loadTasks('feedback', true),
          loadTasks('available', true)
        ])
        
        // 切换到我的任务Tab
        activeTab.value = 'my'
        
      } catch (err) {
        showToast('领取失败，请重试')
      } finally {
        claimAllLoading.value = false
      }
    }

    // 组件挂载时加载数据
    onMounted(() => {
      loadTasks(activeTab.value, true)
    })

    return {
      activeTab,
      loading,
      finished,
      error,
      claimAllLoading,
      myTasks,
      feedbackTasks,
      availableTasks,
      onBack,
      onTabChange,
      onLoad,
      onRefresh,
      onTaskClick,
      onClaimAll
    }
  }
}
</script>

<style scoped>
.task-management {
  min-height: 100vh;
  background-color: #f7f8fa;
}

.task-content {
  padding-top: 46px; /* 导航栏高度 */
}

.available-tab {
  position: relative;
}

.batch-claim-section {
  padding: 16px;
  background-color: #fff;
  border-bottom: 1px solid #ebedf0;
  margin-bottom: 8px;
}

.claim-all-btn {
  border-radius: 8px;
  font-weight: 500;
}

/* Tab样式优化 */
:deep(.van-tabs__wrap) {
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

:deep(.van-tab) {
  font-weight: 500;
}

:deep(.van-tab--active) {
  color: #1989fa;
  font-weight: 600;
}

:deep(.van-tabs__line) {
  background-color: #1989fa;
  height: 3px;
  border-radius: 2px;
}

/* 响应式设计 */
@media (max-width: 375px) {
  .batch-claim-section {
    padding: 12px;
  }
  
  .claim-all-btn {
    font-size: 14px;
  }
}
</style>