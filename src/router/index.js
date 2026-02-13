import { createRouter, createWebHistory } from 'vue-router'
import { showToast } from 'vant'
import Home from '../views/home/Home.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(to, from, savedPosition) {
    // 如果有保存的位置（比如浏览器前进后退），则恢复到保存的位置
    if (savedPosition) {
      return savedPosition
    }
    // 否则滚动到页面顶部
    return { top: 0, behavior: 'smooth' }
  },
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('../views/mine/Profile.vue')
    },
    {
      path: '/news',
      name: 'news',
      component: () => import('../views/News.vue')
    },
    {
      path: '/article/:id',
      name: 'article-detail',
      component: () => import('../views/home/ArticleDetail.vue'),
      meta: {
        title: '文章详情'
      }
    },
    {
    path: '/appeal',
    name: 'Appeal',
    component: () => import('../views/Appeal.vue')
  },
  {
    path: '/policy',
    name: 'Policy',
    component: () => import('../views/Policy.vue')
  },
    {
      path: '/submit-issue',
      name: 'submit-issue',
      component: () => import('../views/issue/SubmitIssue.vue')
    },
    {
      path: '/message-guidelines',
      name: 'message-guidelines',
      component: () => import('../views/issue/MessageGuidelines.vue'),
      meta: {
        title: '留言说明',
        hideTabBar: true
      }
    },
    {
      path: '/test-guidelines',
      name: 'test-guidelines',
      component: () => import('../views/test/TestGuidelines.vue'),
      meta: {
        title: '测试留言说明流程',
        hideTabBar: true
      }
    },
    {
      path: '/debug-guidelines',
      name: 'debug-guidelines',
      component: () => import('../views/test/DebugGuidelines.vue'),
      meta: {
        title: '调试留言说明流程',
        hideTabBar: true
      }
    },
    {
      path: '/flow-test',
      name: 'flow-test',
      component: () => import('../views/test/FlowTest.vue'),
      meta: {
        title: '流程测试',
        hideTabBar: true
      }
    },
    {
      path: '/submit-result',
      name: 'submit-result',
      component: () => import('../views/issue/SubmitResult.vue'),
      meta: {
        title: '提交结果',
        hideTabBar: true
      }
    },
    {
      path: '/certification',
      name: 'certification',
      component: () => import('../views/auth/Certification.vue')
    },
    {
      path: '/issue-management',
      name: 'IssueManagement',
      component: () => import('../views/issue/IssueManagement.vue')
    },
    {
      path: '/appeal-processing',
      name: 'AppealProcessing',
      component: () => import('../views/issue/AppealProcessing.vue'),
      meta: {
        title: '诉求处理',
        hideTabBar: true
      }
    },
    {
      path: '/issue-detail/:id',
      name: 'IssueDetail',
      component: () => import('../views/issue/IssueDetail.vue')
    },
    {
      path: '/online-answer',
      name: 'OnlineAnswer',
      component: () => import('../views/mine/OnlineAnswer.vue')
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/auth/Login.vue'),
      meta: {
        title: '用户登录',
        hideTabBar: true
      }
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/auth/Register.vue'),
      meta: {
        title: '用户注册',
        hideTabBar: true
      }
    },
    {
      path: '/forgot-password',
      name: 'forgot-password',
      component: () => import('../views/auth/ForgotPassword.vue'),
      meta: {
        title: '找回密码',
        hideTabBar: true
      }
    },
    {
      path: '/forgot-query-code',
      name: 'forgot-query-code',
      component: () => import('../views/ForgotQueryCode.vue'),
      meta: {
        title: '找回查询码',
        hideTabBar: true
      }
    },
    {
      path: '/query-code-list',
      name: 'query-code-list',
      component: () => import('../views/QueryCodeList.vue'),
      meta: {
        title: '我的查询码',
        hideTabBar: true
      }
    },
    {
      path: '/notice-list',
      name: 'NoticeList',
      component: () => import('../views/mine/NoticeList.vue'),
      meta: {
        title: '公告通知',
        hideTabBar: true
      }
    },
    {
      path: '/notice-detail/:id',
      name: 'NoticeDetail',
      component: () => import('../views/mine/NoticeDetail.vue'),
      meta: {
        title: '公告详情',
        hideTabBar: true
      }
    },
    {
      path: '/user-issue-management',
      name: 'UserIssueManagement',
      component: () => import('../views/issue/UserIssueManagement.vue'),
      meta: {
        title: '我的诉求',
        hideTabBar: true
      }
    },
    {
      path: '/user-issue-detail/:id',
      name: 'UserIssueDetail',
      component: () => import('../views/issue/UserIssueDetail.vue'),
      meta: {
        title: '问题详情',
        hideTabBar: true
      }
    },
    {
      path: '/user-info',
      name: 'user-info',
      component: () => import('../views/mine/UserInfo.vue'),
      meta: {
        title: '个人信息',
        hideTabBar: true
      }
    },
    {
      path: '/edit-profile',
      name: 'edit-profile',
      component: () => import('../views/mine/EditProfile.vue'),
      meta: {
        title: '编辑资料',
        hideTabBar: true
      }
    },
    {
      path: '/change-password',
      name: 'change-password',
      component: () => import('../views/mine/ChangePassword.vue'),
      meta: {
        title: '修改密码',
        hideTabBar: true
      }
    },
    {
      path: '/account/security',
      name: 'account-security',
      component: () => import('../views/account/Security.vue'),
      meta: {
        title: '账号安全',
        hideTabBar: true,
        requiresAuth: true,
        allowedRoles: ['ordinary_user', 'grid_worker', 'department_operator', 'expert', 'political_operator', 'admin']
      }
    },
    {
      path: '/account/change-phone',
      name: 'account-change-phone',
      component: () => import('../views/account/ChangePhone.vue'),
      meta: {
        title: '修改手机号',
        hideTabBar: true,
        requiresAuth: true,
        allowedRoles: ['ordinary_user', 'grid_worker', 'department_operator', 'expert', 'political_operator', 'admin']
      }
    },
    {
      path: '/my-points',
      name: 'my-points',
      component: () => import('../views/mine/MyPoints.vue'),
      meta: {
        title: '我的积分',
        hideTabBar: true,
        requiresAuth: true,
        allowedRoles: ['grid_worker', 'department_operator', 'expert']
      }
    },
    {
      path: '/task-management',
      name: 'TaskManagement',
      component: () => import('../views/task/TaskManagement.vue'),
      meta: { 
        title: '任务管理',
        requiresAuth: true,
        allowedRoles: ['grid_worker', 'department_operator', 'expert', 'admin']
      }
    },
    {
      path: '/task-detail/:id',
      name: 'TaskDetail',
      component: () => import('../views/task/TaskDetail.vue'),
      meta: { 
        title: '任务详情',
        requiresAuth: true,
        allowedRoles: ['grid_worker', 'department_operator', 'expert', 'admin']
      }
    }
  ]
})

// 检查用户是否已同意留言说明的函数（每次访问都需要重新同意）
const hasAgreedToGuidelines = () => {
  // 检查是否是从留言说明页面跳转过来的
  const agreed = sessionStorage.getItem('message_guidelines_agreed_current_session')
  const result = agreed === 'true'
  
  // 添加调试信息
  console.log('[路由守卫] 检查留言说明同意状态:', {
    agreed,
    result,
    timestamp: new Date().toLocaleTimeString()
  })
  
  return result
}

// 路由守卫
router.beforeEach((to, from, next) => {
  // 检查是否需要先阅读留言说明
  if (to.path === '/submit-issue') {
    console.log('[路由守卫] 访问提交问题页面，来源:', from.path)
    
    // 如果不是从留言说明页面直接跳转过来的，清除之前的同意状态
    if (from.path !== '/message-guidelines') {
      console.log('[路由守卫] 不是从留言说明页面跳转，清除之前的同意状态')
      sessionStorage.removeItem('message_guidelines_agreed_current_session')
      sessionStorage.removeItem('message_guidelines_agreed_time')
    }
    
    if (!hasAgreedToGuidelines()) {
      console.log('[路由守卫] 未同意留言说明，重定向到留言说明页面')
      // 重定向到留言说明页面，并保存原始目标路径
      next({
        path: '/message-guidelines',
        query: { redirect: to.fullPath }
      })
      return
    } else {
      console.log('[路由守卫] 已同意留言说明，允许访问')
    }
  }
  
  // 检查是否需要登录
  if (to.meta.requiresAuth) {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'
    
    if (!isLoggedIn) {
      showToast('请先登录')
      next('/login')
      return
    }
    
    // 检查角色权限
    const userRole = localStorage.getItem('selectedUserRole') || 'ordinary_user'
    
    // 支持单个角色权限验证（向后兼容）
    if (to.meta.requiredRole) {
      if (userRole !== to.meta.requiredRole) {
        showToast('您没有权限访问此页面')
        next('/profile')
        return
      }
    }
    
    // 支持多个角色权限验证
    if (to.meta.allowedRoles) {
      if (!to.meta.allowedRoles.includes(userRole)) {
        showToast('您没有权限访问此页面')
        next('/profile')
        return
      }
    }
  }
  
  next()
})

export default router
