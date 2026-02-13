<template>
  <div class="task-list">
    <van-pull-refresh 
      v-model="refreshing" 
      @refresh="onRefresh"
      success-text="刷新成功"
    >
      <van-list
        :loading="loading"
        :finished="finished"
        :error="error"
        finished-text="没有更多了"
        error-text="请求失败，点击重新加载"
        @load="onLoad"
      >
        <div v-if="tasks.length === 0 && !loading" class="empty-state">
          <van-empty 
            image="search" 
            description="暂无任务数据"
          />
        </div>
        
        <div v-else>
          <van-cell
            v-for="task in tasks"
            :key="task.id"
            :title="task.title"
            :label="getTaskLabel(task)"
            is-link
            @click="onTaskClick(task)"
            class="task-item"
          >
            <!-- <template #icon>
              <div class="task-icon">
                <van-icon name="todo-list-o" size="20" />
              </div>
            </template> -->
            
            <!-- <template #title>
              <div class="task-title">
                <span class="title-text">{{ task.title }}</span>
                <van-tag 
                  :type="getPriorityType(task.priority)"
                  size="mini"
                  class="priority-tag"
                >
                  {{ getPriorityText(task.priority) }}
                </van-tag>
              </div>
            </template> -->
            
            <template #label>
              <div class="task-meta">
                <div class="meta-row">
                  <!-- <span class="publisher">{{ task.publisher }}</span> -->
                  <span class="publish-time">{{ task.publishTime }}</span>
                </div>
                <!-- <div class="meta-row">
                  <van-tag 
                    :type="getStatusType(task.status)"
                    size="mini"
                    class="status-tag"
                  >
                    {{ getStatusText(task.status) }}
                  </van-tag>
                  <span v-if="task.reportRecord" class="report-info">
                    已上报：{{ task.reportRecord.title }}
                  </span>
                </div> -->
              </div>
            </template>
          </van-cell>
        </div>
      </van-list>
    </van-pull-refresh>
  </div>
</template>

<script>
import { ref } from 'vue'
import { TASK_STATUS, TASK_STATUS_TEXT, TASK_PRIORITY, TASK_PRIORITY_TEXT } from '@/services/taskService'

export default {
  name: 'TaskList',
  props: {
    tasks: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    },
    finished: {
      type: Boolean,
      default: false
    },
    error: {
      type: Boolean,
      default: false
    }
  },
  emits: ['load', 'refresh', 'task-click'],
  setup(props, { emit }) {
    const refreshing = ref(false)

    // 上拉加载
    const onLoad = () => {
      emit('load')
    }

    // 下拉刷新
    const onRefresh = () => {
      refreshing.value = true
      emit('refresh')
      setTimeout(() => {
        refreshing.value = false
      }, 1000)
    }

    // 任务点击
    const onTaskClick = (task) => {
      emit('task-click', task)
    }

    // 获取任务标签信息
    const getTaskLabel = (task) => {
      return `${task.publisher} • ${formatTime(task.publishTime)}`
    }

    // 格式化时间
    const formatTime = (timeStr) => {
      const date = new Date(timeStr)
      const now = new Date()
      const diff = now - date
      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      
      if (days === 0) {
        const hours = Math.floor(diff / (1000 * 60 * 60))
        if (hours === 0) {
          const minutes = Math.floor(diff / (1000 * 60))
          return minutes <= 0 ? '刚刚' : `${minutes}分钟前`
        }
        return `${hours}小时前`
      } else if (days === 1) {
        return '昨天'
      } else if (days < 7) {
        return `${days}天前`
      } else {
        return date.toLocaleDateString('zh-CN', {
          month: 'numeric',
          day: 'numeric'
        })
      }
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

    return {
      refreshing,
      onLoad,
      onRefresh,
      onTaskClick,
      getTaskLabel,
      formatTime,
      getPriorityType,
      getPriorityText,
      getStatusType,
      getStatusText
    }
  }
}
</script>

<style scoped>
.task-list {
  background-color: #f7f8fa;
}

.empty-state {
  padding: 60px 20px;
  text-align: center;
}

.task-item {
  margin-bottom: 8px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.task-icon {
  margin-right: 12px;
  color: #1989fa;
}

.task-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.title-text {
  flex: 1;
  font-size: 16px;
  font-weight: 500;
  color: #323233;
  line-height: 1.4;
  margin-right: 8px;
}

.priority-tag {
  flex-shrink: 0;
}

.task-meta {
  font-size: 12px;
  color: #969799;
}

.meta-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
}

.meta-row:last-child {
  margin-bottom: 0;
}

.publisher {
  font-weight: 500;
}

.publish-time {
  color: #c8c9cc;
}

.status-tag {
  margin-right: 8px;
}

.report-info {
  font-size: 11px;
  color: #07c160;
  flex: 1;
  text-align: right;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 下拉刷新样式 */
:deep(.van-pull-refresh__track) {
  background-color: #f7f8fa;
}

/* 列表样式 */
:deep(.van-list) {
  padding-bottom: 16px;
}

/* Cell样式优化 */
:deep(.van-cell) {
  padding: 16px;
  align-items: flex-start;
}

:deep(.van-cell__title) {
  margin-bottom: 0;
}

:deep(.van-cell__label) {
  margin-top: 8px;
}

/* 响应式设计 */
@media (max-width: 375px) {
  .title-text {
    font-size: 15px;
  }
  
  .task-meta {
    font-size: 11px;
  }
  
  :deep(.van-cell) {
    padding: 14px;
  }
}

:deep(.van-list) {
  padding: 10px !important;
}
</style>