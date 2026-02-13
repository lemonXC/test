<template>
  <div class="task-detail">
    <!-- 导航栏 -->
    <van-nav-bar title="任务详情" left-arrow @click-left="onBack" fixed />

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <van-loading type="spinner" size="24px">加载中...</van-loading>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="error-container">
      <van-empty image="error" description="加载失败">
        <van-button type="primary" size="small" @click="loadTaskDetail">
          重新加载
        </van-button>
      </van-empty>
    </div>

    <!-- 任务详情内容 -->
    <div v-else-if="task" class="task-content">
      <!-- 任务头部信息 -->
      <div class="task-header">
        <div class="header-top">
          <!-- <van-tag 
            :type="getPriorityType(task.priority)"
            size="large"
            class="priority-tag"
          >
            {{ getPriorityText(task.priority) }}
          </van-tag> -->
          <van-tag :type="getStatusType(task.status)" size="large" class="status-tag">
            {{ getStatusText(task.status) }}
          </van-tag>
        </div>

        <h1 class="task-title">{{ task.title }}</h1>

        <div class="task-meta">
          <!-- <div class="meta-item">
            <van-icon name="contact" />
            <span>发布方：{{ task.publisher }}</span>
          </div> -->
          <div class="meta-item">
            <van-icon name="clock-o" />
            <span>发布时间：{{ formatDateTime(task.publishTime) }}</span>
          </div>
        </div>
      </div>

      <!-- 任务内容 -->
      <div class="task-body">
        <div class="content-section">
          <h3 class="section-title">任务内容</h3>
          <div class="content-text">{{ task.content }}</div>
        </div>

        <!-- 上报记录（仅当任务已上报时显示） -->
        <div v-if="task.reportRecord" class="content-section">
          <h3 class="section-title">上报记录</h3>
          <van-cell :title="task.reportRecord.title" :label="`上报时间：${task.reportRecord.reportTime}`" is-link
            @click="onReportClick" class="report-cell">
            <template #icon>
              <van-icon name="completed" color="#07c160" />
            </template>
          </van-cell>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="action-section">
        <!-- 未领取状态：显示领取按钮 -->
        <template v-if="task.status === TASK_STATUS.UNCLAIMED">
          <van-button type="primary" size="large" block :loading="claimLoading" @click="onClaim" class="action-btn">
            领取任务
          </van-button>
        </template>

        <!-- 已领取待反馈状态：显示反馈上报按钮 -->
        <template v-else-if="task.status === TASK_STATUS.CLAIMED">
          <van-button type="primary" size="large" block @click="onReport" class="action-btn">
            反馈上报
          </van-button>
        </template>

        <!-- 已上报状态：显示查看上报详情按钮 -->
        <template v-else-if="task.status === TASK_STATUS.REPORTED">
          <van-button type="default" size="large" block @click="onReportClick" class="action-btn">
            查看上报详情
          </van-button>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast, showConfirmDialog } from 'vant'
import { taskService, TASK_STATUS, TASK_STATUS_TEXT, TASK_PRIORITY, TASK_PRIORITY_TEXT } from '@/services/taskService'

export default {
  name: 'TaskDetail',
  setup() {
    const router = useRouter()
    const route = useRoute()
    const loading = ref(true)
    const error = ref(false)
    const claimLoading = ref(false)
    const task = ref(null)

    // 返回上一页
    const onBack = () => {
      router.back()
    }

    // 加载任务详情
    const loadTaskDetail = async () => {
      loading.value = true
      error.value = false

      try {
        const taskId = route.params.id
        const taskData = await taskService.getTaskDetail(taskId)
        task.value = taskData
      } catch (err) {
        error.value = true
        showToast('加载任务详情失败')
      } finally {
        loading.value = false
      }
    }

    // 格式化日期时间
    const formatDateTime = (timeStr) => {
      const date = new Date(timeStr)
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    // 获取优先级类型
    const getPriorityType = (priority) => {
      const typeMap = {
        [TASK_PRIORITY.LOW]: 'default',
        [TASK_PRIORITY.MEDIUM]: 'primary',
        [TASK_PRIORITY.HIGH]: 'warning',
        [TASK_PRIORITY.URGENT]: 'danger'
      }
      return typeMap[priority] || 'default'
    }

    // 获取优先级文本
    const getPriorityText = (priority) => {
      return TASK_PRIORITY_TEXT[priority] || '未知'
    }

    // 获取状态类型
    const getStatusType = (status) => {
      const typeMap = {
        [TASK_STATUS.UNCLAIMED]: 'default',
        [TASK_STATUS.CLAIMED]: 'primary',
        [TASK_STATUS.REPORTED]: 'success'
      }
      return typeMap[status] || 'default'
    }

    // 获取状态文本
    const getStatusText = (status) => {
      return TASK_STATUS_TEXT[status] || '未知'
    }

    // 领取任务
    const onClaim = async () => {
      const result = await showConfirmDialog({
        title: '确认领取',
        message: '确定要领取这个任务吗？'
      }).catch(() => false)

      if (!result) return

      claimLoading.value = true

      try {
        await taskService.claimTask(task.value.id)
        showToast('任务领取成功')

        // 更新任务状态
        task.value.status = TASK_STATUS.CLAIMED

      } catch (err) {
        showToast('任务领取失败，请重试')
      } finally {
        claimLoading.value = false
      }
    }

    // 反馈上报
    const onReport = () => {
      // 跳转到问题上报页面，并传递任务ID
      router.push({
        path: '/submit-issue',
        query: { taskId: task.value.id }
      })
    }

    // 查看上报记录
    const onReportClick = () => {
      if (task.value.reportRecord) {
        // 跳转到网格员问题管理详情页
        router.push(`/user-issue-detail/${task.value.reportRecord.id}`)
      }
    }

    // 组件挂载时加载数据
    onMounted(() => {
      loadTaskDetail()
    })

    return {
      loading,
      error,
      claimLoading,
      task,
      TASK_STATUS,
      onBack,
      loadTaskDetail,
      formatDateTime,
      getPriorityType,
      getPriorityText,
      getStatusType,
      getStatusText,
      onClaim,
      onReport,
      onReportClick
    }
  }
}
</script>

<style scoped>
.task-detail {
  min-height: 100vh;
  background-color: #f7f8fa;
  margin-top: 46px;
  padding: 16px;
  /* 导航栏高度 */
}

.loading-container,
.error-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 50vh;
  text-align: center;
}

.task-content {
  padding-bottom: 100px;
  /* 为底部按钮留出空间 */
}

.task-header {
  background-color: #fff;
  padding: 20px;
  margin-bottom: 12px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.header-top {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.priority-tag,
.status-tag {
  font-weight: 500;
}

.task-title {
  font-size: 20px;
  font-weight: 600;
  color: #323233;
  line-height: 1.4;
  margin: 0 0 16px 0;
}

.task-meta {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.meta-item {
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #646566;
}

.meta-item .van-icon {
  margin-right: 8px;
  color: #969799;
}

.content-section {
  background-color: #fff;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #323233;
  margin: 0 0 12px 0;
  padding-bottom: 8px;
  border-bottom: 1px solid #ebedf0;
}

.content-text {
  font-size: 15px;
  line-height: 1.6;
  color: #646566;
  white-space: pre-wrap;
}

.report-cell {
  background-color: #f8f9fa;
  border-radius: 8px;
  margin: 0;
}

.action-section {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #fff;
  padding: 16px 20px;
  border-top: 1px solid #ebedf0;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
}

.action-btn {
  border-radius: 8px;
  font-weight: 500;
  font-size: 16px;
  height: 48px;
}

/* 响应式设计 */
@media (max-width: 375px) {
  .task-header {
    padding: 16px;
  }

  .task-title {
    font-size: 18px;
  }

  .content-section {
    padding: 16px;
  }

  .action-section {
    padding: 12px 16px;
  }

  .action-btn {
    height: 44px;
    font-size: 15px;
  }
}

/* 深色模式适配 */
@media (prefers-color-scheme: dark) {
  .task-detail {
    background-color: #1a1a1a;
  }

  .task-header,
  .content-section,
  .action-section {
    background-color: #2d2d2d;
  }

  .task-title {
    color: #fff;
  }

  .content-text {
    color: #ccc;
  }

  .meta-item {
    color: #999;
  }
}
</style>