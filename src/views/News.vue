<template>
  <div class="news-page">
    <van-nav-bar
      title="问政热点"
      fixed
      placeholder
    />

    <!-- 搜索栏 -->
    <!-- <div class="search-container">
      <van-search
        v-model="searchValue"
        placeholder="搜索新闻内容"
        @search="onSearch"
        @clear="onClear"
      />
    </div> -->

    <!-- 新闻分类标签 -->
    <div class="category-tabs">
      <van-tabs v-model:active="activeCategory" @change="onCategoryChange">
        <van-tab title="全部" name="all" />
        <van-tab title="政务动态" name="government" />
        <van-tab title="民生服务" name="service" />
        <van-tab title="通知公告" name="notice" />
        <van-tab title="政策解读" name="policy" />
      </van-tabs>
    </div>

    <!-- 新闻列表 -->
    <div class="news-list">
      <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
        <van-list
          v-model:loading="loading"
          :finished="finished"
          finished-text="没有更多了"
          @load="onLoad"
        >
          <div
            v-for="item in newsList"
            :key="item.id"
            class="news-item"
            @click="openNewsDetail(item)"
          >
            <div class="news-content">
              <div class="news-header">
                <h3 class="news-title">{{ item.title }}</h3>
                <van-tag
                  :type="getCategoryType(item.category)"
                  size="small"
                  class="news-category"
                >
                  {{ getCategoryName(item.category) }}
                </van-tag>
              </div>
              
              <p class="news-summary">{{ item.summary }}</p>
              
              <div class="news-meta">
                <div class="meta-left">
                  <van-icon name="clock-o" />
                  <span class="news-time">{{ formatTime(item.publishTime) }}</span>
                </div>
                <div class="meta-right">
                  <van-icon name="eye-o" />
                  <span class="news-views">{{ item.views }}</span>
                  <van-icon name="like-o" />
                  <span class="news-likes">{{ item.likes }}</span>
                </div>
              </div>
            </div>
            
            <div class="news-image">
              <div 
                class="category-icon"
                :class="`category-${item.category}`"
              >
                {{ getCategoryIcon(item.category) }}
              </div>
            </div>
          </div>
        </van-list>
      </van-pull-refresh>
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
  name: 'NewsPage',
  setup() {
    const router = useRouter()
    const searchValue = ref('')
    const activeCategory = ref('all')
    const activeTab = ref(1) // 问政热点
    const refreshing = ref(false)
    const loading = ref(false)
    const finished = ref(false)
    
    const newsList = ref([])
    
    // 模拟新闻数据
    const mockNewsData = [
      {
        id: 1,
        title: '市政府召开重要会议，部署下半年重点工作',
        summary: '会议强调要深入贯彻落实党的二十大精神，扎实推进各项民生工程建设...',
        category: 'government',
        publishTime: '2024-01-15 10:30:00',
        views: 1256,
        likes: 89,
        image: null
      },
      {
        id: 2,
        title: '便民服务再升级，"一网通办"新增20项业务',
        summary: '为进一步提升政务服务效能，我市政务服务平台新增20项便民服务事项...',
        category: 'service',
        publishTime: '2024-01-14 16:45:00',
        views: 892,
        likes: 67,
        image: null
      },
      {
        id: 3,
        title: '关于开展2024年度城市绿化工作的通知',
        summary: '为改善城市生态环境，提升城市品质，现就2024年度城市绿化工作通知如下...',
        category: 'notice',
        publishTime: '2024-01-13 09:15:00',
        views: 654,
        likes: 45,
        image: null
      },
      {
        id: 4,
        title: '新版《城市管理条例》政策解读',
        summary: '新修订的《城市管理条例》将于下月正式实施，本文对主要变化进行详细解读...',
        category: 'policy',
        publishTime: '2024-01-12 14:20:00',
        views: 1089,
        likes: 78,
        image: null
      },
      {
        id: 5,
        title: '教育局发布中小学招生政策调整通知',
        summary: '根据教育部最新要求，结合我市实际情况，现对中小学招生政策进行适当调整...',
        category: 'government',
        publishTime: '2024-01-11 11:00:00',
        views: 2156,
        likes: 156,
        image: null
      },
      {
        id: 6,
        title: '医保电子凭证使用指南',
        summary: '医保电子凭证已全面推广，市民可通过多种方式激活使用，享受便捷医疗服务...',
        category: 'service',
        publishTime: '2024-01-10 15:30:00',
        views: 1567,
        likes: 123,
        image: null
      }
    ]

    // 获取分类类型
    const getCategoryType = (category) => {
      const typeMap = {
        government: 'primary',
        service: 'success',
        notice: 'warning',
        policy: 'danger'
      }
      return typeMap[category] || 'default'
    }

    // 获取分类名称
    const getCategoryName = (category) => {
      const nameMap = {
        government: '政务动态',
        service: '民生服务',
        notice: '通知公告',
        policy: '政策解读'
      }
      return nameMap[category] || '其他'
    }

    // 获取分类图标
    const getCategoryIcon = (category) => {
      const iconMap = {
        government: '政务',
        service: '服务',
        notice: '通知',
        policy: '政策'
      }
      return iconMap[category] || '新闻'
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
      loadNewsList()
    }

    // 下拉刷新
    const onRefresh = () => {
      setTimeout(() => {
        showToast('刷新成功')
        refreshing.value = false
        loadNewsList()
      }, 1000)
    }

    // 加载更多
    const onLoad = () => {
      setTimeout(() => {
        if (newsList.value.length >= 20) {
          finished.value = true
        } else {
          // 模拟加载更多数据
          const moreData = mockNewsData.map((item, index) => ({
            ...item,
            id: item.id + newsList.value.length,
            title: `${item.title} (第${Math.floor(newsList.value.length / 6) + 1}页)`
          }))
          newsList.value.push(...moreData.slice(0, 3))
        }
        loading.value = false
      }, 1000)
    }

    // 加载新闻列表
    const loadNewsList = () => {
      newsList.value = [...mockNewsData]
    }

    // 打开新闻详情
    const openNewsDetail = (item) => {
      showToast(`打开新闻: ${item.title}`)
      // 这里可以跳转到新闻详情页
    }

    // 底部导航切换
    const onTabChange = (name) => {
      router.push(name)
    }

    onMounted(() => {
      loadNewsList()
    })

    return {
      searchValue,
      activeCategory,
      activeTab,
      refreshing,
      loading,
      finished,
      newsList,
      getCategoryType,
      getCategoryName,
      getCategoryIcon,
      formatTime,
      onSearch,
      onClear,
      onCategoryChange,
      onRefresh,
      onLoad,
      openNewsDetail,
      onTabChange
    }
  }
}
</script>

<style scoped>
.news-page {
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

.news-list {
  padding: 0 16px;
  margin-top: 10px;
}

.news-item {
  background: white;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
  display: flex;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.news-item:active {
  background-color: #f7f8fa;
  transform: scale(0.98);
}

.news-content {
  flex: 1;
  margin-right: 12px;
}

.news-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 8px;
}

.news-title {
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

.news-category {
  flex-shrink: 0;
}

.news-summary {
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

.news-meta {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  font-size: 12px;
  color: #999;
  line-height: 1.4;
}

.meta-left,
.meta-right {
  display: flex;
  align-items: flex-start;
  gap: 6px;
}

.meta-right {
  gap: 8px;
}

.meta-left .van-icon,
.meta-right .van-icon {
  margin-top: 2px;
  flex-shrink: 0;
}

.news-time,
.news-views,
.news-likes {
  margin-left: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
  min-width: 0;
}

.news-image {
  width: 120px;
  height: 80px;
  flex-shrink: 0;
  border-radius: 6px;
  overflow: hidden;
}

.news-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
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

.category-government {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.category-service {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.category-notice {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
}

.category-policy {
  background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
  color: #333;
}

/* 响应式设计 */
@media (max-width: 375px) {
  .news-item {
    padding: 12px;
  }
  
  .news-title {
    font-size: 15px;
  }
  
  .news-summary {
    font-size: 13px;
  }
  
  .news-image {
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