/**
 * 认证服务 - 处理登录、注册等API请求
 */

import { encryptData, smsCodeManager, generateRandomString } from '@/utils/auth'

// 模拟API基础URL
const API_BASE_URL = '/api/auth'

// 模拟网络延迟
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

// 模拟用户数据库 - 使用localStorage持久化
const USERS_STORAGE_KEY = 'mockUsers'

// 初始化默认用户数据
const defaultUsers = [
  {
    id: 1,
    username: 'admin',
    phone: '13800138000',
    email: 'admin@example.com',
    password: 'Admin123', // 实际项目中应该是加密后的密码
    gender: '男',
    birthday: '1990-01-01',
    avatar: '',
    role: 'admin',
    createdAt: '2024-01-01T00:00:00Z'
  },
  // 部门操作员账号
  {
    id: 2,
    username: '部门操作员',
    phone: '13800138001',
    email: 'operator@dept.gov.cn',
    password: 'Operator123',
    gender: '女',
    birthday: '1985-03-15',
    avatar: '',
    role: 'department_operator',
    department: '城市管理局',
    createdAt: '2024-01-02T00:00:00Z'
  },
  // 问政操作员账号
  {
    id: 6,
    username: '问政操作员',
    phone: '13800138005',
    email: 'political@dept.gov.cn',
    password: 'Operator123',
    gender: '女',
    birthday: '1987-09-09',
    avatar: '',
    role: 'political_operator',
    department: '问政办',
    createdAt: '2024-01-06T00:00:00Z'
  },
  // 网格员账号
  {
    id: 3,
    username: '网格员小王',
    phone: '13800138002',
    email: 'gridworker@grid.gov.cn',
    password: 'Grid123',
    gender: '男',
    birthday: '1992-07-20',
    avatar: '',
    role: 'grid_worker',
    gridArea: '第一网格区域',
    createdAt: '2024-01-03T00:00:00Z'
  },
  // 专家账号
  {
    id: 4,
    username: '专家李教授',
    phone: '13800138003',
    email: 'expert@university.edu.cn',
    password: 'Expert123',
    gender: '男',
    birthday: '1975-11-08',
    avatar: '',
    role: 'expert',
    specialty: '城市规划与管理',
    title: '教授',
    createdAt: '2024-01-04T00:00:00Z'
  },
  // 普通用户账号
  {
    id: 5,
    username: '市民张三',
    phone: '13800138004',
    email: 'citizen@example.com',
    password: 'User123',
    gender: '男',
    birthday: '1988-05-12',
    avatar: '',
    role: 'ordinary_user',
    createdAt: '2024-01-05T00:00:00Z'
  }
]

// 获取用户数据
const getMockUsers = () => {
  try {
    const stored = localStorage.getItem(USERS_STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
    // 如果没有存储的数据，使用默认数据并保存
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(defaultUsers))
    return defaultUsers
  } catch (error) {
    console.error('获取用户数据失败:', error)
    return defaultUsers
  }
}

// 保存用户数据
const saveMockUsers = (users) => {
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users))
  } catch (error) {
    console.error('保存用户数据失败:', error)
  }
}

// 认证服务类
class AuthService {
  constructor() {
    this.token = localStorage.getItem('authToken')
  }

  // 设置认证token
  setToken(token) {
    this.token = token
    localStorage.setItem('authToken', token)
  }

  // 清除认证token
  clearToken() {
    this.token = null
    localStorage.removeItem('authToken')
    localStorage.removeItem('isLoggedIn')
    localStorage.removeItem('selectedUserRole')
  }

  // 获取请求头
  getHeaders() {
    const headers = {
      'Content-Type': 'application/json'
    }
    
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`
    }
    
    return headers
  }

  // 发送验证码
  async sendSmsCode(phone) {
    try {
      await delay(1000) // 模拟网络延迟
      
      // 使用验证码管理器发送验证码
      const result = await smsCodeManager.sendCode(phone)
      
      return {
        success: true,
        data: result,
        message: '验证码已发送'
      }
    } catch (error) {
      return {
        success: false,
        message: error.message || '发送验证码失败'
      }
    }
  }

  // 重置密码
  async resetPassword(data) {
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // 模拟重置成功
      return {
        success: true,
        message: '密码重置成功'
      }
    } catch (error) {
      return {
        success: false,
        message: '重置失败，请重试'
      }
    }
  }

  // 验证码登录
  async loginWithSms(phone, code) {
    try {
      await delay(1500) // 模拟网络延迟
      
      // 验证验证码
      const codeResult = smsCodeManager.verifyCode(phone, code)
      if (!codeResult.success) {
        return {
          success: false,
          message: codeResult.message
        }
      }

      // 查找用户
      const users = getMockUsers()
      let user = users.find(u => u.phone === phone)
      
      // 如果用户不存在，创建新用户（手机号登录时自动注册）
      if (!user) {
        user = {
          id: users.length + 1,
          username: `用户${phone.slice(-4)}`,
          phone,
          email: '',
          password: '',
          gender: '',
          birthday: '',
          avatar: '',
          createdAt: new Date().toISOString()
        }
        users.push(user)
        saveMockUsers(users)
      }

      // 生成token
      const token = this.generateToken(user)
      this.setToken(token)

      // 返回用户信息（不包含敏感信息）
      const { password, ...userInfo } = user
      
      return {
        success: true,
        data: {
          user: userInfo,
          token
        },
        message: '登录成功'
      }
    } catch (error) {
      return {
        success: false,
        message: error.message || '登录失败'
      }
    }
  }

  // 密码登录
  async loginWithPassword(username, password) {
    try {
      await delay(1500) // 模拟网络延迟
      
      // 查找用户（支持用户名或手机号登录）
      const users = getMockUsers()
      
      const user = users.find(u => 
        u.username === username || u.phone === username
      )
      
      if (!user) {
        return {
          success: false,
          message: '用户不存在'
        }
      }

      // 验证密码（实际项目中应该比较加密后的密码）
      if (user.password !== password) {
        return {
          success: false,
          message: '密码错误'
        }
      }

      // 生成token
      const token = this.generateToken(user)
      this.setToken(token)

      // 返回用户信息（不包含敏感信息）
      const { password: _, ...userInfo } = user
      
      return {
        success: true,
        data: {
          user: userInfo,
          token
        },
        message: '登录成功'
      }
    } catch (error) {
      return {
        success: false,
        message: error.message || '登录失败'
      }
    }
  }

  // 用户注册
  async register(userData) {
    try {
      await delay(2000) // 模拟网络延迟
      
      const { username, phone, code, password, email, gender, birthday } = userData

      // 验证验证码
      const codeResult = smsCodeManager.verifyCode(phone, code)
      if (!codeResult.success) {
        return {
          success: false,
          message: codeResult.message
        }
      }

      // 获取当前用户数据
      const users = getMockUsers()

      // 检查用户名是否已存在
      if (users.find(u => u.username === username)) {
        return {
          success: false,
          message: '用户名已存在'
        }
      }

      // 检查手机号是否已存在
      if (users.find(u => u.phone === phone)) {
        return {
          success: false,
          message: '手机号已注册'
        }
      }

      // 检查邮箱是否已存在（如果提供了邮箱）
      if (email && users.find(u => u.email === email)) {
        return {
          success: false,
          message: '邮箱已注册'
        }
      }

      // 创建新用户
      const newUser = {
        id: users.length + 1,
        username,
        phone,
        email: email || '',
        password, // 实际项目中应该加密存储
        gender: gender || '',
        birthday: birthday || '',
        avatar: '',
        createdAt: new Date().toISOString()
      }

      users.push(newUser)
      saveMockUsers(users)

      // 返回成功信息（不包含敏感信息）
      const { password: _, ...userInfo } = newUser
      
      return {
        success: true,
        data: {
          user: userInfo
        },
        message: '注册成功'
      }
    } catch (error) {
      return {
        success: false,
        message: error.message || '注册失败'
      }
    }
  }

  // 获取用户信息
  async getUserInfo() {
    try {
      if (!this.token) {
        return {
          success: false,
          message: '未登录'
        }
      }

      await delay(500) // 模拟网络延迟
      
      // 解析token获取用户ID（简化实现）
      const payload = this.parseToken(this.token)
      if (!payload) {
        return {
          success: false,
          message: 'Token无效'
        }
      }

      const users = getMockUsers()
      const user = users.find(u => u.id === payload.userId)
      if (!user) {
        return {
          success: false,
          message: '用户不存在'
        }
      }

      // 返回用户信息（不包含敏感信息）
      const { password, ...userInfo } = user
      
      return {
        success: true,
        data: {
          user: userInfo
        }
      }
    } catch (error) {
      return {
        success: false,
        message: error.message || '获取用户信息失败'
      }
    }
  }

  // 更新用户信息
  async updateUserInfo(userData) {
    try {
      if (!this.token) {
        return {
          success: false,
          message: '未登录'
        }
      }

      await delay(1000) // 模拟网络延迟
      
      // 解析token获取用户ID
      const payload = this.parseToken(this.token)
      if (!payload) {
        return {
          success: false,
          message: 'Token无效'
        }
      }

      const users = getMockUsers()
      const userIndex = users.findIndex(u => u.id === payload.userId)
      if (userIndex === -1) {
        return {
          success: false,
          message: '用户不存在'
        }
      }

      // 更新用户信息
      users[userIndex] = {
        ...users[userIndex],
        ...userData,
        id: payload.userId, // 确保ID不被修改
        updatedAt: new Date().toISOString()
      }

      saveMockUsers(users)

      // 返回更新后的用户信息
      const { password, ...userInfo } = users[userIndex]
      
      return {
        success: true,
        data: {
          user: userInfo
        },
        message: '更新成功'
      }
    } catch (error) {
      return {
        success: false,
        message: error.message || '更新失败'
      }
    }
  }

  // 退出登录
  async logout() {
    try {
      await delay(500) // 模拟网络延迟
      
      this.clearToken()
      
      return {
        success: true,
        message: '退出成功'
      }
    } catch (error) {
      return {
        success: false,
        message: error.message || '退出失败'
      }
    }
  }

  // 修改密码
  async changePassword(oldPassword, newPassword) {
    try {
      if (!this.token) {
        return {
          success: false,
          message: '未登录'
        }
      }

      await delay(1000) // 模拟网络延迟
      
      // 解析token获取用户ID
      const payload = this.parseToken(this.token)
      if (!payload) {
        return {
          success: false,
          message: 'Token无效'
        }
      }

      const users = getMockUsers()
      const userIndex = users.findIndex(u => u.id === payload.userId)
      if (userIndex === -1) {
        return {
          success: false,
          message: '用户不存在'
        }
      }

      // 验证旧密码
      if (users[userIndex].password !== oldPassword) {
        return {
          success: false,
          message: '原密码错误'
        }
      }

      // 更新密码
      users[userIndex].password = newPassword
      users[userIndex].updatedAt = new Date().toISOString()
      
      saveMockUsers(users)
      
      return {
        success: true,
        message: '密码修改成功'
      }
    } catch (error) {
      return {
        success: false,
        message: error.message || '密码修改失败'
      }
    }
  }

  // 生成并获取CSRF Token
  ensureCsrfToken() {
    let token = localStorage.getItem('csrfToken')
    if (!token) {
      token = generateRandomString(32)
      localStorage.setItem('csrfToken', token)
    }
    return token
  }

  getCsrfToken() {
    return this.ensureCsrfToken()
  }

  // 服务端校验验证码（模拟）
  async verifySmsCode(phone, code) {
    await delay(300)
    const result = smsCodeManager.verifyCode(phone, code)
    return result
  }

  // 敏感操作日志记录
  logSecurityEvent(type, details = {}) {
    try {
      const logsRaw = localStorage.getItem('securityLogs')
      const logs = logsRaw ? JSON.parse(logsRaw) : []
      logs.push({ type, details, time: new Date().toISOString() })
      localStorage.setItem('securityLogs', JSON.stringify(logs))
    } catch (e) {
      console.warn('记录安全日志失败', e)
    }
  }

  // 双重验证更新手机号
  async updatePhoneWithVerification({ oldPhone, oldCode, newPhone, newCode, csrfToken }) {
    try {
      if (!this.token) {
        return { success: false, message: '未登录' }
      }

      this.ensureCsrfToken()
      const storedToken = localStorage.getItem('csrfToken')
      if (!csrfToken || csrfToken !== storedToken) {
        return { success: false, message: 'CSRF校验失败' }
      }

      await delay(500)

      const oldVerify = await this.verifySmsCode(oldPhone, oldCode)
      if (!oldVerify.success) {
        return { success: false, message: oldVerify.message || '原手机号验证失败' }
      }

      const newVerify = await this.verifySmsCode(newPhone, newCode)
      if (!newVerify.success) {
        return { success: false, message: newVerify.message || '新手机号验证失败' }
      }

      const payload = this.parseToken(this.token)
      if (!payload) {
        return { success: false, message: 'Token无效' }
      }

      const users = getMockUsers()
      const idx = users.findIndex(u => u.id === payload.userId)
      if (idx === -1) {
        return { success: false, message: '用户不存在' }
      }

      if ((users[idx].phone || '') !== (oldPhone || '')) {
        return { success: false, message: '手机号已变更，请刷新后重试' }
      }

      const before = users[idx].phone || ''
      users[idx].phone = newPhone
      users[idx].updatedAt = new Date().toISOString()
      saveMockUsers(users)

      this.logSecurityEvent('change_phone', { userId: payload.userId, before, after: newPhone })

      const { password, ...userInfo } = users[idx]
      return { success: true, data: { user: userInfo }, message: '手机号更新成功' }
    } catch (error) {
      return { success: false, message: error.message || '更新失败，请重试' }
    }
  }

  // 上传头像
  async uploadAvatar(file) {
    try {
      if (!this.token) {
        return {
          success: false,
          message: '未登录'
        }
      }

      await delay(1500) // 模拟上传延迟
      
      // 解析token获取用户ID
      const payload = this.parseToken(this.token)
      if (!payload) {
        return {
          success: false,
          message: 'Token无效'
        }
      }

      // 模拟文件上传处理
      if (!file) {
        return {
          success: false,
          message: '请选择头像文件'
        }
      }

      // 检查文件类型
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif']
      if (!file.type || !allowedTypes.includes(file.type)) {
        return {
          success: false,
          message: '仅支持 JPG、PNG、GIF 格式的图片'
        }
      }

      // 检查文件大小（5MB限制）
      const maxSize = 5 * 1024 * 1024
      if (file.size > maxSize) {
        return {
          success: false,
          message: '头像文件大小不能超过5MB'
        }
      }

      // 模拟生成头像URL（实际项目中会上传到云存储）
      const avatarUrl = URL.createObjectURL(file)
      
      // 更新用户头像
      const users = getMockUsers()
      const userIndex = users.findIndex(u => u.id === payload.userId)
      if (userIndex === -1) {
        return {
          success: false,
          message: '用户不存在'
        }
      }

      users[userIndex].avatar = avatarUrl
      users[userIndex].updatedAt = new Date().toISOString()
      
      saveMockUsers(users)
      
      return {
        success: true,
        data: {
          avatarUrl
        },
        message: '头像上传成功'
      }
    } catch (error) {
      return {
        success: false,
        message: error.message || '头像上传失败'
      }
    }
  }

  // 验证用户信息字段
  validateUserInfo(userData) {
    const errors = {}
    
    // 验证昵称
    if (userData.username) {
      if (userData.username.length < 2 || userData.username.length > 20) {
        errors.username = '昵称长度应在2-20个字符之间'
      }
    }
    
    // 验证姓名
    if (userData.realName) {
      if (userData.realName.length < 2 || userData.realName.length > 10) {
        errors.realName = '姓名长度应在2-10个字符之间'
      }
    }
    
    // 验证手机号
    if (userData.phone) {
      const phoneRegex = /^1[3-9]\d{9}$/
      if (!phoneRegex.test(userData.phone)) {
        errors.phone = '请输入正确的手机号码'
      }
    }
    
    // 验证邮箱
    if (userData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(userData.email)) {
        errors.email = '请输入正确的邮箱地址'
      }
    }
    
    // 验证生日
    if (userData.birthday) {
      const birthDate = new Date(userData.birthday)
      const now = new Date()
      const age = now.getFullYear() - birthDate.getFullYear()
      if (age < 0 || age > 150) {
        errors.birthday = '请输入正确的生日'
      }
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    }
  }

  // 生成token（简化实现）
  generateToken(user) {
    const payload = {
      userId: user.id,
      username: user.username,
      exp: Date.now() + 7 * 24 * 60 * 60 * 1000 // 7天过期
    }
    
    // 实际项目中应该使用JWT等标准方式
    return encryptData(payload)
  }

  // 解析token（简化实现）
  parseToken(token) {
    try {
      const payload = JSON.parse(decodeURIComponent(atob(token)))
      
      // 检查是否过期
      if (payload.exp && Date.now() > payload.exp) {
        this.clearToken()
        return null
      }
      
      return payload
    } catch (error) {
      console.error('解析token失败:', error)
      return null
    }
  }

  // 检查是否已登录
  isLoggedIn() {
    if (!this.token) return false
    
    const payload = this.parseToken(this.token)
    return payload !== null
  }
}

// 创建并导出认证服务实例
export const authService = new AuthService()

// 导出默认实例
export default authService