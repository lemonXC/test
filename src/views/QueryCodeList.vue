<template>
  <div class="query-code-list-page">
    <!-- 导航栏 -->
    <van-nav-bar title="我的查询码" left-text="返回" left-arrow @click-left="onBack" fixed placeholder />

    <!-- 页面内容 -->
    <div class="page-content">
      <!-- 用户信息 -->
      <div class="user-info">
        <div class="info-icon">
          <van-icon name="user-circle-o" />
        </div>
        <div class="info-content">
          <h3 class="info-title">验证成功</h3>
          <p class="info-desc">
            已为您找到 {{ maskedContact }} 关联的查询码
          </p>
        </div>
      </div>

      <!-- 查询码列表 -->
      <div class="query-codes-section">
        <div class="section-header">
          <h4 class="section-title">查询码列表</h4>
          <span class="code-count">共 {{ queryCodeList.length }} 个</span>
        </div>

        <!-- 加载状态 -->
        <van-loading v-if="loading" class="loading-container" size="24px">
          正在加载查询码...
        </van-loading>

        <!-- 查询码卡片列表 -->
        <div v-else class="code-list">
          <div v-for="item in queryCodeList" :key="item.queryCode" class="code-item" @click="goToIssueDetail(item)">
            <div class="code-header">
              <div class="code-number">
                <span class="code-label">查询码</span>
                <span class="code-value">{{ item.queryCode }}</span>
              </div>
              <div class="code-status" :class="getStatusClass(item.status)">
                {{ getStatusText(item.status) }}
              </div>
            </div>

            <div class="code-content">
              <h5 class="issue-title">{{ item.title }}</h5>
              <p class="issue-desc">{{ item.description }}</p>
            </div>

            <div class="code-meta">
              <div class="meta-item">
                <van-icon name="clock-o" />
                <span>提交时间：{{ formatDate(item.submitTime) }}</span>
              </div>
              <div class="meta-item" v-if="item.department">
                <van-icon name="service" />
                <span>处理部门：{{ item.department }}</span>
              </div>
            </div>

            <div class="code-footer">
              <van-button type="primary" size="small" plain @click.stop="goToIssueDetail(item)" class="detail-btn">
                查看详情
              </van-button>
              <div class="update-time">
                最后更新：{{ formatDate(item.updateTime) }}
              </div>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <van-empty v-if="!loading && queryCodeList.length === 0" image="search" description="暂无查询码记录">
          <van-button type="primary" size="small" @click="goToAppeal" class="empty-btn">
            去提交问题
          </van-button>
        </van-empty>
      </div>

      <!-- 操作提示 -->
      <!-- <div class="operation-tips">
        <div class="tips-header">
          <van-icon name="info-o" />
          <span>使用说明</span>
        </div>
        <ul class="tips-content">
          <li>点击任意查询码卡片可查看问题详情</li>
          <li>查询码是您问题的唯一标识，请妥善保管</li>
          <li>如有疑问，请联系客服：400-123-4567</li>
        </ul>
      </div> -->
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast } from 'vant'

export default {
  name: 'QueryCodeList',
  setup() {
    const router = useRouter()
    const route = useRoute()

    const loading = ref(true)
    const queryCodeList = ref([])

    // 获取路由参数
    const method = route.query.type || route.query.method || 'email'
    const contact = route.query.contact || ''
    const verified = route.query.verified === 'true'

    // 脱敏显示联系方式
    const maskedContact = computed(() => {
      if (method === 'email') {
        const [username, domain] = contact.split('@')
        if (username && domain) {
          const maskedUsername = username.length > 2
            ? username.substring(0, 2) + '*'.repeat(username.length - 2)
            : username
          return `${maskedUsername}@${domain}`
        }
      } else {
        if (contact.length === 11) {
          return contact.substring(0, 3) + '****' + contact.substring(7)
        }
      }
      return contact
    })

    // 返回上一页
    const onBack = () => {
      router.back()
    }

    // 获取状态样式类
    const getStatusClass = (status) => {
      const statusMap = {
        'pending': 'status-pending',
        'processing': 'status-processing',
        'replied': 'status-replied',
        'closed': 'status-closed'
      }
      return statusMap[status] || 'status-pending'
    }

    // 获取状态文本
    const getStatusText = (status) => {
      const statusMap = {
        'pending': '待处理',
        'processing': '处理中',
        'replied': '已回复',
        // 'closed': '已关闭'
      }
      return statusMap[status] || '待处理'
    }

    // 格式化日期
    const formatDate = (dateString) => {
      const date = new Date(dateString)
      return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    // 跳转到问题详情
    const goToIssueDetail = (item) => {
      router.push({
        path: `/issue-detail/${item.issueId}`,
        query: {
          queryCode: item.queryCode,
          from: 'query-code-list',
          source: 'query_code_list'
        }
      })
    }

    // 跳转到申诉页面
    const goToAppeal = () => {
      router.push('/appeal')
    }

    // 加载查询码列表
    const loadQueryCodeList = async () => {
      loading.value = true

      try {
        // 模拟API请求
        await new Promise(resolve => setTimeout(resolve, 1500))
        queryCodeList.value = [{
          queryCode: 'QC202401003',
          issueId: 'issue_003',
          title: '噪音污染问题持续困扰居民生活质量',
          description: '附近工地夜间施工噪音严重，从晚上10点一直持续到凌晨2点，严重影响居民正常休息...',
          status: 'pending',
          department: null,
          submitTime: '2024-01-13T20:45:00',
          updateTime: '2024-01-17T11:20:00'
        },
        {
          queryCode: 'QC202401002',
          issueId: 'issue_002',
          title: '道路积水严重影响出行安全',
          description: '每逢下雨天，我们这条路就会严重积水，水深可达20-30厘米，给居民出行带来很大不便...',
          status: 'processing',
          department: '市政工程部',
          submitTime: '2024-01-14T14:20:00',
          updateTime: '2024-01-16T09:15:00'
        },
        {
          queryCode: 'QC202401001',
          issueId: 'issue_001',
          title: '关于小区停车位分配不合理的问题反映',
          description: '我们小区停车位分配存在严重不公平现象，一些业主占用多个停车位，而另一些业主却无法找到停车位...',
          status: 'replied',
          department: '物业管理处',
          submitTime: '2024-01-15T10:30:00',
          updateTime: '2024-01-18T14:30:00'
        }]
      } catch (error) {
        showToast('加载失败，请重试')
        console.error('加载查询码列表失败:', error)
      } finally {
        loading.value = false
      }
    }

    // 组件挂载时检查验证状态并加载数据
    onMounted(() => {
      if (!verified) {
        showToast('请先完成验证')
        router.back()
        return
      }

      loadQueryCodeList()
    })

    return {
      loading,
      queryCodeList,
      maskedContact,
      onBack,
      getStatusClass,
      getStatusText,
      formatDate,
      goToIssueDetail,
      goToAppeal
    }
  }
}
</script>

<style scoped>
.query-code-list-page {
  background: #f7f8fa;
  min-height: 100vh;
}

.page-content {
  padding: 16px;
}

/* 用户信息 */
.user-info {
  background: linear-gradient(135deg, #1989fa, #1976d2);
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  color: white;
}

.info-icon {
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  font-size: 24px;
}

.info-content {
  flex: 1;
}

.info-title {
  font-size: 18px;
  font-weight: bold;
  margin: 0 0 4px 0;
}

.info-desc {
  font-size: 14px;
  opacity: 0.9;
  margin: 0;
  line-height: 1.4;
}

/* 查询码列表区域 */
.query-codes-section {
  margin-bottom: 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin: 0;
}

.code-count {
  font-size: 12px;
  color: #666;
  background: #f0f0f0;
  padding: 4px 8px;
  border-radius: 12px;
}

.loading-container {
  text-align: center;
  padding: 40px 0;
  color: #666;
}

/* 查询码卡片 */
.code-list {
  space-y: 12px;
}

.code-item {
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid transparent;
}

.code-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  border-color: #1989fa;
}

.code-item:active {
  transform: translateY(0);
}

.code-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.code-number {
  display: flex;
  flex-direction: column;
}

.code-label {
  font-size: 12px;
  color: #666;
  margin-bottom: 2px;
}

.code-value {
  font-size: 16px;
  font-weight: bold;
  color: #1989fa;
  font-family: 'Courier New', monospace;
}

.code-status {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.status-pending {
  background: #fff7e6;
  color: #fa8c16;
}

.status-processing {
  background: #e6f7ff;
  color: #1890ff;
}

.status-replied {
  background: #f6ffed;
  color: #52c41a;
}

.status-closed {
  background: #f5f5f5;
  color: #8c8c8c;
}

.code-content {
  margin-bottom: 12px;
}

.issue-title {
  font-size: 14px;
  font-weight: bold;
  color: #333;
  margin: 0 0 6px 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.issue-desc {
  font-size: 12px;
  color: #666;
  margin: 0;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.code-meta {
  margin-bottom: 12px;
}

.meta-item {
  display: flex;
  align-items: flex-start;
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
  line-height: 1.4;
}

.meta-item:last-child {
  margin-bottom: 0;
}

.meta-item .van-icon {
  margin-right: 6px;
  font-size: 12px;
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

.code-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}

.detail-btn {
  font-size: 12px;
  height: 28px;
  padding: 0 12px;
}

.update-time {
  font-size: 11px;
  color: #999;
}

.empty-btn {
  margin-top: 16px;
}

/* 操作提示 */
.operation-tips {
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.tips-header {
  display: flex;
  align-items: center;
  font-size: 14px;
  font-weight: bold;
  color: #333;
  margin-bottom: 12px;
}

.tips-header .van-icon {
  color: #1989fa;
  margin-right: 6px;
}

.tips-content {
  margin: 0;
  padding-left: 16px;
}

.tips-content li {
  font-size: 12px;
  color: #666;
  line-height: 1.6;
  margin-bottom: 6px;
}

.tips-content li:last-child {
  margin-bottom: 0;
}

/* 响应式设计 */
@media (max-width: 375px) {
  .page-content {
    padding: 12px;
  }

  .user-info {
    padding: 16px;
  }

  .info-icon {
    width: 40px;
    height: 40px;
    font-size: 20px;
  }

  .info-title {
    font-size: 16px;
  }

  .code-item {
    padding: 12px;
  }
}

/* 深色模式适配 */
@media (prefers-color-scheme: dark) {
  .query-code-list-page {
    background: #1a1a1a;
  }

  .code-item,
  .operation-tips {
    background: #2a2a2a;
    border-color: #333;
  }

  .section-title,
  .issue-title,
  .tips-header {
    color: #fff;
  }

  .code-label,
  .issue-desc,
  .meta-item,
  .update-time,
  .tips-content li {
    color: #ccc;
  }

  .code-count {
    background: #333;
    color: #ccc;
  }

  .code-footer {
    border-color: #333;
  }
}
</style>