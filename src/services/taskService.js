// 任务状态枚举
export const TASK_STATUS = {
  UNCLAIMED: 'unclaimed',      // 未领取
  CLAIMED: 'claimed',          // 已领取待反馈
  REPORTED: 'reported'         // 已上报
}

// 任务状态文本映射
export const TASK_STATUS_TEXT = {
  [TASK_STATUS.UNCLAIMED]: '未领取',
  [TASK_STATUS.CLAIMED]: '已领取',
  [TASK_STATUS.REPORTED]: '已上报'
}

// 任务优先级枚举
export const TASK_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent'
}

// 任务优先级文本映射
export const TASK_PRIORITY_TEXT = {
  [TASK_PRIORITY.LOW]: '低',
  [TASK_PRIORITY.MEDIUM]: '中',
  [TASK_PRIORITY.HIGH]: '高',
  [TASK_PRIORITY.URGENT]: '紧急'
}

// 模拟任务数据
const mockTasks = [
  {
    id: 1,
    title: '社区环境卫生检查',
    content: '对辖区内各小区的环境卫生情况进行全面检查，重点关注垃圾分类执行情况、公共区域清洁度、绿化带维护等方面。发现问题及时记录并上报相关部门处理。',
    publishTime: '2024-01-15 09:00:00',
    priority: TASK_PRIORITY.HIGH,
    status: TASK_STATUS.UNCLAIMED,
    publisher: '街道办事处',
    reportRecord: null
  },
  {
    id: 2,
    title: '独居老人安全巡查',
    content: '定期走访辖区内独居老人，了解其生活状况和安全情况，确保老人身体健康，居住环境安全。如发现异常情况立即联系相关部门或家属。',
    publishTime: '2024-01-15 10:30:00',
    priority: TASK_PRIORITY.URGENT,
    status: TASK_STATUS.CLAIMED,
    publisher: '社区服务中心',
    reportRecord: null
  },
  {
    id: 3,
    title: '消防安全隐患排查',
    content: '对辖区内商铺、住宅楼等场所进行消防安全检查，重点检查消防通道是否畅通、消防设施是否完好、是否存在违规用电等安全隐患。',
    publishTime: '2024-01-14 14:20:00',
    priority: TASK_PRIORITY.HIGH,
    status: TASK_STATUS.REPORTED,
    publisher: '消防大队',
    reportRecord: {
      id: 101,
      title: '发现多处消防通道被占用问题',
      reportTime: '2024-01-15 16:30:00'
    }
  },
  {
    id: 4,
    title: '流动摊贩管理',
    content: '加强对辖区内流动摊贩的管理，引导摊贩到指定区域经营，维护市容市貌。对违规摆摊行为进行劝导和记录。',
    publishTime: '2024-01-14 08:15:00',
    priority: TASK_PRIORITY.MEDIUM,
    status: TASK_STATUS.UNCLAIMED,
    publisher: '城管执法局',
    reportRecord: null
  },
  {
    id: 5,
    title: '社区矛盾纠纷调解',
    content: '协助处理社区内邻里纠纷、物业纠纷等矛盾问题，通过调解化解矛盾，维护社区和谐稳定。',
    publishTime: '2024-01-13 16:45:00',
    priority: TASK_PRIORITY.MEDIUM,
    status: TASK_STATUS.CLAIMED,
    publisher: '司法所',
    reportRecord: null
  },
  {
    id: 6,
    title: '违章建筑巡查',
    content: '定期巡查辖区内是否存在违章建筑、私搭乱建等违法建设行为，发现问题及时拍照记录并上报相关部门处理。',
    publishTime: '2024-01-13 11:20:00',
    priority: TASK_PRIORITY.HIGH,
    status: TASK_STATUS.REPORTED,
    publisher: '规划局',
    reportRecord: {
      id: 102,
      title: '发现小区内多处违章搭建',
      reportTime: '2024-01-14 09:15:00'
    }
  },
  {
    id: 7,
    title: '疫情防控宣传',
    content: '在社区内开展疫情防控知识宣传，提醒居民做好个人防护，配合相关防控措施。',
    publishTime: '2024-01-12 09:30:00',
    priority: TASK_PRIORITY.LOW,
    status: TASK_STATUS.UNCLAIMED,
    publisher: '卫健委',
    reportRecord: null
  },
  {
    id: 8,
    title: '道路交通安全检查',
    content: '检查辖区内道路交通安全设施是否完好，是否存在交通安全隐患，协助维护交通秩序。',
    publishTime: '2024-01-12 15:10:00',
    priority: TASK_PRIORITY.MEDIUM,
    status: TASK_STATUS.CLAIMED,
    publisher: '交警大队',
    reportRecord: null
  },
  {
    id: 9,
    title: '社区活动组织协助',
    content: '协助社区组织各类文体活动，丰富居民精神文化生活，增进邻里关系。',
    publishTime: '2024-01-11 10:00:00',
    priority: TASK_PRIORITY.LOW,
    status: TASK_STATUS.UNCLAIMED,
    publisher: '文化站',
    reportRecord: null
  },
  {
    id: 10,
    title: '环保督查配合',
    content: '配合环保部门开展环境保护督查工作，检查企业排污情况，监督环保措施落实。',
    publishTime: '2024-01-11 13:45:00',
    priority: TASK_PRIORITY.HIGH,
    status: TASK_STATUS.REPORTED,
    publisher: '环保局',
    reportRecord: {
      id: 103,
      title: '发现工厂废水排放异常',
      reportTime: '2024-01-12 11:20:00'
    }
  }
]

// 任务服务类
class TaskService {
  constructor() {
    this.tasks = [...mockTasks]
    this.currentPage = 1
    this.pageSize = 20
  }

  // 获取任务列表（分页）
  getTaskList(status = null, page = 1, pageSize = 20) {
    return new Promise((resolve) => {
      setTimeout(() => {
        let filteredTasks = this.tasks

        // 根据状态筛选
        if (status) {
          if (status === 'my') {
            // 我的任务：已领取的任务
            filteredTasks = this.tasks.filter(task => 
              task.status === TASK_STATUS.CLAIMED || task.status === TASK_STATUS.REPORTED
            )
          } else if (status === 'feedback') {
            // 待反馈：已领取但未上报的任务
            filteredTasks = this.tasks.filter(task => task.status === TASK_STATUS.CLAIMED)
          } else if (status === 'available') {
            // 可领取：未领取的任务
            filteredTasks = this.tasks.filter(task => task.status === TASK_STATUS.UNCLAIMED)
          }
        }

        // 分页处理
        const startIndex = (page - 1) * pageSize
        const endIndex = startIndex + pageSize
        const paginatedTasks = filteredTasks.slice(startIndex, endIndex)

        resolve({
          data: paginatedTasks,
          total: filteredTasks.length,
          page,
          pageSize,
          hasMore: endIndex < filteredTasks.length
        })
      }, 300) // 模拟网络延迟
    })
  }

  // 获取任务详情
  getTaskDetail(taskId) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const task = this.tasks.find(t => t.id === parseInt(taskId))
        if (task) {
          resolve(task)
        } else {
          reject(new Error('任务不存在'))
        }
      }, 200)
    })
  }

  // 领取任务
  claimTask(taskId) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const task = this.tasks.find(t => t.id === parseInt(taskId))
        if (task && task.status === TASK_STATUS.UNCLAIMED) {
          task.status = TASK_STATUS.CLAIMED
          resolve({ success: true, message: '任务领取成功' })
        } else {
          reject(new Error('任务领取失败'))
        }
      }, 500)
    })
  }

  // 批量领取任务
  claimAllTasks() {
    return new Promise((resolve) => {
      setTimeout(() => {
        const unclaimedTasks = this.tasks.filter(task => task.status === TASK_STATUS.UNCLAIMED)
        unclaimedTasks.forEach(task => {
          task.status = TASK_STATUS.CLAIMED
        })
        resolve({ 
          success: true, 
          message: `成功领取${unclaimedTasks.length}个任务`,
          count: unclaimedTasks.length
        })
      }, 800)
    })
  }

  // 上报任务（更新任务状态）
  reportTask(taskId, reportData) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const task = this.tasks.find(t => t.id === parseInt(taskId))
        if (task && task.status === TASK_STATUS.CLAIMED) {
          task.status = TASK_STATUS.REPORTED
          task.reportRecord = {
            id: Date.now(),
            title: reportData.title || '问题上报记录',
            reportTime: new Date().toLocaleString('zh-CN')
          }
          resolve({ success: true, message: '任务上报成功' })
        } else {
          reject(new Error('任务上报失败'))
        }
      }, 500)
    })
  }

  // 获取任务统计信息
  getTaskStats() {
    return new Promise((resolve) => {
      setTimeout(() => {
        const myTasks = this.tasks.filter(task => 
          task.status === TASK_STATUS.CLAIMED || task.status === TASK_STATUS.REPORTED
        )
        const feedbackTasks = this.tasks.filter(task => task.status === TASK_STATUS.CLAIMED)
        const availableTasks = this.tasks.filter(task => task.status === TASK_STATUS.UNCLAIMED)

        resolve({
          myTasksCount: myTasks.length,
          feedbackTasksCount: feedbackTasks.length,
          availableTasksCount: availableTasks.length,
          totalTasks: this.tasks.length
        })
      }, 100)
    })
  }
}

// 导出任务服务实例
export const taskService = new TaskService()
export default taskService