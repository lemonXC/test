<template>
  <div class="user-info-page">
    <van-nav-bar 
      title="个人信息" 
      left-text="返回" 
      left-arrow 
      @click-left="$router.go(-1)"
    />
    
    <div class="page-content">
      <!-- 头像区域 -->
      <div class="avatar-section">
        <div class="avatar-container" @click="showAvatarPreview">
          <van-image
            round
            width="100"
            height="100"
            :src="userInfo.avatar || defaultAvatar"
            fit="cover"
            class="user-avatar"
          />
          <div class="avatar-overlay">
            <van-icon name="photograph" size="24" color="#fff" />
          </div>
        </div>
        <van-button 
          type="primary" 
          size="small" 
          class="change-avatar-btn"
          @click="$router.push('/edit-profile')"
        >
          修改资料
        </van-button>
      </div>

      <!-- 基础信息 -->
      <div class="info-section">
        <div class="section-title">基础信息</div>
        <van-cell-group>
          <van-cell title="昵称" :value="userInfo.username || '未设置'" />
          <van-cell title="姓名" :value="userInfo.realName || '未设置'" />
          <van-cell title="手机号" :value="formatPhone(userInfo.phone)" />
          <van-cell title="邮箱" :value="userInfo.email || '未设置'" />
          <van-cell title="性别" :value="userInfo.gender || '未设置'" />
          <van-cell title="生日" :value="userInfo.birthday || '未设置'" />
          <van-cell title="所在地区" :value="userInfo.region || '未设置'" />
        </van-cell-group>
      </div>

      <!-- 角色特定信息 -->
      <div class="info-section" v-if="roleSpecificInfo">
        <div class="section-title">{{ roleSpecificInfo.title }}</div>
        <van-cell-group>
          <van-cell 
            v-for="item in roleSpecificInfo.items" 
            :key="item.label"
            :title="item.label" 
            :value="item.value" 
          />
        </van-cell-group>
      </div>

      <!-- 操作按钮 -->
      <div class="action-section">
        <van-button 
          type="default" 
          block 
          class="action-btn"
          @click="$router.push('/change-password')"
        >
          修改密码
        </van-button>
        <van-button 
          type="danger" 
          block 
          class="action-btn logout-btn"
          @click="showLogoutConfirm = true"
        >
          退出登录
        </van-button>
      </div>
    </div>

    <!-- 头像预览 -->
    <van-image-preview 
      v-model:show="showAvatarPreviewDialog" 
      :images="[userInfo.avatar || defaultAvatar]"
    />



    <!-- 退出登录确认 -->
    <van-dialog
      v-model:show="showLogoutConfirm"
      title="确认退出"
      message="确定要退出登录吗？"
      show-cancel-button
      @confirm="handleLogout"
    />


  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showSuccessToast } from 'vant'
import authService from '@/services/authService'
import { getRoleInfo } from '@/services/roleService'

const router = useRouter()

// 响应式数据
const userInfo = ref({})
const showAvatarPreviewDialog = ref(false)
const showLogoutConfirm = ref(false)

// 默认头像
const defaultAvatar = 'https://img.yzcdn.cn/vant/cat.jpeg'

// 格式化手机号（部分隐藏）
const formatPhone = (phone) => {
  if (!phone) return '未设置'
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
}

// 头像预览
const showAvatarPreview = () => {
  showAvatarPreviewDialog.value = true
}

// 角色特定信息
const roleSpecificInfo = computed(() => {
  if (!userInfo.value.role) return null
  
  const roleInfo = getRoleInfo(userInfo.value.role)
  const items = []
  
  switch (userInfo.value.role) {
    case 'department_operator':
      items.push({
        label: '所属部门',
        value: userInfo.value.department || '未设置'
      })
      break
    case 'expert':
      items.push(
        {
          label: '专家领域',
          value: userInfo.value.specialty || '未设置'
        },
        {
          label: '职称',
          value: userInfo.value.title || '未设置'
        }
      )
      break
    case 'grid_worker':
      items.push({
        label: '网格区域',
        value: userInfo.value.gridArea || '未设置'
      })
      break
  }
  
  if (items.length === 0) return null
  
  return {
    title: roleInfo.name + '信息',
    items
  }
})



// 退出登录
const handleLogout = async () => {
  try {
    await authService.logout()
    showSuccessToast('退出登录成功')
    router.replace('/')
  } catch (error) {
    showToast('退出登录失败')
  }
}

// 获取用户信息
const loadUserInfo = async () => {
  try {
    const response = await authService.getUserInfo()
    if (response.success) {
      userInfo.value = response.data
    } else {
      showToast('获取用户信息失败')
    }
  } catch (error) {
    console.error('获取用户信息失败:', error)
    showToast('获取用户信息失败')
  }
}

onMounted(() => {
  loadUserInfo()
})
</script>

<style scoped>
.user-info-page {
  min-height: 100vh;
  background-color: #f7f8fa;
}

.page-content {
  padding: 16px;
  padding-bottom: 80px;
}

/* 头像区域 */
.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px 0;
  background: white;
  border-radius: 12px;
  margin-bottom: 16px;
}

.avatar-container {
  position: relative;
  cursor: pointer;
  /* margin-bottom: 16px; */
}

.user-avatar {
  border: 3px solid #fff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.avatar-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
}

.avatar-container:hover .avatar-overlay {
  opacity: 1;
}

.change-avatar-btn {
  border-radius: 20px;
}

/* 信息区域 */
.info-section {
  margin-bottom: 16px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #323233;
  padding: 0 16px 12px 0;
  margin-bottom: 8px;
}

.van-cell-group {
  border-radius: 12px;
  overflow: hidden;
}

/* 操作按钮区域 */
.action-section {
  margin-top: 32px;
}

.action-btn {
  margin-bottom: 12px;
  border-radius: 12px;
  height: 48px;
  font-size: 16px;
  font-weight: 500;
}



/* 响应式设计 */
@media (max-width: 375px) {
  .page-content {
    padding: 12px;
  }
  
  .avatar-section {
    padding: 24px 0;
  }
  
  .section-title {
    font-size: 15px;
  }
  
  .action-btn {
    height: 44px;
    font-size: 15px;
  }
}
</style>