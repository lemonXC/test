<template>
  <div class="appeal-page">
    <!-- 导航栏 -->
    <van-nav-bar
      title="我有诉求"
      fixed
      placeholder
    />

    <!-- 页面内容 -->
    <div class="page-content">
      <!-- 功能入口区域 -->
      <div class="function-section">
        <h2 class="section-title">请选择您的诉求类型</h2>
        <div class="function-grid">
          <div 
            class="function-item"
            @click="navigateToSubmit('complaint')"
          >
            <div class="function-icon complaint">
              <van-icon name="warning-o" />
            </div>
            <h3 class="function-title">我有诉求</h3>
            <p class="function-desc">投诉举报、问题反映</p>
          </div>

          <div 
            class="function-item"
            @click="navigateToSubmit('suggestion')"
          >
            <div class="function-icon suggestion">
              <van-icon name="bulb-o" />
            </div>
            <h3 class="function-title">我要建言</h3>
            <p class="function-desc">意见建议、政策建言</p>
          </div>

          <div 
            class="function-item"
            @click="navigateToSubmit('consultation')"
          >
            <div class="function-icon consultation">
              <van-icon name="question-o" />
            </div>
            <h3 class="function-title">我要咨询</h3>
            <p class="function-desc">政策咨询、办事指南</p>
          </div>

          <div 
            class="function-item"
            @click="navigateToSubmit('report')"
          >
            <div class="function-icon report">
              <van-icon name="photo-o" />
            </div>
            <h3 class="function-title">我要爆料</h3>
            <p class="function-desc">新闻爆料、线索举报</p>
          </div>
        </div>
      </div>

      <!-- 查询功能区域 -->
      <div class="query-section">
        <div class="query-card">
          <!-- <div class="query-header">
            <van-icon name="search" class="query-icon" />
            <h3 class="query-title">查询问题处理进度</h3>
          </div> -->
          <p class="query-desc">输入您的查询码，了解问题处理进度</p>
          
          <div class="query-form">
            <van-field
              v-model="queryCode"
              placeholder="请输入查询码"
              clearable
              maxlength="20"
            >
              <template #left-icon>
                <van-icon name="search" />
              </template>
            </van-field>
            <van-button 
              type="primary" 
              class="query-btn"
              @click="queryProgress"
              :loading="querying"
            >
              查询
            </van-button>
          </div>
          
          <!-- 忘记查询码链接 -->
          <div class="forgot-query-code">
            <van-button 
              type="default" 
              size="small" 
              plain
              @click="goToForgotQueryCode"
              class="forgot-btn"
            >
              忘记查询码？
            </van-button>
          </div>
        </div>
      </div>

      <!-- 使用说明 -->
      <!-- <div class="help-section">
        <van-cell-group>
          <van-cell 
            title="使用说明" 
            icon="info-o"
            is-link
            @click="showHelp"
          />
          <van-cell 
            title="常见问题" 
            icon="question-o"
            is-link
            @click="showFAQ"
          />
        </van-cell-group>
      </div> -->
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
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showDialog } from 'vant'

export default {
  name: 'AppealPage',
  setup() {
    const router = useRouter()
    const activeTab = ref(2) // 我有诉求
    const queryCode = ref('')
    const querying = ref(false)

    // 跳转到提交问题页面
    const navigateToSubmit = (type) => {
      router.push({
        path: '/submit-issue',
        query: { type }
      })
    }

    // 查询进度
    const queryProgress = async () => {
      if (!queryCode.value.trim()) {
        showToast('请输入查询码')
        return
      }

      querying.value = true
      
      // 模拟查询请求
      setTimeout(() => {
        querying.value = false
        
        // 模拟根据查询码查找对应的问题ID
        // 在实际应用中，这里应该调用API根据查询码获取问题详情
        const mockIssueId = queryCode.value.replace(/\D/g, '') || '1' // 提取数字作为ID，如果没有数字则默认为1
        
        // 跳转到问题详情页面
        router.push({
          name: 'IssueDetail',
          params: { id: mockIssueId },
          query: { 
            queryCode: queryCode.value,
            source: 'appeal'
          }
        })
      }, 1000)
    }

    // 显示帮助信息
    const showHelp = () => {
      showDialog({
        title: '使用说明',
        message: '1. 选择对应的诉求类型\n2. 填写详细信息\n3. 提交后获得查询码\n4. 可随时查询处理进度',
        confirmButtonText: '我知道了'
      })
    }

    // 显示常见问题
    const showFAQ = () => {
      showDialog({
        title: '常见问题',
        message: 'Q: 多久能得到回复？\nA: 一般3-5个工作日\n\nQ: 查询码在哪里？\nA: 提交成功后会显示',
        confirmButtonText: '我知道了'
      })
    }

    // 跳转到忘记查询码页面
    const goToForgotQueryCode = () => {
      router.push('/forgot-query-code')
    }

    // 标签栏切换
    const onTabChange = (index) => {
      // 标签栏切换逻辑已通过路由处理
    }

    return {
      activeTab,
      queryCode,
      querying,
      navigateToSubmit,
      queryProgress,
      goToForgotQueryCode,
      showHelp,
      showFAQ,
      onTabChange
    }
  }
}
</script>

<style scoped>
.appeal-page {
  padding-bottom: 50px;
  background: #f7f8fa;
  min-height: 100vh;
}

.page-content {
  padding: 16px;
  /* margin-top: 30px; */
}

/* 功能入口区域 */
.function-section {
  margin-bottom: 24px;
}

.section-title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin: 0 0 16px 0;
  text-align: center;
}

.function-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.function-item {
  background: white;
  border-radius: 12px;
  padding: 20px 16px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.function-item:active {
  transform: scale(0.95);
  background-color: #f7f8fa;
}

.function-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 12px;
  font-size: 24px;
  color: white;
}

.function-icon.complaint {
  background: linear-gradient(135deg, #ff6b6b, #ee5a52);
}

.function-icon.suggestion {
  background: linear-gradient(135deg, #4ecdc4, #44a08d);
}

.function-icon.consultation {
  background: linear-gradient(135deg, #45b7d1, #96c93d);
}

.function-icon.report {
  background: linear-gradient(135deg, #f093fb, #f5576c);
}

.function-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin: 0 0 4px 0;
}

.function-desc {
  font-size: 12px;
  color: #666;
  margin: 0;
  line-height: 1.4;
}

/* 查询功能区域 */
.query-section {
  margin-bottom: 24px;
}

.query-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 2px solid #1989fa;
}

.query-header {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.query-icon {
  font-size: 20px;
  color: #1989fa;
  margin-right: 8px;
}

.query-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin: 0;
}

.query-desc {
  font-size: 14px;
  color: #666;
  margin: 0 0 16px 0;
  line-height: 1.4;
}

.query-form {
  display: flex;
  gap: 12px;
  align-items: flex-end;
}

.query-form :deep(.van-field) {
  flex: 1;
  background: #f7f8fa;
  border-radius: 8px;
}

.query-btn {
  height: 44px;
  padding: 0 20px;
  border-radius: 8px;
  flex-shrink: 0;
}

.forgot-query-code {
  /* text-align: center; */
  /* margin-top: 12px; */
}

.forgot-btn {
  color: #1989fa;
  font-size: 12px;
  border: none;
  background: transparent;
}

/* 帮助区域 */
.help-section {
  margin-bottom: 16px;
}

.help-section :deep(.van-cell-group) {
  border-radius: 12px;
  overflow: hidden;
}

/* 响应式设计 */
@media (max-width: 375px) {
  .page-content {
    padding: 12px;
  }
  
  .function-grid {
    gap: 12px;
  }
  
  .function-item {
    padding: 16px 12px;
  }
  
  .function-icon {
    width: 40px;
    height: 40px;
    font-size: 20px;
  }
  
  .function-title {
    font-size: 14px;
  }
  
  .function-desc {
    font-size: 11px;
  }
  
  .query-card {
    padding: 16px;
  }
}

/* 深色模式适配 */
@media (prefers-color-scheme: dark) {
  .appeal-page {
    background: #1a1a1a;
  }
  
  .function-item,
  .query-card {
    background: #2a2a2a;
    border-color: #333;
  }
  
  .section-title,
  .function-title,
  .query-title {
    color: #fff;
  }
  
  .function-desc,
  .query-desc {
    color: #ccc;
  }
}
</style>