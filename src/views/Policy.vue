<template>
  <div class="policy-page">
    <van-nav-bar
      title="政策一点通"
      fixed
      placeholder
    />

    <!-- 搜索栏 -->
    <div class="search-container">
      外部链接
    </div>

    <!-- 底部标签栏 -->
    <van-tabbar v-model="activeTab" @change="onTabChange">
      <van-tabbar-item icon="home-o" to="/">首页</van-tabbar-item>
      <van-tabbar-item icon="newspaper-o" to="/news">问政热点</van-tabbar-item>
      <van-tabbar-item icon="chat-o" to="/appeal">我有诉求</van-tabbar-item>
      <van-tabbar-item icon="guide-o" to="/policy">政策一点通</van-tabbar-item>
      <van-tabbar-item icon="user-o" to="/profile">我的</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { showToast } from 'vant'
import { useRouter } from 'vue-router'

export default {
  name: 'PolicyPage',
  setup() {
    const router = useRouter()
    const searchValue = ref('')
    const activeCategory = ref('all')
    const activeTab = ref(3) // 政策一点通
    const refreshing = ref(false)
    const loading = ref(false)
    const finished = ref(false)
    
    const policyList = ref([])
    
    // 模拟政策数据
    const mockPolicyData = [
      {
        id: 1,
        title: '关于进一步优化营商环境的实施意见',
        summary: '为深入贯彻落实国家关于优化营商环境的决策部署，进一步激发市场主体活力...',
        category: 'economy',
        publishTime: '2024-01-15 10:30:00',
        views: 1856,
        likes: 129
      },
      {
        id: 2,
        title: '城乡居民基本医疗保险政策解读',
        summary: '为保障城乡居民基本医疗需求，完善医疗保障体系，现就相关政策进行解读...',
        category: 'medical',
        publishTime: '2024-01-14 16:45:00',
        views: 2392,
        likes: 187
      },
      {
        id: 3,
        title: '义务教育阶段学生资助政策指南',
        summary: '为确保每一个孩子都能接受公平而有质量的教育，国家建立了完善的学生资助政策体系...',
        category: 'education',
        publishTime: '2024-01-13 09:15:00',
        views: 1654,
        likes: 145
      },
      {
        id: 4,
        title: '住房公积金提取新政策',
        summary: '为更好地支持职工合理住房需求，进一步完善住房公积金制度，现对提取政策进行调整...',
        category: 'livelihood',
        publishTime: '2024-01-12 14:20:00',
        views: 3089,
        likes: 278
      },
      {
        id: 5,
        title: '小微企业税收优惠政策汇总',
        summary: '为支持小微企业发展，减轻企业负担，国家出台了一系列税收优惠政策...',
        category: 'economy',
        publishTime: '2024-01-11 11:00:00',
        views: 2156,
        likes: 196
      },
      {
        id: 6,
        title: '养老保险待遇调整通知',
        summary: '根据国家统一部署，结合我市实际情况，现就调整企业退休人员基本养老金标准通知如下...',
        category: 'livelihood',
        publishTime: '2024-01-10 15:30:00',
        views: 4567,
        likes: 423
      }
    ]

    // 获取分类类型
    const getCategoryType = (category) => {
      const typeMap = {
        livelihood: 'primary',
        economy: 'success',
        education: 'warning',
        medical: 'danger'
      }
      return typeMap[category] || 'default'
    }

    // 获取分类名称
    const getCategoryName = (category) => {
      const nameMap = {
        livelihood: '民生政策',
        economy: '经济政策',
        education: '教育政策',
        medical: '医疗政策'
      }
      return nameMap[category] || '其他'
    }

    // 获取分类图标
    const getCategoryIcon = (category) => {
      const iconMap = {
        livelihood: '民生',
        economy: '经济',
        education: '教育',
        medical: '医疗'
      }
      return iconMap[category] || '政策'
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
          return minutes < 1 ? '刚刚' : `${minutes}分钟前`
        }
        return `${hours}小时前`
      } else if (days === 1) {
        return '昨天'
      } else if (days < 7) {
        return `${days}天前`
      } else {
        return timeStr.split(' ')[0]
      }
    }

    // 搜索功能
    const onSearch = (value) => {
      showToast(`搜索: ${value}`)
      // 这里可以实现实际的搜索逻辑
    }

    const onClear = () => {
      searchValue.value = ''
    }

    // 分类切换
    const onCategoryChange = (name) => {
      showToast(`切换到: ${getCategoryName(name) || '全部'}`)
      // 这里可以实现分类筛选逻辑
      loadPolicyList()
    }

    // 下拉刷新
    const onRefresh = () => {
      setTimeout(() => {
        showToast('刷新成功')
        refreshing.value = false
        loadPolicyList()
      }, 1000)
    }

    // 加载更多
    const onLoad = () => {
      setTimeout(() => {
        if (policyList.value.length >= 20) {
          finished.value = true
        } else {
          // 模拟加载更多数据
          const moreData = mockPolicyData.map((item, index) => ({
            ...item,
            id: item.id + policyList.value.length,
            title: `${item.title} (第${Math.floor(policyList.value.length / 6) + 1}页)`
          }))
          policyList.value.push(...moreData.slice(0, 3))
        }
        loading.value = false
      }, 1000)
    }

    // 加载政策列表
    const loadPolicyList = () => {
      policyList.value = [...mockPolicyData]
    }

    // 打开政策详情
    const openPolicyDetail = (item) => {
      showToast(`打开政策: ${item.title}`)
      // 这里可以跳转到政策详情页
    }

    // 底部导航切换
    const onTabChange = (name) => {
      router.push(name)
    }

    onMounted(() => {
      loadPolicyList()
    })

    return {
      searchValue,
      activeCategory,
      activeTab,
      refreshing,
      loading,
      finished,
      policyList,
      getCategoryType,
      getCategoryName,
      getCategoryIcon,
      formatTime,
      onSearch,
      onClear,
      onCategoryChange,
      onRefresh,
      onLoad,
      openPolicyDetail,
      onTabChange
    }
  }
}
</script>

<style scoped>
.policy-page {
  background: #f7f8fa;
  min-height: 100vh;
}

.search-container {
  padding: 10px 16px;
  background: white;
  border-bottom: 1px solid #ebedf0;
}

.category-tabs {
  background: white;
  position: sticky;
  top: 0;
  z-index: 99;
}

.policy-list {
  padding: 0 16px;
  margin-top: 10px;
}

.policy-item {
  background: white;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
  display: flex;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.policy-item:active {
  background-color: #f7f8fa;
  transform: scale(0.98);
}

.policy-content {
  flex: 1;
  margin-right: 12px;
}

.policy-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 8px;
}

.policy-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  line-height: 1.4;
  margin: 0;
  flex: 1;
  margin-right: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.policy-category {
  flex-shrink: 0;
}

.policy-summary {
  font-size: 14px;
  color: #666;
  line-height: 1.4;
  margin: 0 0 12px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.policy-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #999;
}

.meta-left,
.meta-right {
  display: flex;
  align-items: center;
}

.meta-right {
  gap: 8px;
}

.policy-time,
.policy-views,
.policy-likes {
  margin-left: 4px;
}

.policy-image {
  width: 120px;
  height: 80px;
  flex-shrink: 0;
  border-radius: 6px;
  overflow: hidden;
}

.category-icon {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: bold;
  color: white;
  border-radius: 6px;
}

.category-livelihood {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.category-economy {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.category-education {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.category-medical {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

/* 响应式设计 */
@media (max-width: 375px) {
  .policy-item {
    padding: 12px;
  }
  
  .policy-title {
    font-size: 15px;
  }
  
  .policy-summary {
    font-size: 13px;
  }
  
  .policy-image {
    width: 100px;
    height: 70px;
  }
}

/* Vant组件样式覆盖 */
:deep(.van-tabs__wrap) {
  border-bottom: 1px solid #ebedf0;
}

:deep(.van-tab) {
  font-size: 14px;
}

:deep(.van-tab--active) {
  color: #1989fa;
  font-weight: bold;
}

:deep(.van-pull-refresh) {
  min-height: calc(100vh - 200px);
}
</style>