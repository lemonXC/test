<template>
  <div class="profile">
    <!-- <van-nav-bar title="个人中心" fixed /> -->

    <div class="profile-content">
      <!-- 用户信息 -->
      <!-- <div class="avatar-section">
        <div class="avatar-container" @click="showAvatarPreview">
          <van-image round width="100" height="100" :src="userInfo.avatar || defaultAvatar" fit="cover"
            class="user-avatar" />
          <div class="avatar-overlay">
            <van-icon name="photograph" size="24" color="#fff" />
          </div>
        </div>
        <span class="username" v-if="isLoggedIn">{{ userInfo.name }}</span>
        <van-button type="primary" size="small" class="change-avatar-btn" @click="$router.push('/edit-profile')">
          修改资料
        </van-button>
      </div> -->

      <div class="user-info">
        <van-cell-group>
          <van-cell @click="onUserInfoClick" is-link>
            <template #icon>
              <van-image round width="60" height="60" :src="userInfo.avatar" />
            </template>
            <template #title>
              <span class="username" v-if="isLoggedIn">{{ userInfo.name }}</span>
            </template>
            <template #label>
              <div class="user-status">
                <van-button v-if="!isLoggedIn" type="primary" size="mini" class="login-btn"
                  @click.stop="() => $router.push('/login')">
                  立即登录
                </van-button>
                <!-- 临时角色切换功能 -->
                <van-button v-if="isLoggedIn" size="mini" type="warning" class="role-switch-btn"
                  @click.stop="showRoleSelector = true">
                  切换角色测试
                </van-button>
              </div>
            </template>
            <template #right-icon>
              <van-icon name="arrow" />
            </template>
          </van-cell>
        </van-cell-group>
      </div>

      <!-- 角色选择弹窗 -->
      <van-action-sheet v-model:show="showRoleSelector" :actions="roleActions" @select="onRoleSelect" title="选择测试角色"
        cancel-text="取消" />

      <!-- 数据统计 -->
      <div v-if="statsConfig && isLoggedIn" class="stats-section">
        <div class="stats-header">
          <span class="stats-title">{{ statsTitle }}</span>
          <span class="stats-more" @click="goToAllTasks">全部 <van-icon name="arrow" /></span>
        </div>
        <van-grid :column-num="3" class="stats-grid">
          <van-grid-item v-for="item in statsItems" :key="item.text" @click="onStatsClick(item)" class="stats-item">
            <template #icon>
              <div class="stats-icon-wrapper">
                <van-icon :name="item.icon" class="stats-icon" />
                <van-badge v-if="item.badge && item.badge > 0" :content="formatBadge(item.badge)" class="stats-badge" />
              </div>
            </template>
            <template #text>
              <div class="stats-text">{{ item.text }}</div>
              <!-- <div class="stats-number">{{ item.count }}</div> -->
            </template>
          </van-grid-item>
        </van-grid>
      </div>

      <!-- 功能服务 -->
      <div v-if="governmentItems && governmentItems.length > 0 && isLoggedIn" class="service-section">
        <van-cell-group class="service-cell-group">
          <van-cell v-for="item in governmentItems" :key="item.title" :title="item.title" :icon="item.icon" is-link
            @click="onGovernmentClick(item)" class="service-cell">
          </van-cell>
        </van-cell-group>
      </div>

      <!-- 其他功能 -->
      <div v-if="otherItems && otherItems.length > 0" class="other-section">
        <van-cell-group>
          <van-cell v-for="item in otherItems" :key="item.title" :title="item.title" :icon="item.icon" is-link
            @click="onMenuClick(item)" />
        </van-cell-group>
      </div>

      <!-- 设置 -->
      <!-- <div class="setting-section">
        <van-cell-group>
          <van-cell title="设置" icon="setting-o" is-link @click="onSettingClick" />
          <van-cell 
            :title="isLoggedIn ? '退出登录' : '登录'" 
            :icon="isLoggedIn ? 'sign' : 'contact'" 
            is-link 
            @click="onLogout" 
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
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { showToast, showConfirmDialog } from 'vant'
import { useRouter } from 'vue-router'
import { authService } from '@/services/authService'
import { roleService } from '@/services/roleService'

export default {
  name: 'Profile',
  setup() {
    const activeTab = ref(4) // 我的
    const router = useRouter()
    const isLoggedIn = ref(false)
    const showRoleSelector = ref(false) // 角色选择器显示状态

    // 从localStorage读取保存的角色状态，如果没有则使用默认值
    const savedRole = localStorage.getItem('selectedUserRole')
    const userRole = ref(savedRole || 'ordinary_user')

    const userInfo = ref({
      name: '未登录',
      level: '游客',
      avatar: 'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg',
      phone: '',
      email: ''
    })

    // 保存角色状态到localStorage
    const saveRoleToStorage = (role) => {
      localStorage.setItem('selectedUserRole', role)
    }

    // 从localStorage读取角色状态
    const loadRoleFromStorage = () => {
      const savedRole = localStorage.getItem('selectedUserRole')
      if (savedRole) {
        userRole.value = savedRole
        return savedRole
      }
      return 'ordinary_user'
    }

    // 基于角色的动态配置
    // 动态统计配置（用于轮询刷新角标）
    const currentStatsConfig = ref(null)
    const statsConfig = computed(() => currentStatsConfig.value || roleService.getStatsConfig(userRole.value))

    const governmentItems = computed(() => {
      return roleService.getMenuItems(userRole.value)
    })

    const otherItems = computed(() => {
      return roleService.getOtherItems(userRole.value)
    })

    // 兼容性：为模板提供统一的数据接口
    const statsItems = computed(() => {
      const config = statsConfig.value
      return config ? config.items : []
    })

    const statsTitle = computed(() => {
      const config = statsConfig.value
      return config ? config.title : '数据统计'
    })

    // 角色选择器配置
    const roleActions = ref([
      { name: '普通用户', value: 'ordinary_user' },
      { name: '部门操作员', value: 'department_operator' },
      { name: '问政操作员', value: 'political_operator' },
      { name: '网格员', value: 'grid_worker' },
      { name: '专家', value: 'expert' }
    ])

    // 角色选择处理
    const onRoleSelect = (action) => {
      userRole.value = action.value
      showRoleSelector.value = false

      // 保存角色状态到localStorage
      saveRoleToStorage(action.value)

      // 使用角色服务获取角色信息
      const roleConfig = roleService.getRoleConfig(action.value)
      if (roleConfig) {
        userInfo.value.level = roleConfig.name
        userInfo.value.avatar = roleConfig.avatar
      }

      // 重置统计配置
      currentStatsConfig.value = roleService.getStatsConfig(action.value)

      showToast(`已切换到${action.name}角色`)
    }

    const goToAllTasks = () => {
      // showToast('跳转到我的任务-全部页面')
      // 这里可以添加路由跳转逻辑
      router.push('/task-management')

      if (userRole.value === 'department_operator' || userRole.value === 'political_operator') {
        // 部门操作员：跳转到问题管理页面 - 全部问题tab
        router.push({
          path: '/issue-management',
          query: { tab: 'all' }
        })
      } else if (userRole.value === 'ordinary_user') {
        // 普通用户：跳转到我的问题页面 - 全部问题tab
        router.push({
          path: '/user-issue-management',
          query: { tab: 'all' }
        })
      } else {
        router.push('/task-management')
      }
    }

    const onStatsClick = (item) => {
      // 如果统计项有route属性，直接跳转
      if (item.route) {
        router.push(item.route)
        return
      }

      // 根据当前用户角色和统计项目类型跳转到对应的页面和tab
      switch (item.type) {
        // 部门操作员的统计项目
        case 'all_issues':
          if (userRole.value === 'department_operator') {
            // 部门操作员：跳转到问题管理页面 - 全部问题tab
            router.push({
              path: '/issue-management',
              query: { tab: 'all' }
            })
          } else {
            // 普通用户：跳转到我的问题页面 - 全部问题tab
            router.push({
              path: '/user-issue-management',
              query: { tab: 'all' }
            })
          }
          break
        case 'pending_issues':
          if (userRole.value === 'department_operator' || userRole.value === 'political_operator') {
            // 部门操作员：跳转到问题管理页面 - 待回复tab
            router.push({
              path: '/issue-management',
              query: { tab: 'pending_reply' }
            })
          } else {
            // 普通用户：跳转到我的问题页面 - 待处理tab
            router.push({
              path: '/user-issue-management',
              query: { tab: 'pending' }
            })
          }
          break
        case 'completed_issues':
          // 部门操作员：跳转到问题管理页面 - 待督办tab
          router.push({
            path: '/issue-management',
            query: { tab: 'pending_supervise' }
          })
          break
        case 'need_evaluate':
          // 跳转到我的问题页面 - 待评价tab
          router.push({
            path: '/user-issue-management',
            query: { tab: 'evaluate' }
          })
          break
        // 网格员的统计项目
        case 'all_tasks':
          // 跳转到任务管理页面 - 我的任务tab
          router.push({
            path: '/task-management',
            query: { tab: 'my' }
          })
          break
        case 'pending_tasks':
          // 跳转到任务管理页面 - 待反馈tab
          router.push({
            path: '/task-management',
            query: { tab: 'feedback' }
          })
          break
        case 'available_tasks':
          // 跳转到任务管理页面 - 可领取tab
          router.push({
            path: '/task-management',
            query: { tab: 'available' }
          })
          break
        default:
          // 兼容旧的文本匹配方式
          switch (item.text) {
            case '全部任务':
              showToast('跳转到全部任务页面')
              break
            case '待反馈任务':
              showToast('跳转到待反馈任务页面')
              break
            case '可领取任务':
              showToast('跳转到可领取任务页面')
              break
            default:
              showToast(`查看${item.text}详情`)
          }
      }
    }

    // 角标格式化：超过99显示"99+"
    const formatBadge = (val) => {
      if (!val || val <= 0) return ''
      return val > 99 ? '99+' : String(val)
    }

    // 启动角标轮询（模拟接口刷新）
    let badgeTimer = null
    const startBadgePolling = () => {
      // 初始化一次
      currentStatsConfig.value = roleService.getStatsConfig(userRole.value)

      // 仅在问政操作员角色下轮询
      if (userRole.value !== 'political_operator') return

      // 每5秒模拟刷新一次角标数字
      badgeTimer = setInterval(() => {
        // 构造模拟刷新数据：微幅变动但控制在0-120之间
        const stats = statsConfig.value?.items || []
        const next = {}
        stats.forEach((it) => {
          const base = typeof it.badge === 'number' ? it.badge : 0
          const delta = Math.floor(Math.random() * 3) - 1 // -1,0,1微调
          let val = base + delta
          if (val < 0) val = 0
          if (val > 120) val = 120
          next[`${it.type}_badge`] = val
          next[it.type] = it.count
        })
        const updated = roleService.updateStatsData(userRole.value, next)
        currentStatsConfig.value = updated
      }, 5000)
    }

    const onMenuClick = (item) => {
      if (item.route) {
        router.push(item.route)
        return
      }
      showToast(`点击了: ${item.title}`)
    }

    const onSettingClick = () => {
      showToast('打开设置页面')
    }

    const onLogout = () => {
      if (!isLoggedIn.value) {
        router.push('/login')
        return
      }

      showConfirmDialog({
        title: '提示',
        message: '确定要退出登录吗？'
      }).then(async () => {
        const result = await authService.logout()
        if (result.success) {
          showToast('已退出登录')
          isLoggedIn.value = false
          userInfo.value = {
            name: '未登录',
            level: '游客',
            avatar: 'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg',
            phone: '',
            email: ''
          }
        } else {
          showToast(result.message)
        }
      }).catch(() => {
        // 取消退出
      })
    }

    const onCertificationClick = () => {
      router.push('/certification')
    }

    const onGovernmentClick = (item) => {
      if (item.route) {
        // 如果有路由配置，直接跳转
        router.push(item.route)
      } else {
        // 兼容旧的逻辑
        switch (item.title) {
          case '我的诉求':
            router.push('/user-issue-management?source=my_issues')
            break
          case '诉求处理':
            router.push('/issue-management')
            break
          case '在线解答':
            router.push('/online-answer')
            break
          case '通知公告':
            router.push('/notice-list')
            break
          case '信息上报':
            // showToast('跳转到信息上报页面')
            router.push('/user-issue-management?source=submit_issue')
            break
          case '任务管理':
            showToast('跳转到任务管理页面')
            break
          case '个人信息':
            // showToast('跳转到个人信息页面')
            router.push('/user-info')
            break
          case '认证中心':
            router.push('/certification')
            break
          default:
            showToast(`点击了: ${item.title}`)
        }
      }
    }

    // 检查登录状态
    const checkLoginStatus = async () => {
      // 首先从localStorage恢复角色状态
      const savedRole = loadRoleFromStorage()
      userRole.value = savedRole

      const token = localStorage.getItem('authToken')
      if (token) {
        try {
          const result = await authService.getUserInfo()
          if (result.success) {
            isLoggedIn.value = true
            const userData = result.data.user || result.data

            // 优先使用保存的角色状态，如果没有则使用服务器返回的角色
            if (!localStorage.getItem('selectedUserRole')) {
              userRole.value = userData.role || 'ordinary_user'
              saveRoleToStorage(userRole.value)
            }

            // 使用角色服务获取用户信息配置
            const roleUserInfo = roleService.getUserInfoConfig(userRole.value, userData)
            userInfo.value = roleUserInfo
          }
        } catch (error) {
          console.error('获取用户信息失败:', error)
        }
      } else {
        // 未登录状态下也要恢复角色状态，用于演示
        const roleConfig = roleService.getRoleConfig(userRole.value)
        if (roleConfig) {
          userInfo.value.level = roleConfig.name
          userInfo.value.avatar = roleConfig.avatar
        }
      }
    }

    // 用户信息点击事件
    const onUserInfoClick = () => {
      if (!isLoggedIn.value) {
        router.push('/login')
      } else {
        showToast('跳转到个人信息编辑页面')
      }
    }

    // 页面初始化
    onMounted(() => {
      checkLoginStatus()
      startBadgePolling()
    })

    // 角色变化时，重启轮询
    watch(userRole, (newRole) => {
      if (badgeTimer) {
        clearInterval(badgeTimer)
        badgeTimer = null
      }
      startBadgePolling()
    })

    onUnmounted(() => {
      if (badgeTimer) clearInterval(badgeTimer)
    })

    return {
      activeTab,
      userInfo,
      isLoggedIn,
      userRole,
      statsItems,
      statsTitle,
      statsConfig,
      governmentItems,
      otherItems,
      showRoleSelector,
      roleActions,
      goToAllTasks,
      onStatsClick,
      formatBadge,
      onMenuClick,
      onSettingClick,
      onLogout,
      onCertificationClick,
      onGovernmentClick,
      onUserInfoClick,
      onRoleSelect
    }
  }
}
</script>

<style scoped>
.profile {
  padding-bottom: 50px;
  background: #f7f8fa;
  height: 100vh;
  overflow: scroll;
}

.profile-content {
  /* margin-top: 46px; */
}

.user-info {
  margin-bottom: 10px;
  height: 180px;
}

.user-info .van-cell-group {
  height: 100%;
}

.username {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.user-status {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
  margin-left: 10px;
}

.user-level {
  font-size: 12px;
  color: #969799;
}

.certification-btn,
.login-btn,
.role-switch-btn {
  font-size: 12px;
  height: 24px;
  padding: 0 8px;
  margin-left: 4px;
}

.stats-section {
  margin-bottom: 10px;
  background: white;
  border-radius: 8px;
  overflow: hidden;
}

.stats-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 16px 8px;
  background: white;
}

.stats-title {
  font-size: 16px;
  font-weight: 600;
  color: #323233;
}

.stats-more {
  font-size: 14px;
  color: #969799;
  display: flex;
  align-items: center;
  cursor: pointer;
}

.stats-more .van-icon {
  margin-left: 4px;
  font-size: 12px;
}

.stats-count {
  font-size: 12px;
  color: #969799;
  margin-right: 4px;
}

.stats-grid {
  background: white;
}

.stats-item {
  position: relative;
}

.stats-icon-wrapper {
  position: relative;
  display: inline-block;
  margin-bottom: 8px;
}

.stats-icon {
  font-size: 24px;
  color: #1989fa;
}

.stats-badge {
  position: absolute;
  top: 6px;
  right: -10px;
  transform: scale(0.8);
}

/* 固定角标尺寸与样式（红底白字，99+尺寸不变） */
.stats-badge :deep(.van-badge) {
  background-color: #ee0a24; /* 红色 */
  color: #fff;               /* 白字 */
  height: 16px;
  line-height: 16px;
  min-width: 24px;           /* 固定最小宽度以适配"99+" */
  padding: 0 4px;
  border-radius: 8px;
  font-size: 11px;           /* 与图标比例协调 */
  box-shadow: 0 0 0 2px #fff;/* 与主界面分离更醒目但不刺眼 */
}

.stats-text {
  font-size: 12px;
  color: #646566;
  margin-bottom: 4px;
  line-height: 1.2;
}

.stats-number {
  font-size: 18px;
  font-weight: 600;
  color: #323233;
  line-height: 1;
}

.menu-section {
  margin-bottom: 10px;
}

.government-section {
  margin-bottom: 10px;
}

.section-header {
  padding: 16px 16px 8px;
  background: white;
  border-radius: 8px 8px 0 0;
}
/* 其他功能项交互反馈 */
.other-section :deep(.van-cell) {
  transition: background-color 0.2s ease;
}
.other-section :deep(.van-cell):hover {
  background-color: #f7f8fa;
}
.service-section :deep(.van-cell) {
  transition: background-color 0.2s ease;
}
.service-section :deep(.van-cell):hover {
  background-color: #f7f8fa;
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  color: #323233;
  margin: 0 0 4px 0;
}

.section-subtitle {
  font-size: 12px;
  color: #969799;
  margin: 0;
  line-height: 1.4;
}

.government-section .van-cell-group {
  border-radius: 0 0 8px 8px;
  overflow: hidden;
}

.government-section .van-cell {
  padding: 16px;
}

.government-section .van-cell__title {
  font-weight: 500;
  color: #323233;
}

.government-section .van-cell__label {
  color: #969799;
  font-size: 12px;
  margin-top: 4px;
  line-height: 1.4;
}

.government-section .van-icon {
  color: #1989fa;
  font-size: 18px;
}

.service-section {
  margin-bottom: 10px;
  background: white;
  border-radius: 8px;
  overflow: hidden;
}

.service-section .section-header {
  padding: 16px 16px 8px;
  background: white;
  border-radius: 8px 8px 0 0;
}

.service-section .section-title {
  font-size: 16px;
  font-weight: 600;
  color: #323233;
  margin: 0 0 4px 0;
}

.service-section .section-subtitle {
  font-size: 12px;
  color: #969799;
  margin: 0;
  line-height: 1.4;
}

.service-cell-group {
  border-radius: 0 0 8px 8px;
  overflow: hidden;
}

.service-cell {
  padding: 16px;
  background: white;
  border-bottom: 1px solid #f7f8fa;
}

.service-cell:last-child {
  border-bottom: none;
}

.service-cell-icon {
  color: #1989fa;
  font-size: 20px;
  margin-right: 12px;
}

.service-arrow {
  color: #c8c9cc;
  font-size: 16px;
}

.service-cell .van-cell__title {
  font-weight: 500;
  color: #323233;
  font-size: 15px;
}

.service-cell .van-cell__label {
  color: #969799;
  font-size: 12px;
  margin-top: 4px;
  line-height: 1.4;
}

.other-section {
  margin-bottom: 10px;
}

.setting-section {
  margin-bottom: 10px;
}

:deep(.van-cell__left-icon) {
  margin-right: 8px;
}
</style>