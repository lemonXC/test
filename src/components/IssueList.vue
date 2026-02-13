<template>
  <div class="issue-list">
    <!-- 下拉刷新 -->
    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <!-- 问题列表 -->
      <van-list
        :loading="loading"
        :finished="finished"
        :offset="300"
        :immediate-check="false"
        finished-text="没有更多了"
        loading-text="加载中..."
        @load="onLoad"
      >
        <div v-if="issues.length === 0 && !loading" class="empty-state">
          <van-empty description="暂无问题" />
        </div>
        
        <div v-else>
          <div 
            v-for="issue in issues" 
            :key="issue.id" 
            class="issue-item"
            @click="onItemClick(issue)"
          >
            <!-- 问题头部 -->
            <div class="issue-header">
              <h3 class="issue-title">{{ issue.title }}</h3>
              <van-tag 
                :type="getStatusType(issue.status)" 
                :color="getStatusColor(issue.status)"
                size="medium"
                class="issue-status"
              >
                {{ getStatusText(issue.status) }}
              </van-tag>
            </div>
            
            <!-- 问题内容 -->
            <div class="issue-content">
              {{ issue.content }}
            </div>
            
            <!-- 问题信息 -->
            <div class="issue-info">
              <div class="issue-meta">
                <span class="time">{{ issue.created_at }}</span>
              </div>
              
              <!-- 催办次数显示 -->
              <!-- <div v-if="issue.reminder_count > 0" class="urge-info">
                已催办 {{ issue.reminder_count }} 次
              </div> -->
            </div>
            
            <!-- 操作按钮 -->
            <!-- <div class="issue-actions" v-if="showUrgeButton || showEvaluateButton">
              <van-button 
                v-if="showUrgeButton && canShowUrgeButton(issue)"
                type="warning" 
                size="small"
                :disabled="!canUrgeToday(issue)"
                @click.stop="onUrgeClick(issue)"
              >
                {{ canUrgeToday(issue) ? '催办' : '今日已催办' }}
              </van-button>
              
              <van-button 
                v-if="showEvaluateButton && issue.status === IssueStatus.RESOLVED"
                type="primary" 
                size="small"
                @click.stop="onEvaluateClick(issue)"
              >
                去评价
              </van-button>
            </div> -->
          </div>
        </div>
      </van-list>
    </van-pull-refresh>
  </div>
</template>

<script>
import { ref } from 'vue'
import { IssueStatus, StatusText, StatusColor, IssueStatusManager } from '@/data/mockIssueData.js'

export default {
  name: 'IssueList',
  props: {
    issues: {
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
    showUrgeButton: {
      type: Boolean,
      default: false
    },
    showEvaluateButton: {
      type: Boolean,
      default: false
    },
    // 自定义状态文本映射（可选）
    customStatusText: {
      type: Object,
      default: null
    },
    // 自定义状态颜色映射（可选）
    customStatusColor: {
      type: Object,
      default: null
    }
  },
  emits: ['click-item', 'urge', 'evaluate', 'refresh', 'load-more'],
  setup(props, { emit }) {
    const refreshing = ref(false)

    // 获取状态类型
    const getStatusType = (status) => {
      const statusMap = {
        [IssueStatus.PENDING]: 'warning',
        [IssueStatus.PROCESSING]: 'primary',
        [IssueStatus.RESOLVED]: 'success',
        [IssueStatus.REVIEWED]: 'default'
      }
      return statusMap[status] || 'default'
    }

    // 获取状态文本 - 支持自定义映射
    const getStatusText = (status) => {
      // 优先使用自定义状态文本映射
      if (props.customStatusText && props.customStatusText[status]) {
        return props.customStatusText[status]
      }
      // 回退到默认映射
      return StatusText[status] || '未知'
    }

    // 获取状态颜色 - 支持自定义映射
    const getStatusColor = (status) => {
      // 优先使用自定义状态颜色映射
      if (props.customStatusColor && props.customStatusColor[status]) {
        return props.customStatusColor[status]
      }
      // 回退到默认映射
      return StatusColor[status] || '#969799'
    }

    // 格式化时间
    const formatTime = (timeStr) => {
      const date = new Date(timeStr)
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
        return date.toLocaleDateString()
      }
    }

    // 检查是否可以显示催办按钮
    const canShowUrgeButton = (issue) => {
      return IssueStatusManager.canUrge(issue)
    }

    // 检查今天是否可以催办
    const canUrgeToday = (issue) => {
      return IssueStatusManager.canUrgeToday(issue.id)
    }

    // 点击问题项
    const onItemClick = (issue) => {
      emit('click-item', issue)
    }

    // 催办点击
    const onUrgeClick = (issue) => {
      emit('urge', issue)
    }

    // 评价点击
    const onEvaluateClick = (issue) => {
      emit('evaluate', issue)
    }

    // 下拉刷新
    const onRefresh = () => {
      refreshing.value = true
      emit('refresh')
      setTimeout(() => {
        refreshing.value = false
      }, 1000)
    }

    // 加载更多
    const onLoad = () => {
      emit('load-more')
    }

    return {
      refreshing,
      getStatusType,
      getStatusText,
      getStatusColor,
      formatTime,
      canShowUrgeButton,
      canUrgeToday,
      onItemClick,
      onUrgeClick,
      onEvaluateClick,
      onRefresh,
      onLoad,
      IssueStatus
    }
  }
}
</script>

<style scoped>
.issue-list {
  background: #f7f8fa;
  min-height: 100%;
}

.issue-item {
  background: white;
  margin-bottom: 8px;
  border-radius:  8px;
  padding: 16px;
  margin: 16px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.issue-item:hover {
  /* background: #f8f9fa; */
}

.issue-item:active {
  background: #f0f1f2;
}

.issue-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.issue-title {
  font-size: 16px;
  font-weight: 600;
  color: #323233;
  line-height: 1.4;
  flex: 1;
  margin-right: 12px;
}

.issue-status {
  flex-shrink: 0;
}

.issue-content {
  font-size: 14px;
  color: #646566;
  line-height: 1.5;
  margin-bottom: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.issue-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  /* margin-bottom: 12px; */
}

.issue-meta {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 14px;
  color: #969799;
  line-height: 1.4;
}

.issue-meta .van-icon {
  margin-top: 2px;
  flex-shrink: 0;
}

.issue-meta span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
  min-width: 0;
}

/* 应用 IssueDetail.vue 的 meta-item 样式 */
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

.category {
  background: #f2f3f5;
  padding: 2px 6px;
  border-radius: 4px;
  color: #646566;
}

.department {
  color: #1989fa;
}

.time {
  color: #969799;
}

.urge-info {
  font-size: 12px;
  color: #ff976a;
}

.issue-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.empty-state {
  padding: 60px 0;
  text-align: center;
}

/* 响应式设计 */
@media (max-width: 375px) {
  .issue-item {
    padding: 12px;
  }
  
  .issue-title {
    font-size: 15px;
  }
  
  .issue-content {
    font-size: 13px;
  }
  
  .issue-meta {
    font-size: 11px;
    gap: 6px;
  }
}
</style>