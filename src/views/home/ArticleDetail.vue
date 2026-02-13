<template>
  <div class="article-detail">
    <!-- 导航栏 -->
    <van-nav-bar 
      title="" 
      left-text="返回" 
      left-arrow 
      @click-left="goBack"
      fixed
       class="nav-bar"
    />

    <!-- 文章内容 -->
    <div class="article-content" v-if="article">
      <!-- 文章头部 -->
      <div class="article-header">
        <h1 class="article-title">{{ article.title }}</h1>
        <div class="article-meta">
          <div class="meta-item">
            <van-icon name="clock-o" />
            <span>{{ formatTime(article.publishTime) }}</span>
          </div>
          <div class="meta-item">
            <van-icon name="eye-o" />
            <span>{{ article.views }}阅读</span>
          </div>
        </div>
      </div>

      <!-- 文章封面 -->
      <div class="article-cover" v-if="article.cover">
        <img :src="article.cover" :alt="article.title" />
      </div>

      <!-- 文章正文 -->
      <div class="article-body">
        <div class="article-summary">{{ article.summary }}</div>
        <div class="article-text" v-html="article.content"></div>
      </div>
    </div>

    <!-- 加载状态 -->
    <div class="loading-container" v-else-if="loading">
      <van-loading type="spinner" size="24px">加载中...</van-loading>
    </div>

    <!-- 错误状态 -->
    <div class="error-container" v-else>
      <van-empty description="文章不存在或已被删除">
        <van-button type="primary" @click="goBack">返回首页</van-button>
      </van-empty>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast, showSuccessToast } from 'vant'

export default {
  name: 'ArticleDetail',
  setup() {
    const route = useRoute()
    const router = useRouter()
    
    const article = ref(null)
    const loading = ref(true)
    const activeTab = ref(0)
    const isLiked = ref(false)

    // 模拟文章数据
    const mockArticles = {
      1: {
        id: 1,
        title: '数字化转型助力政务服务提质增效',
        summary: '通过数字化手段，政务服务效率显著提升，群众办事更加便民...',
        cover: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmOWZmIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzMzMyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuaVsOWtl+WMluaUv+WKoTwvdGV4dD48L3N2Zz4=',
        publishTime: '2024-01-20 10:30:00',
        views: 1250,
        likes: 89,
        tags: ['数字化', '政务服务', '便民'],
        content: `
          <p>随着信息技术的快速发展，数字化转型已成为推动政务服务现代化的重要引擎。我市积极响应国家数字政府建设要求，全面推进政务服务数字化转型，取得了显著成效。</p>
          
          <h3>一、数字化政务服务平台建设</h3>
          <p>建设了统一的政务服务平台，实现了"一网通办"。市民可以通过手机APP、网站等多种渠道，随时随地办理各类政务服务事项。目前平台已接入各类服务事项500余项，覆盖了市民生活的方方面面。</p>
          
          <h3>二、办事效率显著提升</h3>
          <p>通过数字化手段，原本需要跑多个部门、提交多份材料的事项，现在可以实现"一次办结"。平均办事时间缩短了60%，群众满意度达到98%以上。</p>
          
          <h3>三、智能化服务体验</h3>
          <p>引入人工智能技术，提供24小时在线咨询服务。智能客服可以解答常见问题，引导市民快速找到所需服务，大大提升了服务体验。</p>
          
          <p>下一步，我们将继续深化数字化转型，不断优化服务流程，为市民提供更加便民、高效的政务服务。</p>
        `
      },
      2: {
        id: 2,
        title: '城市绿化建设取得新进展',
        summary: '今年新增绿地面积500公顷，城市生态环境持续改善...',
        cover: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmOWYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzMzMyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuWfjuW4gue7v+WMljwvdGV4dD48L3N2Zz4=',
        publishTime: '2024-01-19 14:20:00',
        views: 980,
        likes: 67,
        tags: ['城市绿化', '生态环境', '民生'],
        content: `
          <p>今年以来，我市持续推进城市绿化建设，着力打造宜居宜业的生态环境，取得了显著成效。</p>
          
          <h3>一、绿地建设成果丰硕</h3>
          <p>截至目前，全市新增绿地面积500公顷，其中公园绿地200公顷，道路绿化150公顷，居住区绿化150公顷。城市绿化覆盖率达到42%，人均公园绿地面积达到15平方米。</p>
          
          <h3>二、重点项目稳步推进</h3>
          <p>完成了中央公园二期建设，新建了5个社区公园，改造提升了10条主要道路的绿化景观。这些项目的实施，进一步完善了城市绿地系统。</p>
          
          <h3>三、生态效益日益显现</h3>
          <p>通过大规模的绿化建设，城市空气质量明显改善，PM2.5浓度同比下降15%。绿地的增加也为市民提供了更多的休闲娱乐场所。</p>
        `
      },
      3: {
        id: 3,
        title: '教育资源均衡发展新举措',
        summary: '推进优质教育资源共享，缩小城乡教育差距...',
        cover: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZmZmNWYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzMzMyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuaVmeiCsuWPkeWxlTwvdGV4dD48L3N2Zz4=',
        publishTime: '2024-01-18 09:15:00',
        views: 1560,
        likes: 123,
        tags: ['教育', '均衡发展', '教育资源'],
        content: `
          <p>为促进教育公平，我市出台了一系列教育资源均衡发展新举措，努力让每个孩子都能享受到优质的教育资源。</p>
          
          <h3>一、优质学校结对帮扶</h3>
          <p>建立了城乡学校结对帮扶机制，20所优质学校与30所薄弱学校建立帮扶关系，通过师资交流、教学资源共享等方式，提升薄弱学校办学水平。</p>
          
          <h3>二、教师队伍建设</h3>
          <p>实施教师轮岗交流制度，每年选派100名优秀教师到农村学校支教。同时加大教师培训力度，提升教师专业素养。</p>
          
          <h3>三、数字化教育资源</h3>
          <p>建设了教育云平台，汇聚优质教学资源，实现城乡学校共享。目前平台已有课程资源5000余个，惠及学生10万余人。</p>
        `
      },
      4: {
        id: 4,
        title: '交通基础设施建设稳步推进',
        summary: '地铁二号线即将通车，市民出行将更加便利...',
        cover: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjVmMGZmIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzMzMyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuS6pOmAmuW7uuiuvjwvdGV4dD48L3N2Zz4=',
        publishTime: '2024-01-17 16:45:00',
        views: 2100,
        likes: 156,
        tags: ['交通建设', '地铁', '基础设施'],
        content: `
          <p>我市交通基础设施建设取得重大进展，地铁二号线建设进入收尾阶段，预计年底前正式通车运营。</p>
          
          <h3>一、地铁二号线建设进展</h3>
          <p>地铁二号线全长28公里，设站22座，目前已完成95%的建设任务。车站装修、设备调试等工作正在紧张进行中，预计12月底前开通试运营。</p>
          
          <h3>二、道路网络不断完善</h3>
          <p>今年新建改建道路15条，总长度50公里。重点完成了环城快速路建设，大大缓解了城市交通压力。</p>
          
          <h3>三、公共交通优化升级</h3>
          <p>新增公交线路8条，优化调整线路12条，投入新能源公交车200辆。公共交通出行分担率达到60%。</p>
        `
      },
      5: {
        id: 5,
        title: '医疗卫生服务水平持续提升',
        summary: '新建社区卫生服务中心5个，基本医疗服务覆盖率达98%...',
        cover: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmZmYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzMzMyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuWMu+eWl+WNq+eUn+acjeWKoTwvdGV4dD48L3N2Zz4=',
        publishTime: '2024-01-16 11:30:00',
        views: 890,
        likes: 78,
        tags: ['医疗卫生', '社区服务', '健康'],
        content: `
          <p>我市持续加大医疗卫生投入，不断完善医疗服务体系，基本医疗服务水平显著提升。</p>
          
          <h3>一、医疗设施建设</h3>
          <p>新建社区卫生服务中心5个，改扩建乡镇卫生院8个，基本实现了15分钟医疗服务圈。基本医疗服务覆盖率达到98%。</p>
          
          <h3>二、医疗人才队伍建设</h3>
          <p>引进高层次医疗人才50名，培养全科医生100名。通过人才引进和培养，医疗服务能力不断提升。</p>
          
          <h3>三、智慧医疗发展</h3>
          <p>推进"互联网+医疗健康"建设，开展远程医疗服务，实现了市县乡三级医疗机构互联互通。</p>
        `
      }
    }

    // 获取文章详情
    const fetchArticle = async () => {
      loading.value = true
      const articleId = parseInt(route.params.id)
      
      // 模拟API请求延迟
      setTimeout(() => {
        article.value = mockArticles[articleId] || null
        loading.value = false
      }, 500)
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

    // 返回上一页
    const goBack = () => {
      router.go(-1)
    }

    // 点赞功能
    const toggleLike = () => {
      if (!article.value) return
      
      isLiked.value = !isLiked.value
      if (isLiked.value) {
        article.value.likes = (article.value.likes || 0) + 1
        showSuccessToast('点赞成功')
      } else {
        article.value.likes = Math.max((article.value.likes || 0) - 1, 0)
        showToast('取消点赞')
      }
    }

    // 分享功能
    const shareArticle = () => {
      if (!article.value) return
      
      // 这里可以实现真实的分享功能
      showToast('分享功能开发中...')
    }

    // 标签栏切换
    const onTabChange = (index) => {
      console.log('切换到标签页:', index)
    }

    onMounted(() => {
      fetchArticle()
    })

    return {
      article,
      loading,
      activeTab,
      isLiked,
      formatTime,
      goBack,
      toggleLike,
      shareArticle,
      onTabChange
    }
  }
}
</script>

<style scoped>
.article-detail {
  background: #f7f8fa;
  min-height: 100vh;
  padding-bottom: 60px;
}

/* .nav-bar {
  background-color: #1989fa;
  color: white;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
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

.article-content {
  padding: 60px 16px 20px;
}

.article-header {
  background: white;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.article-title {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  line-height: 1.4;
  margin: 0 0 16px 0;
}

.article-meta {
  display: flex;
  gap: 20px;
}

.meta-item {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  font-size: 14px;
  color: #666;
  line-height: 1.4;
}

.meta-item .van-icon {
  color: #1989fa;
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

.article-cover {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.article-cover img {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.article-body {
  background: white;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.article-summary {
  font-size: 16px;
  color: #666;
  line-height: 1.6;
  margin-bottom: 20px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #1989fa;
}

.article-text {
  font-size: 15px;
  line-height: 1.8;
  color: #333;
}

.article-text h3 {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 24px 0 12px 0;
  padding-bottom: 8px;
  border-bottom: 2px solid #1989fa;
}

.article-text p {
  margin: 12px 0;
  text-indent: 2em;
}

.article-footer {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.article-tags {
  margin-bottom: 16px;
}

.tag-item {
  margin-right: 8px;
  margin-bottom: 8px;
}

.article-actions {
  display: flex;
  gap: 12px;
}

.article-actions .van-button {
  flex: 1;
}

.liked {
  background: #ff6b6b !important;
  border-color: #ff6b6b !important;
}

.loading-container,
.error-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  padding: 60px 16px 20px;
}

.loading-container {
  flex-direction: column;
  gap: 12px;
  color: #666;
}

/* 响应式设计 */
@media (max-width: 375px) {
  .article-title {
    font-size: 18px;
  }
  
  .article-text {
    font-size: 14px;
  }
  
  .article-actions {
    flex-direction: column;
  }
}
</style>