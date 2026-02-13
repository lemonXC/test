// 问题状态枚举定义
export const IssueStatus = {
  PENDING: "PENDING", // 待处理
  PROCESSING: "PROCESSING", // 处理中
  RESOLVED: "RESOLVED", // 已处理
  REVIEWED: "REVIEWED", // 已评价
};

// 状态显示文本映射
export const StatusText = {
  [IssueStatus.PENDING]: "待处理",
  [IssueStatus.PROCESSING]: "处理中",
  [IssueStatus.RESOLVED]: "待评价",
  [IssueStatus.REVIEWED]: "已完成",
};

// 状态颜色映射
export const StatusColor = {
  [IssueStatus.PENDING]: "#ff976a", // 黄色
  [IssueStatus.PROCESSING]: "#1989fa", // 蓝色
  [IssueStatus.RESOLVED]: "#07c160", // 绿色
  [IssueStatus.REVIEWED]: "#969799", // 灰色
};

// 模拟问题数据
export const mockIssueData = [
  {
    id: 1,
    title: "小区停车位不足问题",
    content:
      "我们小区停车位严重不足，经常找不到停车位，希望能够增加停车位或者规范停车秩序。我们小区停车位严重不足，经常找不到停车位，希望能够增加停车位或者规范停车秩序。",
    status: IssueStatus.PENDING,
    category: "物业管理",
    created_at: "2024-01-15 09:30:00",
    created_by: "user001",
    updated_at: "2024-01-15 09:30:00",
    department: "物业管理处",
    processing_started_at: null,
    processing_started_by: null,
    resolved_at: null,
    resolved_by: null,
    reviewed_at: null,
    reminder_count: 0,
    attachments: [
      {
        id: 1,
        name: "停车位现状.jpg",
        type: "image",
        url: "/public/book.png",
        size: "2.5MB",
        created_at: "2024-01-15 09:30:00",
      },
      {
        id: 2,
        name: "小区平面图.pdf",
        type: "document",
        url: "/documents/layout.pdf",
        size: "1.2MB",
        created_at: "2024-01-15 09:30:00",
      },
      {
        id: 2,
        name: "小区.mp4",
        type: "document",
        url: "/documents/layout.pdf",
        size: "1.2MB",
        created_at: "2024-01-15 09:30:00",
      },
    ],
  },
  {
    id: 2,
    title: "噪音扰民问题",
    content: "楼上邻居经常在深夜制造噪音，影响正常休息，多次沟通无效。",
    status: IssueStatus.PROCESSING,
    category: "邻里纠纷",
    created_at: "2024-01-14 20:15:00",
    created_by: "user002",
    updated_at: "2024-01-15 08:00:00",
    department: "社区调解委员会",
    processing_started_at: "2024-01-15 08:00:00",
    processing_started_by: "admin001",
    resolved_at: null,
    resolved_by: null,
    reviewed_at: null,
    reminder_count: 1,
    attachments: [],
  },
  {
    id: 3,
    title: "路灯损坏需要维修",
    content: "小区内多处路灯损坏，夜间照明不足，存在安全隐患。",
    status: IssueStatus.RESOLVED,
    category: "基础设施",
    created_at: "2024-01-10 15:20:00",
    created_by: "user003",
    updated_at: "2024-01-12 14:00:00",
    department: "市政维护部",
    processing_started_at: "2024-01-10 16:00:00",
    processing_started_by: "admin002",
    resolved_at: "2024-01-12 14:00:00",
    resolved_by: "admin002",
    reviewed_at: null,
    reminder_count: 0,
    attachments: [
      {
        id: 1,
        name: "损坏路灯照片.jpg",
        type: "image",
        url: "/public/book.png",
        size: "1.8MB",
        created_at: "2024-01-10 15:20:00",
      },
    ],
  },
  {
    id: 4,
    title: "垃圾分类设施不完善",
    content: "小区垃圾分类设施不够完善，分类标识不清楚，建议改进。",
    status: IssueStatus.REVIEWED,
    category: "环境卫生",
    created_at: "2024-01-08 11:00:00",
    created_by: "user004",
    updated_at: "2024-01-10 09:00:00",
    department: "环卫管理处",
    processing_started_at: "2024-01-08 14:00:00",
    processing_started_by: "admin003",
    resolved_at: "2024-01-09 16:30:00",
    resolved_by: "admin003",
    reviewed_at: "2024-01-10 09:00:00",
    reminder_count: 0,
    attachments: [],
  },
];

// 回复数据
export const mockReplies = [
  {
    id: 1,
    issue_id: 1,
    content:
      "您好，我们已经收到您的反馈，正在协调相关部门进行处理。您好，我们已经收到您的反馈，正在协调相关部门进行处理。您好，我们已经收到您的反馈，正在协调相关部门进行处理。您好，我们已经收到您的反馈，正在协调相关部门进行处理。您好，我们已经收到您的反馈，正在协调相关部门进行处理。您好，我们已经收到您的反馈，正在协调相关部门进行处理。您好，我们已经收到您的反馈，正在协调相关部门进行处理。您好，我们已经收到您的反馈，正在协调相关部门进行处理。您好，我们已经收到您的反馈，正在协调相关部门进行处理。您好，我们已经收到您的反馈，正在协调相关部门进行处理。",
    created_at: "2024-01-15 14:30:00",
    created_by: "admin001",
    creator_name: "物业管理处",
    attachments: [
      {
        id: 1,
        name: "停车位现状.jpg",
        type: "image",
        url: "/public/book.png",
        size: "2.5MB",
        created_at: "2024-01-15 09:30:00",
      },
      {
        id: 2,
        name: "小区平面图.pdf",
        type: "document",
        url: "/documents/layout.pdf",
        size: "1.2MB",
        created_at: "2024-01-15 09:30:00",
      },
      {
        id: 2,
        name: "小区.mp4",
        type: "document",
        url: "/documents/layout.pdf",
        size: "1.2MB",
        created_at: "2024-01-15 09:30:00",
      },
    ],
  },
  {
    id: 2,
    issue_id: 1,
    content: "我们已经联系了楼上住户，将安排调解员进行现场调解。",
    created_at: "2024-01-15 10:00:00",
    created_by: "admin001",
    creator_name: "社区调解委员会",
    attachments: [],
  },
  {
    id: 3,
    issue_id: 2,
    content: "已安排维修人员前往现场查看，预计2个工作日内完成维修。",
    created_at: "2024-01-10 17:30:00",
    created_by: "admin002",
    creator_name: "市政维护部",
    attachments: [],
  },
  {
    id: 4,
    issue_id: 2,
    content: "已安排维修人员前往现场查看，预计2个工作日内完成维修。",
    created_at: "2024-01-10 17:30:00",
    created_by: "admin002",
    creator_name: "市政维护部",
    attachments: [],
  },
  {
    id: 5,
    issue_id: 3,
    content: "已安排维修人员前往现场查看，预计2个工作日内完成维修。",
    created_at: "2024-01-10 17:30:00",
    created_by: "admin002",
    creator_name: "市政维护部",
    attachments: [],
  },
  {
    id: 6,
    issue_id: 3,
    content: "路灯维修已完成，请您查看是否满意。",
    created_at: "2024-01-12 14:00:00",
    created_by: "admin002",
    creator_name: "市政维护部",
    attachments: [
      {
        id: 1,
        name: "维修完成照片.jpg",
        type: "image",
        url: "/public/book.png",
        size: "2.1MB",
        created_at: "2024-01-12 14:00:00",
      },
    ],
  },
  {
    id: 7,
    issue_id: 4,
    content: "已更换新的垃圾分类标识，并增加了分类指导牌。",
    created_at: "2024-01-09 16:30:00",
    created_by: "admin003",
    creator_name: "环卫管理处",
    attachments: [],
  },
];

// 评价数据
export const mockReviews = [
  {
    id: 1,
    issue_id: 4,
    rating: 4,
    comment: "处理及时，效果不错，希望继续保持。",
    created_at: "2024-01-10 09:00:00",
    created_by: "user004",
  },
];

// 催办记录数据
export const mockReminders = [
  {
    id: 1,
    issue_id: 2,
    operator_id: "user002",
    created_at: "2024-01-16 10:00:00",
    message: "请尽快处理噪音问题",
  },
];

// 状态流转业务逻辑
export class IssueStatusManager {
  // 检查状态流转是否合法
  static canTransitionTo(currentStatus, targetStatus) {
    const transitions = {
      [IssueStatus.PENDING]: [IssueStatus.PROCESSING],
      [IssueStatus.PROCESSING]: [IssueStatus.RESOLVED],
      [IssueStatus.RESOLVED]: [IssueStatus.REVIEWED],
      [IssueStatus.REVIEWED]: [], // 已评价状态不能再转换
    };

    return transitions[currentStatus]?.includes(targetStatus) || false;
  }

  // 执行状态转换
  static transitionStatus(issue, targetStatus, operator) {
    if (!this.canTransitionTo(issue.status, targetStatus)) {
      throw new Error(`无法从 ${issue.status} 转换到 ${targetStatus}`);
    }

    const now = new Date().toLocaleString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    // 更新状态和时间戳
    issue.status = targetStatus;
    issue.updated_at = now;

    switch (targetStatus) {
      case IssueStatus.PROCESSING:
        issue.processing_started_at = now;
        issue.processing_started_by = operator;
        break;
      case IssueStatus.RESOLVED:
        issue.resolved_at = now;
        issue.resolved_by = operator;
        break;
      case IssueStatus.REVIEWED:
        issue.reviewed_at = now;
        break;
    }

    return issue;
  }

  // 检查是否可以催办
  static canUrge(issue) {
    return [IssueStatus.PENDING, IssueStatus.PROCESSING].includes(issue.status);
  }

  // 检查24小时内是否已催办
  static canUrgeToday(issueId) {
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const recentReminders = mockReminders.filter((reminder) => {
      if (reminder.issue_id !== issueId) return false;
      const reminderTime = new Date(reminder.created_at);
      return reminderTime > twentyFourHoursAgo;
    });
    return recentReminders.length === 0;
  }

  // 添加催办记录
  static addReminder(issueId, operatorId, message = "") {
    if (!this.canUrgeToday(issueId)) {
      throw new Error("24小时内只能催办一次");
    }

    const reminder = {
      id: mockReminders.length + 1,
      issue_id: issueId,
      operator_id: operatorId,
      created_at: new Date().toISOString(),
      message,
    };

    mockReminders.push(reminder);

    // 更新问题的催办次数
    const issue = mockIssueData.find((issue) => issue.id === issueId);
    if (issue) {
      issue.reminder_count = (issue.reminder_count || 0) + 1;
    }

    return reminder;
  }
}

// 根据状态获取问题列表
export function getIssuesByStatus(status) {
  if (status === "all") {
    return mockIssueData;
  }

  const statusMap = {
    pending: [IssueStatus.PENDING],
    processing: [IssueStatus.PROCESSING],
    resolved: [IssueStatus.RESOLVED],
    reviewed: [IssueStatus.REVIEWED],
    evaluate: [IssueStatus.RESOLVED], // 待评价：已处理但未评价
  };

  const targetStatuses = statusMap[status] || [];
  return mockIssueData.filter((issue) => targetStatuses.includes(issue.status));
}

// 根据ID获取问题详情
export function getIssueById(id) {
  return mockIssueData.find((issue) => issue.id === parseInt(id));
}

// 根据问题ID获取回复列表
export function getRepliesByIssueId(issueId) {
  return mockReplies
    .filter((reply) => reply.issue_id === parseInt(issueId))
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at)); // 按创建时间降序
}

// 根据问题ID获取评价
export function getReviewByIssueId(issueId) {
  return mockReviews.find((review) => review.issue_id === parseInt(issueId));
}

// 根据问题ID获取催办记录
export function getRemindersByIssueId(issueId) {
  return mockReminders
    .filter((reminder) => reminder.issue_id === parseInt(issueId))
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

// 提交评价
export function submitReview(issueId, rating, comment, userId) {
  const issue = getIssueById(issueId);
  if (!issue || issue.status !== IssueStatus.RESOLVED) {
    throw new Error("只能对已处理的问题进行评价");
  }

  // 检查是否已评价
  const existingReview = getReviewByIssueId(issueId);
  if (existingReview) {
    throw new Error("该问题已评价，不可重复评价");
  }

  // 创建评价记录
  const review = {
    id: mockReviews.length + 1,
    issue_id: parseInt(issueId),
    rating: rating,
    comment: comment || "",
    created_at: new Date().toLocaleString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }),
    created_by: userId,
  };

  mockReviews.push(review);

  // 更新问题状态为已评价
  IssueStatusManager.transitionStatus(issue, IssueStatus.REVIEWED, userId);

  return review;
}

// 获取问题统计信息
export function getIssueStats() {
  const stats = {
    total: mockIssueData.length,
    [IssueStatus.PENDING]: 0,
    [IssueStatus.PROCESSING]: 0,
    [IssueStatus.RESOLVED]: 0,
    [IssueStatus.REVIEWED]: 0,
    needEvaluate: 0,
  };

  mockIssueData.forEach((issue) => {
    stats[issue.status]++;
    if (issue.status === IssueStatus.RESOLVED) {
      stats.needEvaluate++;
    }
  });

  return stats;
}

// 兼容旧版本的导出（保持向后兼容）
export const mockIssueDetailData = mockIssueData;
