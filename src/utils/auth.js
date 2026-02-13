/**
 * 认证相关工具函数
 */

// 手机号验证
export const validatePhone = (phone) => {
  const phoneRegex = /^1[3-9]\d{9}$/
  return {
    isValid: phoneRegex.test(phone),
    message: phoneRegex.test(phone) ? '' : '请输入正确的手机号码'
  }
}

// 密码复杂度验证
export const validatePassword = (password) => {
  const rules = [
    {
      test: password.length >= 8,
      message: '密码至少8位字符'
    },
    {
      test: /[A-Za-z]/.test(password),
      message: '密码必须包含字母'
    },
    {
      test: /\d/.test(password),
      message: '密码必须包含数字'
    },
    {
      test: /^[A-Za-z\d@$!%*?&]{8,}$/.test(password),
      message: '密码只能包含字母、数字和特殊字符(@$!%*?&)'
    }
  ]

  const failedRules = rules.filter(rule => !rule.test)
  
  return {
    isValid: failedRules.length === 0,
    messages: failedRules.map(rule => rule.message),
    strength: calculatePasswordStrength(password)
  }
}

// 计算密码强度
const calculatePasswordStrength = (password) => {
  let score = 0
  
  // 长度评分
  if (password.length >= 8) score += 1
  if (password.length >= 12) score += 1
  
  // 字符类型评分
  if (/[a-z]/.test(password)) score += 1
  if (/[A-Z]/.test(password)) score += 1
  if (/\d/.test(password)) score += 1
  if (/[@$!%*?&]/.test(password)) score += 1
  
  // 返回强度等级
  if (score <= 2) return 'weak'
  if (score <= 4) return 'medium'
  return 'strong'
}

// 邮箱验证
export const validateEmail = (email) => {
  if (!email) return { isValid: true, message: '' } // 邮箱是选填的
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return {
    isValid: emailRegex.test(email),
    message: emailRegex.test(email) ? '' : '请输入正确的邮箱地址'
  }
}

// 用户名验证
export const validateUsername = (username) => {
  const rules = [
    {
      test: username.length >= 3,
      message: '用户名至少3位字符'
    },
    {
      test: username.length <= 20,
      message: '用户名最多20位字符'
    },
    {
      test: /^[a-zA-Z0-9_\u4e00-\u9fa5]+$/.test(username),
      message: '用户名只能包含字母、数字、下划线和中文'
    },
    {
      test: !/^\d+$/.test(username),
      message: '用户名不能为纯数字'
    }
  ]

  const failedRules = rules.filter(rule => !rule.test)
  
  return {
    isValid: failedRules.length === 0,
    messages: failedRules.map(rule => rule.message)
  }
}

// 验证码验证
export const validateSmsCode = (code) => {
  const codeRegex = /^\d{6}$/
  return {
    isValid: codeRegex.test(code),
    message: codeRegex.test(code) ? '' : '验证码为6位数字'
  }
}

// 简单的加密函数（实际项目中应使用更安全的加密方式）
export const encryptData = (data) => {
  try {
    // 这里使用简单的Base64编码作为示例
    // 实际项目中应该使用AES等更安全的加密算法
    return btoa(encodeURIComponent(JSON.stringify(data)))
  } catch (error) {
    console.error('加密失败:', error)
    return null
  }
}

// 解密函数
export const decryptData = (encryptedData) => {
  try {
    return JSON.parse(decodeURIComponent(atob(encryptedData)))
  } catch (error) {
    console.error('解密失败:', error)
    return null
  }
}

// 生成随机字符串（用于token等）
export const generateRandomString = (length = 32) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// 验证码管理类
export class SmsCodeManager {
  constructor() {
    this.codes = new Map() // 存储验证码信息
    this.cooldown = new Map() // 存储冷却时间
  }

  // 发送验证码
  async sendCode(phone) {
    // 检查冷却时间
    const lastSendTime = this.cooldown.get(phone)
    const now = Date.now()
    
    if (lastSendTime && now - lastSendTime < 60000) { // 60秒冷却
      const remainingTime = Math.ceil((60000 - (now - lastSendTime)) / 1000)
      throw new Error(`请等待${remainingTime}秒后再试`)
    }

    // 生成6位验证码
    const code = Math.random().toString().slice(-6).padStart(6, '0')
    
    // 存储验证码信息
    this.codes.set(phone, {
      code,
      timestamp: now,
      attempts: 0
    })
    
    // 设置冷却时间
    this.cooldown.set(phone, now)
    
    // 模拟发送短信
    console.log(`发送验证码 ${code} 到手机号 ${phone}`)
    
    // 5分钟后自动清除验证码
    setTimeout(() => {
      this.codes.delete(phone)
    }, 5 * 60 * 1000)
    
    return {
      success: true,
      message: '验证码已发送'
    }
  }

  // 验证验证码
  verifyCode(phone, inputCode) {
    const codeInfo = this.codes.get(phone)
    
    if (!codeInfo) {
      return {
        success: false,
        message: '验证码已过期或不存在'
      }
    }

    // 检查尝试次数
    if (codeInfo.attempts >= 3) {
      this.codes.delete(phone)
      return {
        success: false,
        message: '验证码错误次数过多，请重新获取'
      }
    }

    // 检查是否过期（5分钟）
    const now = Date.now()
    if (now - codeInfo.timestamp > 5 * 60 * 1000) {
      this.codes.delete(phone)
      return {
        success: false,
        message: '验证码已过期'
      }
    }

    // 验证码码
    if (codeInfo.code === inputCode) {
      this.codes.delete(phone) // 验证成功后删除
      return {
        success: true,
        message: '验证成功'
      }
    } else {
      codeInfo.attempts++
      return {
        success: false,
        message: `验证码错误，还可尝试${3 - codeInfo.attempts}次`
      }
    }
  }

  // 获取剩余冷却时间
  getCooldownTime(phone) {
    const lastSendTime = this.cooldown.get(phone)
    if (!lastSendTime) return 0
    
    const now = Date.now()
    const remainingTime = Math.max(0, 60000 - (now - lastSendTime))
    return Math.ceil(remainingTime / 1000)
  }
}

// 创建全局验证码管理器实例
export const smsCodeManager = new SmsCodeManager()

// 本地存储工具
export const storage = {
  // 设置用户信息
  setUserInfo(userInfo) {
    try {
      const encryptedData = encryptData(userInfo)
      localStorage.setItem('userInfo', encryptedData)
    } catch (error) {
      console.error('保存用户信息失败:', error)
    }
  },

  // 获取用户信息
  getUserInfo() {
    try {
      const encryptedData = localStorage.getItem('userInfo')
      return encryptedData ? decryptData(encryptedData) : null
    } catch (error) {
      console.error('获取用户信息失败:', error)
      return null
    }
  },

  // 清除用户信息
  clearUserInfo() {
    localStorage.removeItem('userInfo')
  },

  // 设置记住的用户名
  setRememberedUsername(username) {
    localStorage.setItem('rememberedUsername', username)
  },

  // 获取记住的用户名
  getRememberedUsername() {
    return localStorage.getItem('rememberedUsername')
  },

  // 清除记住的用户名
  clearRememberedUsername() {
    localStorage.removeItem('rememberedUsername')
  }
}

// 表单验证工具
export const formValidator = {
  // 验证整个表单
  validateForm(formData, rules) {
    const errors = {}
    
    for (const [field, value] of Object.entries(formData)) {
      const fieldRules = rules[field]
      if (fieldRules) {
        const error = this.validateField(value, fieldRules)
        if (error) {
          errors[field] = error
        }
      }
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    }
  },

  // 验证单个字段
  validateField(value, rules) {
    for (const rule of rules) {
      if (rule.required && (!value || value.trim() === '')) {
        return rule.message || '此字段为必填项'
      }
      
      if (value && rule.pattern && !rule.pattern.test(value)) {
        return rule.message || '格式不正确'
      }
      
      if (value && rule.min && value.length < rule.min) {
        return rule.message || `最少${rule.min}个字符`
      }
      
      if (value && rule.max && value.length > rule.max) {
        return rule.message || `最多${rule.max}个字符`
      }
      
      if (rule.validator) {
        const result = rule.validator(value)
        if (result !== true) {
          return result
        }
      }
    }
    
    return null
  }
}