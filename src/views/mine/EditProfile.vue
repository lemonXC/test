<template>
  <div class="edit-profile-page">
    <van-nav-bar 
      title="编辑资料" 
      left-text="取消" 
      right-text="保存"
      left-arrow 
      @click-left="handleCancel"
      @click-right="handleSave"
    />
    
    <div class="page-content">
      <van-form @submit="handleSave" ref="formRef">
        <!-- 头像编辑 -->
        <div class="avatar-edit-section">
          <div class="avatar-container" @click="showAvatarUpload = true">
            <van-image
              round
              width="80"
              height="80"
              :src="formData.avatar || defaultAvatar"
              fit="cover"
              class="edit-avatar"
            />
            <div class="avatar-edit-overlay">
              <van-icon name="photograph" size="20" color="#fff" />
            </div>
          </div>
          <div class="avatar-tip">点击修改头像</div>
        </div>

        <!-- 基础信息表单 -->
        <van-cell-group class="form-group">
          <van-field
            v-model="formData.username"
            name="username"
            label="昵称"
            placeholder="请输入昵称"
            :rules="[{ required: true, message: '请输入昵称' }]"
            maxlength="20"
            show-word-limit
          />
          
          <van-field
            v-model="formData.realName"
            name="realName"
            label="姓名"
            placeholder="请输入真实姓名"
            :rules="[{ required: true, message: '请输入真实姓名' }]"
            maxlength="10"
          />
          
          <van-field
            v-model="formData.phone"
            name="phone"
            label="手机号"
            placeholder="请输入手机号"
            :rules="phoneRules"
            type="tel"
            maxlength="11"
          />
          
          <van-field
            v-model="formData.email"
            name="email"
            label="邮箱"
            placeholder="请输入邮箱地址"
            :rules="emailRules"
            type="email"
          />
          
          <van-field
            v-model="formData.gender"
            name="gender"
            label="性别"
            placeholder="请选择性别"
            readonly
            is-link
            @click="showGenderPicker = true"
          />
          
          <van-field
            v-model="formData.birthday"
            name="birthday"
            label="生日"
            placeholder="请选择生日"
            readonly
            is-link
            @click="showDatePicker = true"
          />
          
          <van-field
            v-model="formData.region"
            name="region"
            label="所在地区"
            placeholder="请选择所在地区"
            readonly
            is-link
            @click="showRegionPicker = true"
          />
        </van-cell-group>

        <!-- 角色特定信息 -->
        <van-cell-group inset class="form-group" v-if="roleSpecificFields.length > 0">
          <div class="group-title">角色信息</div>
          <van-field
            v-for="field in roleSpecificFields"
            :key="field.key"
            v-model="formData[field.key]"
            :name="field.key"
            :label="field.label"
            :placeholder="field.placeholder"
            :rules="field.rules"
            :maxlength="field.maxlength"
            :show-word-limit="field.showWordLimit"
          />
        </van-cell-group>
      </van-form>
    </div>

    <!-- 性别选择器 -->
    <van-popup v-model:show="showGenderPicker" position="bottom">
      <van-picker
        :columns="genderColumns"
        @confirm="onGenderConfirm"
        @cancel="showGenderPicker = false"
      />
    </van-popup>

    <!-- 日期选择器 -->
    <van-popup v-model:show="showDatePicker" position="bottom">
      <van-date-picker
        v-model="currentDate"
        @confirm="onDateConfirm"
        @cancel="showDatePicker = false"
        :min-date="minDate"
        :max-date="maxDate"
      />
    </van-popup>

    <!-- 地区选择器 -->
    <van-popup v-model:show="showRegionPicker" position="bottom">
      <van-area
        :area-list="areaList"
        @confirm="onRegionConfirm"
        @cancel="showRegionPicker = false"
      />
    </van-popup>

    <!-- 头像上传 -->
    <van-popup 
      v-model:show="showAvatarUpload" 
      position="bottom" 
      :style="{ height: '30%' }"
    >
      <div class="avatar-upload-popup">
        <div class="popup-title">选择头像</div>
        <div class="upload-options">
          <div class="upload-option" @click="selectFromGallery">
            <van-icon name="photo" size="32" />
            <span>从相册选择</span>
          </div>
          <div class="upload-option" @click="takePhoto">
            <van-icon name="photograph" size="32" />
            <span>拍照</span>
          </div>
        </div>
        <van-button 
          block 
          type="default" 
          class="cancel-btn"
          @click="showAvatarUpload = false"
        >
          取消
        </van-button>
      </div>
    </van-popup>

    <!-- 文件上传隐藏input -->
    <input 
      ref="fileInput" 
      type="file" 
      accept="image/*" 
      style="display: none" 
      @change="handleFileSelect"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showSuccessToast, showConfirmDialog } from 'vant'
import authService from '@/services/authService'
import { getRoleInfo } from '@/services/roleService'

const router = useRouter()

// 响应式数据
const formRef = ref(null)
const fileInput = ref(null)
const formData = ref({
  avatar: '',
  username: '',
  realName: '',
  phone: '',
  email: '',
  gender: '',
  birthday: '',
  region: '',
  // 角色特定字段
  department: '',
  specialty: '',
  title: '',
  gridArea: ''
})

const showGenderPicker = ref(false)
const showDatePicker = ref(false)
const showRegionPicker = ref(false)
const showAvatarUpload = ref(false)
const currentDate = ref(new Date())

// 默认头像
const defaultAvatar = 'https://img.yzcdn.cn/vant/cat.jpeg'

// 表单验证规则
const phoneRules = [
  { required: true, message: '请输入手机号' },
  { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' }
]

const emailRules = [
  { required: true, message: '请输入邮箱地址' },
  { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: '请输入正确的邮箱地址' }
]

// 性别选项
const genderColumns = [
  { text: '男', value: '男' },
  { text: '女', value: '女' },
  { text: '其他', value: '其他' }
]

// 日期范围
const minDate = new Date(1900, 0, 1)
const maxDate = new Date()

// 地区数据（简化版）
const areaList = {
  province_list: {
    110000: '北京市',
    120000: '天津市',
    130000: '河北省',
    140000: '山西省',
    150000: '内蒙古自治区',
    210000: '辽宁省',
    220000: '吉林省',
    230000: '黑龙江省',
    310000: '上海市',
    320000: '江苏省',
    330000: '浙江省',
    340000: '安徽省',
    350000: '福建省',
    360000: '江西省',
    370000: '山东省',
    410000: '河南省',
    420000: '湖北省',
    430000: '湖南省',
    440000: '广东省',
    450000: '广西壮族自治区',
    460000: '海南省',
    500000: '重庆市',
    510000: '四川省',
    520000: '贵州省',
    530000: '云南省',
    540000: '西藏自治区',
    610000: '陕西省',
    620000: '甘肃省',
    630000: '青海省',
    640000: '宁夏回族自治区',
    650000: '新疆维吾尔自治区'
  },
  city_list: {
    110100: '北京市',
    120100: '天津市',
    130100: '石家庄市',
    130200: '唐山市'
  },
  county_list: {
    110101: '东城区',
    110102: '西城区',
    110105: '朝阳区',
    110106: '丰台区'
  }
}

// 角色特定字段配置
const roleSpecificFields = computed(() => {
  const userRole = formData.value.role
  const fields = []
  
  switch (userRole) {
    case 'department_operator':
      fields.push({
        key: 'department',
        label: '所属部门',
        placeholder: '请输入所属部门',
        rules: [{ required: true, message: '请输入所属部门' }],
        maxlength: 50
      })
      break
    case 'expert':
      fields.push(
        {
          key: 'specialty',
          label: '专家领域',
          placeholder: '请输入专家领域',
          rules: [{ required: true, message: '请输入专家领域' }],
          maxlength: 100,
          showWordLimit: true
        },
        {
          key: 'title',
          label: '职称',
          placeholder: '请输入职称',
          maxlength: 20
        }
      )
      break
    case 'grid_worker':
      fields.push({
        key: 'gridArea',
        label: '网格区域',
        placeholder: '请输入网格区域',
        rules: [{ required: true, message: '请输入网格区域' }],
        maxlength: 50
      })
      break
  }
  
  return fields
})

// 性别选择确认
const onGenderConfirm = (value) => {
  if (value && value.selectedOptions && value.selectedOptions.length > 0) {
    formData.value.gender = value.selectedOptions[0].value
  }
  showGenderPicker.value = false
}

// 日期选择确认
const onDateConfirm = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  formData.value.birthday = `${year}-${month}-${day}`
  showDatePicker.value = false
}

// 地区选择确认
const onRegionConfirm = (value) => {
  if (value && value.selectedOptions && Array.isArray(value.selectedOptions)) {
    const region = value.selectedOptions.map(option => option.text).join('/')
    formData.value.region = region
  }
  showRegionPicker.value = false
}

// 从相册选择
const selectFromGallery = () => {
  fileInput.value.click()
  showAvatarUpload.value = false
}

// 拍照
const takePhoto = () => {
  showToast('拍照功能需要在移动设备上使用')
  showAvatarUpload.value = false
}

// 处理文件选择
const handleFileSelect = (event) => {
  const file = event.target.files[0]
  if (!file) return
  
  if (!file.type || !file.type.startsWith('image/')) {
    showToast('请选择图片文件')
    return
  }
  
  if (file.size > 2 * 1024 * 1024) {
    showToast('图片大小不能超过2MB')
    return
  }
  
  const reader = new FileReader()
  reader.onload = (e) => {
    formData.value.avatar = e.target.result
  }
  reader.readAsDataURL(file)
  
  event.target.value = ''
}

// 取消编辑
const handleCancel = () => {
  showConfirmDialog({
    title: '确认取消',
    message: '确定要取消编辑吗？未保存的修改将丢失。'
  }).then(() => {
    router.go(-1)
  }).catch(() => {
    // 取消操作
  })
}

// 保存修改
const handleSave = async () => {
  try {
    await formRef.value.validate()
    
    const updateData = { ...formData.value }
    const response = await authService.updateUserInfo(updateData)
    
    if (response.success) {
      showSuccessToast('保存成功')
      router.go(-1)
    } else {
      showToast(response.message || '保存失败')
    }
  } catch (error) {
    console.error('保存失败:', error)
    if (error.name === 'ValidationError') {
      showToast('请检查输入信息')
    } else {
      showToast('保存失败，请重试')
    }
  }
}

// 获取用户信息
const loadUserInfo = async () => {
  try {
    const response = await authService.getUserInfo()
    if (response.success) {
      Object.assign(formData.value, response.data)
      
      // 设置日期选择器的当前值
      if (formData.value.birthday) {
        currentDate.value = new Date(formData.value.birthday)
      }
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
.edit-profile-page {
  min-height: 100vh;
  background-color: #f7f8fa;
}

.page-content {
  padding: 16px;
  padding-bottom: 80px;
}

/* 头像编辑区域 */
.avatar-edit-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px 0;
  background: white;
  border-radius: 8px;
  margin-bottom: 16px;
}

.avatar-container {
  position: relative;
  cursor: pointer;
  margin-bottom: 8px;
}

.edit-avatar {
  border: 2px solid #ebedf0;
}

.avatar-edit-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
}

.avatar-container:hover .avatar-edit-overlay {
  opacity: 1;
}

.avatar-tip {
  font-size: 14px;
  color: #969799;
}

/* 表单组 */
.form-group {
  margin-bottom: 16px;
  border-radius: 12px;
}

.group-title {
  font-size: 16px;
  font-weight: 600;
  color: #323233;
  padding: 16px;
  background: white;
  border-radius: 12px 12px 0 0;
  margin: 0;
}

/* 头像上传弹窗 */
.avatar-upload-popup {
  padding: 24px;
}

.popup-title {
  font-size: 18px;
  font-weight: 600;
  text-align: center;
  margin-bottom: 24px;
  color: #323233;
}

.upload-options {
  display: flex;
  justify-content: space-around;
  margin-bottom: 24px;
}

.upload-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px;
  cursor: pointer;
  border-radius: 12px;
  transition: background-color 0.3s;
}

.upload-option:hover {
  background-color: #f7f8fa;
}

.upload-option span {
  margin-top: 8px;
  font-size: 14px;
  color: #646566;
}

.cancel-btn {
  border-radius: 12px;
  height: 44px;
}

/* 响应式设计 */
@media (max-width: 375px) {
  .page-content {
    padding: 12px;
  }
  
  .avatar-edit-section {
    padding: 20px 0;
  }
}

:deep(.van-cell){
  border-radius: 8px;
}
</style>