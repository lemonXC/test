/**
 * 角色管理服务 - 定义不同角色的权限和功能模块
 */

// 角色类型枚举
export const ROLE_TYPES = {
  DEPARTMENT_OPERATOR: 'department_operator', // 部门操作员
  POLITICAL_OPERATOR: 'political_operator',   // 问政操作员
  GRID_WORKER: 'grid_worker',                 // 网格员
  EXPERT: 'expert',                           // 专家
  ORDINARY_USER: 'ordinary_user'              // 普通用户
}

// 角色配置
export const ROLE_CONFIG = {
  [ROLE_TYPES.POLITICAL_OPERATOR]: {
    name: '问政操作员',
    level: '操作员',
    avatar: 'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg',
    description: '负责问政诉求的受理、分派与督办',
    statsConfig: {
      title: '诉求',
      items: [
        { icon: 'todo-list-o', text: '待审核', count: 18, badge: 18, type: 'pending_review', route: '/appeal-processing' },
        { icon: 'clock-o', text: '待分拨', count: 7, badge: 70, type: 'pending_dispatch', route: '/appeal-processing' },
        { icon: 'completed', text: '答复待审核', count: 12, badge: 120, type: 'reply_pending_review', route: '/appeal-processing' }
      ]
    },
    menuItems: [
      { title: '诉求处理', icon: 'orders-o', route: '/appeal-processing', description: '查看和管理部门诉求' },
      { title: '个人中心', icon: 'contact', route: '/user-info', description: '查看和编辑个人资料' }
    ],
    otherItems: [
      { title: '账号安全', icon: 'shield-o', route: '/account/security' },
      { title: '我的积分', icon: 'gold-coin-o', route: '/my-points' },
      { title: '关于我们', icon: 'info-o', route: '/about' }
    ]
  },
  [ROLE_TYPES.DEPARTMENT_OPERATOR]: {
    name: '部门操作员',
    level: '操作员',
    avatar: 'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg',
    description: '负责处理和管理部门相关问题',
    statsConfig: {
      title: '诉求',
      items: [
        { icon: 'todo-list-o', text: '全部诉求', count: 156, badge: 0, type: 'all_issues' },
        { icon: 'clock-o', text: '待回复', count: 23, badge: 230, type: 'pending_issues' },
        { icon: 'completed', text: '待督办', count: 133, badge: 0, type: 'completed_issues' }
      ]
    },
    menuItems: [
      { title: '诉求处理', icon: 'orders-o', route: '/issue-management', description: '查看和管理部门诉求' },
      { title: '个人中心', icon: 'contact', route: '/user-info', description: '查看和编辑个人资料' }
    ],
    otherItems: [
      { title: '账号安全', icon: 'shield-o', route: '/account/security' },
      { title: '我的积分', icon: 'gold-coin-o', route: '/my-points' },
      { title: '关于我们', icon: 'info-o', route: '/about' }
    ]
  },

  [ROLE_TYPES.GRID_WORKER]: {
    name: '网格员',
    level: '网格员',
    avatar: 'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg',
    description: '负责网格内的信息收集和任务执行',
    statsConfig: {
      title: '我的任务',
      items: [
        { icon: 'todo-list-o', text: '全部任务', count: 89, badge: 0, type: 'all_tasks', route: '/task-management?tab=my' },
        { icon: 'clock-o', text: '待反馈', count: 12, badge: 12, type: 'pending_tasks', route: '/task-management?tab=feedback' },
        { icon: 'gift-o', text: '可领取', count: 5, badge: 5, type: 'available_tasks', route: '/task-management?tab=available' }
      ]
    },
    menuItems: [
      { title: '信息上报', icon: 'edit', route: '/user-issue-management?source=submit_issue', description: '上报重要信息和线索' },
      { title: '通知公告', icon: 'bell', route: '/notice-list', description: '查看最新的政府通知公告' },
      { title: '任务管理', icon: 'todo-list-o', route: '/task-management', description: '管理和跟踪相关任务' },
      { title: '个人中心', icon: 'contact', route: '/user-info', description: '查看和编辑个人资料' }
    ],
    otherItems: [
      { title: '账号安全', icon: 'shield-o', route: '/account/security' },
      { title: '我的积分', icon: 'gold-coin-o', route: '/my-points' },
      { title: '关于我们', icon: 'info-o', route: '/about' }
    ]
  },

  [ROLE_TYPES.EXPERT]: {
    name: '专家',
    level: '专家顾问',
    avatar: 'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg',
    description: '提供专业咨询和解答服务',
    statsConfig: null, // 专家不显示数据统计
    menuItems: [
      { title: '在线解答', icon: 'chat-o', route: '/online-answer', description: '获取在线咨询和解答服务' },
      { title: '个人中心', icon: 'contact', route: '/user-info', description: '查看和编辑个人资料' }
    ],
    otherItems: [
      { title: '账号安全', icon: 'shield-o', route: '/account/security' },
      { title: '关于我们', icon: 'info-o', route: '/about' }
    ]
  },

  [ROLE_TYPES.ORDINARY_USER]: {
    name: '普通用户',
    level: 'VIP会员',
    avatar: 'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg',
    description: '可以提交问题和查看处理进度',
    statsConfig: {
      title: '我的诉求',
      items: [
        { icon: 'todo-list-o', text: '全部诉求', count: 8, badge: 0, type: 'all_issues' },
        { icon: 'clock-o', text: '待处理', count: 2, badge: 2, type: 'pending_issues' },
        { icon: 'gift-o', text: '待评价', count: 1, badge: 1, type: 'need_evaluate' }
      ]
    },
    menuItems: [
      { title: '我的诉求', icon: 'question-o', route: '/user-issue-management?source=my_issues', description: '查看和管理我提交的问题' },
      { title: '个人中心', icon: 'contact', route: '/user-info', description: '查看和编辑个人资料' }
    ],
    otherItems: [
      { title: '账号安全', icon: 'shield-o', route: '/account/security' },
      { title: '关于我们', icon: 'info-o', route: '/about' }
    ]
  }
}

// 角色服务类
class RoleService {
  /**
   * 根据角色类型获取角色配置
   * @param {string} roleType 角色类型
   * @returns {object} 角色配置
   */
  getRoleConfig(roleType) {
    return ROLE_CONFIG[roleType] || ROLE_CONFIG[ROLE_TYPES.ORDINARY_USER]
  }

  /**
   * 获取角色的用户信息配置
   * @param {string} roleType 角色类型
   * @param {object} userData 用户数据
   * @returns {object} 用户信息配置
   */
  getUserInfoConfig(roleType, userData = {}) {
    const config = this.getRoleConfig(roleType)
    return {
      name: userData.username || '未知用户',
      level: config.level,
      avatar: userData.avatar || config.avatar,
      phone: userData.phone || '',
      email: userData.email || '',
      description: config.description
    }
  }

  /**
   * 获取角色的统计数据配置
   * @param {string} roleType 角色类型
   * @returns {object|null} 统计数据配置
   */
  getStatsConfig(roleType) {
    const config = this.getRoleConfig(roleType)
    return config.statsConfig
  }

  /**
   * 获取角色的菜单项配置
   * @param {string} roleType 角色类型
   * @returns {array} 菜单项配置
   */
  getMenuItems(roleType) {
    const config = this.getRoleConfig(roleType)
    return config.menuItems || []
  }

  /**
   * 获取角色的其他功能项配置
   * @param {string} roleType 角色类型
   * @returns {array} 其他功能项配置
   */
  getOtherItems(roleType) {
    const config = this.getRoleConfig(roleType)
    return config.otherItems || []
  }

  /**
   * 检查角色是否有特定权限
   * @param {string} roleType 角色类型
   * @param {string} permission 权限名称
   * @returns {boolean} 是否有权限
   */
  hasPermission(roleType, permission) {
    const config = this.getRoleConfig(roleType)
    const allItems = [...config.menuItems, ...config.otherItems]
    return allItems.some(item => item.route === permission || item.title === permission)
  }

  /**
   * 获取所有角色类型
   * @returns {array} 角色类型列表
   */
  getAllRoleTypes() {
    return Object.values(ROLE_TYPES)
  }

  /**
   * 获取角色显示名称
   * @param {string} roleType 角色类型
   * @returns {string} 角色显示名称
   */
  getRoleName(roleType) {
    const config = this.getRoleConfig(roleType)
    return config.name
  }

  /**
   * 获取角色信息
   */
  getRoleInfo(roleType) {
    const config = this.getRoleConfig(roleType)
    if (!config) return null
    
    return {
      name: config.name,
      level: config.level,
      description: config.description,
      avatar: config.avatar
    }
  }

  /**
   * 获取角色统计数据
   * @param {string} roleType 角色类型
   * @returns {array} 统计数据项
   */
  getStatsData(roleType) {
    const config = this.getRoleConfig(roleType)
    if (!config || !config.statsConfig) return []
    
    // 为不同角色提供不同的模拟数据
    const mockData = {
      [ROLE_TYPES.POLITICAL_OPERATOR]: {
        '待审核': 18,
        '待分拨': 7,
        '答复待审核': 12
      },
      [ROLE_TYPES.DEPARTMENT_OPERATOR]: {
        '全部问题': 156,
        '待处理': 23,
        '已处理': 133
      },
      [ROLE_TYPES.GRID_WORKER]: {
        '全部任务': 89,
        '待完成': 12,
        '可领取': 5
      },
      [ROLE_TYPES.EXPERT]: {
        '待解答': 7,
        '已解答': 23,
        '好评率': 95
      },
      [ROLE_TYPES.ORDINARY_USER]: {
        '全部问题': 8,
        '待处理': 2,
        '待评价': 1
      }
    }
    
    const roleData = mockData[roleType] || {}
    
    return config.statsConfig.items.map(item => ({
      ...item,
      count: roleData[item.text] || item.count
    }))
  }

  /**
   * 根据角色类型更新统计数据
   * @param {string} roleType 角色类型
   * @param {object} statsData 统计数据
   * @returns {object} 更新后的统计配置
   */
  updateStatsData(roleType, statsData = {}) {
    const config = this.getStatsConfig(roleType)
    if (!config) return null

    const updatedItems = config.items.map(item => ({
      ...item,
      count: statsData[item.type] || item.count,
      badge: statsData[`${item.type}_badge`] || item.badge
    }))

    return {
      ...config,
      items: updatedItems
    }
  }
}

// 导出角色服务实例
export const roleService = new RoleService()

// 导出便捷函数
export const getRoleInfo = (roleType) => roleService.getRoleInfo(roleType)

export default roleService
