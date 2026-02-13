<template>
  <div class="home">
    <!-- 轮播图 -->
    <van-swipe class="banner" :autoplay="3000" indicator-color="white">
      <van-swipe-item v-for="(image, index) in banners" :key="index">
        <img :src="image" alt="banner" />
      </van-swipe-item>
    </van-swipe>

    <!-- 公众号文章列表 -->
    <div class="articles-section">
      <div class="section-title">
        <van-icon name="newspaper-o" />
        <span>热点</span>
      </div>
      <div class="articles-list">
        <div v-for="article in articles" :key="article.id" class="article-item" @click="openArticleDetail(article)">
          <div class="article-cover">
            <img :src="article.cover" :alt="article.title" />
          </div>
          <div class="article-content">
            <div class="article-title">{{ article.title }}</div>
            <div class="article-summary">{{ article.summary }}</div>
            <div class="article-meta">
              <span class="article-time">{{ formatTime(article.publishTime) }}</span>
              <!-- <span class="article-views">{{ article.views }}阅读</span> -->
            </div>
          </div>
        </div>
      </div>

      <!-- 加载更多按钮 -->
      <div class="load-more-container" v-if="hasMore">
        <van-button :loading="loading" @click="loadMoreArticles" type="default" size="small" round>
          {{ loading ? '加载中...' : '加载更多' }}
        </van-button>
      </div>

      <!-- 没有更多数据提示 -->
      <div class="no-more-tip" v-if="!hasMore && articles.length > 0">
        <van-divider>没有更多文章了</van-divider>
      </div>
    </div>

    <!-- 热门问政 -->
    <!-- <div class="hot-section">
      <van-divider>热门问政</van-divider>
      <div class="hot-list">
        <div v-for="item in hotItems" :key="item.id" class="hot-item" @click="openExternalLink(item)">
          <div class="hot-content">
            <div class="hot-title">{{ item.title }}</div>
            <div class="hot-info">
              <span class="hot-department">{{ item.department }}</span>
              <span class="hot-time">{{ item.time }}</span>
            </div>
          </div>
          <van-icon name="arrow" class="hot-arrow" />
        </div>
      </div>
    </div> -->

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
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showLoadingToast, closeToast } from 'vant'

export default {
  name: 'Home',
  setup() {
    const router = useRouter()
    const searchValue = ref('')
    const activeTab = ref(0) // 首页

    const banners = ref([
      'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg',
      'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg',
      'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg'
    ])

    // 文章列表数据
    const articles = ref([
      {
        id: 1,
        title: '数字化转型助力政务服务提质增效',
        summary: '通过数字化手段，政务服务效率显著提升，群众办事更加便民...',
        cover: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmOWZmIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzMzMyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuaVsOWtl+WMluaUv+WKoTwvdGV4dD48L3N2Zz4=',
        publishTime: '2024-01-20 10:30:00',
        views: 1250
      },
      {
        id: 2,
        title: '城市绿化建设取得新进展',
        summary: '今年新增绿地面积500公顷，城市生态环境持续改善...',
        cover: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmOWYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzMzMyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuWfjuW4gue7v+WMljwvdGV4dD48L3N2Zz4=',
        publishTime: '2024-01-19 14:20:00',
        views: 980
      },
      {
        id: 3,
        title: '教育资源均衡发展新举措',
        summary: '推进优质教育资源共享，缩小城乡教育差距...',
        cover: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZmZmNWYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzMzMyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuaVmeiCsuWPkeWxlTwvdGV4dD48L3N2Zz4=',
        publishTime: '2024-01-18 09:15:00',
        views: 1560
      },
      {
        id: 4,
        title: '交通基础设施建设稳步推进',
        summary: '地铁二号线即将通车，市民出行将更加便利...',
        cover: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjVmMGZmIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzMzMyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuS6pOmAmuW7uuiuvjwvdGV4dD48L3N2Zz4=',
        publishTime: '2024-01-17 16:45:00',
        views: 2100
      },
      {
        id: 5,
        title: '医疗卫生服务水平持续提升',
        summary: '新建社区卫生服务中心5个，基本医疗服务覆盖率达98%...',
        cover: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmZmYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzMzMyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuWMu+eWl+WNq+eUn+acjeWKoTwvdGV4dD48L3N2Zz4=',
        publishTime: '2024-01-16 11:30:00',
        views: 890
      }
    ])

    // 分页相关状态
    const loading = ref(false)
    const hasMore = ref(true)
    const currentPage = ref(1)
    const pageSize = 5

    // 热门问政数据
    const hotItems = ref([
      {
        id: 1,
        title: '关于城市道路维修的建议',
        department: '交通局',
        time: '2024-01-15',
        url: 'https://www.baidu.com/index.htm'
      },
      {
        id: 2,
        title: '学校周边交通安全问题',
        department: '教育局',
        time: '2024-01-14',
        url: 'https://www.baidu.com/index.htm'
      },
      {
        id: 3,
        title: '社区医疗服务改善建议',
        department: '卫健委',
        time: '2024-01-13',
        url: 'https://www.baidu.com/index.htm'
      },
      {
        id: 4,
        title: '老旧小区改造进度咨询',
        department: '住建局',
        time: '2024-01-12',
        url: 'https://www.baidu.com/index.htm'
      }
    ])

    const onSearch = (value) => {
      showToast(`搜索文章内容: ${value}`)
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

    // 文章详情页跳转
    const openArticleDetail = (article) => {
      showLoadingToast({
        message: '正在加载...',
        forbidClick: true,
        duration: 500
      })

      setTimeout(() => {
        closeToast()
        // 跳转到文章详情页，传递文章ID参数
        router.push({
          name: 'article-detail',
          params: {
            id: article.id
          }
        })
      }, 500)
    }

    // 加载更多文章
    const loadMoreArticles = async () => {
      if (loading.value) return

      loading.value = true

      // 模拟API请求
      setTimeout(() => {
        const newArticles = [
          {
            id: articles.value.length + 1,
            title: `新文章标题 ${articles.value.length + 1}`,
            summary: '这是一篇新加载的文章摘要内容...',
            cover: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjVmNWY1Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzMzMyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuaWsOaWh+eroTwvdGV4dD48L3N2Zz4=',
            publishTime: '2024-01-15 08:00:00',
            views: Math.floor(Math.random() * 1000) + 100
          },
          {
            id: articles.value.length + 2,
            title: `新文章标题 ${articles.value.length + 2}`,
            summary: '这是另一篇新加载的文章摘要内容...',
            cover: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjVmNWY1Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzMzMyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuaWsOaWh+eroTwvdGV4dD48L3N2Zz4=',
            publishTime: '2024-01-14 15:30:00',
            views: Math.floor(Math.random() * 1000) + 100
          }
        ]

        articles.value.push(...newArticles)
        currentPage.value++

        // 模拟没有更多数据的情况
        if (currentPage.value >= 3) {
          hasMore.value = false
        }

        loading.value = false
        showToast('加载成功')
      }, 1500)
    }

    const onTabChange = (index) => {
      console.log('切换到标签页:', index)
    }

    // 导航到公告通知页面
    const goToNoticeList = () => {
      router.push({ name: 'NoticeList' })
    }

    // 导航到问题管理页面
    const goToIssueManagement = () => {
      router.push({ name: 'IssueManagement' })
    }

    // 导航到在线解答页面
    const goToOnlineAnswer = () => {
      router.push({ name: 'OnlineAnswer' })
    }

    return {
      searchValue,
      activeTab,
      banners,
      articles,
      loading,
      hasMore,
      hotItems,
      onSearch,
      formatTime,
      openArticleDetail,
      loadMoreArticles,
      onTabChange,
      goToNoticeList,
      goToIssueManagement,
      goToOnlineAnswer
    }
  }
}
</script>

<style scoped>
.home {
  padding-bottom: 50px;
  background: #f7f8fa;
}

.search-container {
  padding: 10px 16px;
  margin-top: 46px;
  background: #f7f8fa;
}

.banner {
  height: 200px;
}

.banner img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 功能入口区域样式 */
.function-section {
  background: white;
  margin: 10px 16px;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.function-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.function-item {
  display: flex;
  align-items: center;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid #f0f0f0;
}

.function-item:hover {
  background: #f2f3f5;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.function-item:active {
  transform: translateY(0);
  background: #ebedf0;
}

.function-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  color: white;
}

.function-icon.notice {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.function-icon.issue {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.function-icon.answer {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.function-content {
  flex: 1;
}

.function-title {
  font-size: 16px;
  font-weight: 600;
  color: #323233;
  margin: 0 0 4px 0;
}

.function-desc {
  font-size: 13px;
  color: #969799;
  margin: 0;
}

.function-arrow {
  color: #c8c9cc;
  font-size: 16px;
}

/* 文章列表样式 */
.articles-section {
  padding: 20px 16px;
  background: white;
  margin: 10px 0;
}

.section-title {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.section-title .van-icon {
  margin-right: 8px;
  color: #1989fa;
}

.articles-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.article-item {
  display: flex;
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid #f0f0f0;
  padding: 15px;
}

.article-item:active {
  transform: scale(0.98);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.article-cover {
  width: 120px;
  height: 90px;
  flex-shrink: 0;
  overflow: hidden;
}

.article-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.article-content {
  flex: 1;
  margin-left: 15px;
  /* padding: 12px 16px; */
  display: flex;
  flex-direction: column;
  /* justify-content: space-between; */
  min-height: 90px;
}

.article-title {
  font-size: 15px;
  font-weight: 600;
  color: #333;
  line-height: 1.4;
  margin-bottom: 6px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
}

.article-summary {
  font-size: 13px;
  color: #666;
  line-height: 1.4;
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.article-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #999;
}

.article-time {
  color: #999;
}

.article-views {
  color: #1989fa;
  font-weight: 500;
}

.load-more-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.no-more-tip {
  margin-top: 20px;
  text-align: center;
}

/* 热门问政样式 */
.hot-section {
  padding: 0 16px;
  margin-bottom: 20px;
}

.hot-list {
  background: white;
  border-radius: 8px;
  overflow: hidden;
}

.hot-item {
  display: flex;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.hot-item:last-child {
  border-bottom: none;
}

.hot-item:active {
  background-color: #f7f8fa;
}

.hot-content {
  flex: 1;
}

.hot-title {
  font-size: 14px;
  color: #333;
  margin-bottom: 8px;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.hot-info {
  display: flex;
  align-items: center;
  font-size: 12px;
  color: #999;
}

.hot-department {
  background: #e8f3ff;
  color: #1989fa;
  padding: 2px 8px;
  border-radius: 10px;
  margin-right: 8px;
}

.hot-time {
  color: #666;
}

.hot-arrow {
  color: #c8c9cc;
  font-size: 16px;
}

/* 响应式设计 */
@media (max-width: 375px) {
  .department-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .department-item {
    padding: 16px 8px;
  }

  .department-icon {
    font-size: 24px;
  }

  .department-name {
    font-size: 13px;
  }

  .department-desc {
    font-size: 11px;
  }
}
</style>