<template>
  <div class="submit-issue-page">
    <!-- 导航栏 -->
    <van-nav-bar :title="pageTitle" left-text="返回" left-arrow @click-left="$router.go(-1)" fixed placeholder />

    <!-- 表单内容 -->
    <div class="form-container">
      <van-form @submit="onSubmit">
        <!-- 问题类型显示 -->
        <!-- <div class="type-indicator">
          <div class="type-badge" :class="issueType">
            <van-icon :name="getTypeIcon(issueType)" />
            <span>{{ getTypeName(issueType) }}</span>
          </div>
        </div> -->

        <!-- 基本信息 -->
        <van-cell-group inset title="基本信息">
          <van-field v-model="form.title" name="title" placeholder="请简要描述您的问题"
            :rules="[{ required: true, message: '请输入内容标题', minlength: 5, maxlength: 25 }]" maxlength="25"
            show-word-limit>
            <template #label>
              <span class="required-label">
                <span class="required-star">*</span>内容标题
              </span>
            </template>
          </van-field>

          <van-field v-model="form.description" name="description" type="textarea" placeholder="请详细描述您遇到的问题或建议"
            :rules="[{ required: true, message: '请填写详细描述' }]" rows="4" maxlength="1000" show-word-limit>
            <template #label>
              <span class="required-label">
                <span class="required-star">*</span>正文内容
              </span>
            </template>
          </van-field>

          <van-field v-model="form.location" name="location" placeholder="请选择发生地区" readonly @click="openLocationPicker"
            :rules="[{ required: true, message: '请选择发生地区' }]">
            <template #label>
              <span class="required-label">
                <span class="required-star">*</span>发生地区
              </span>
            </template>
          </van-field>

          <van-field label="上传附件">
            <template #input>
              <div class="upload-container">
                <div class="uploaded-files">
                  <!-- 已上传的文件列表 -->
                  <div v-for="(item, index) in form.images" :key="index" class="uploaded-item">
                    <!-- 图片文件显示 -->
                    <img v-if="item.type === 'image'" :src="item.url || item.content" alt="上传的图片"
                      class="uploaded-image" />
                    <!-- 非图片文件显示 -->
                    <div v-else class="uploaded-file">
                      <van-icon name="description" class="file-icon" />
                      <div class="file-info">
                        <div class="file-name">{{ item.name }}</div>
                      </div>
                    </div>
                    <van-icon name="cross" class="delete-icon" @click="removeImage(index)" />
                  </div>
                  <!-- 添加附件按钮 -->
                  <div class="add-attachment-btn" @click="showUploadMenu = true">
                    <van-icon name="plus" />
                  </div>
                </div>


              </div>
            </template>
          </van-field>

          <van-cell>
            <template #title>
              <span class="upload-tip">
                <van-icon name="info-o" />
                单个文件不超过10MB
              </span>
            </template>
          </van-cell>

          <van-field label="是否公开到门户网站" class="public-switch">
            <template #input>
              <van-switch v-model="form.isPublic" size="18px" />
            </template>
          </van-field>

          <!-- <van-cell>
            <template #title>
              <span class="switch-tip">
                公开后其他用户可以看到此问题（个人信息不会公开）
              </span>
            </template>
          </van-cell> -->
        </van-cell-group>

        <!-- 联系信息 -->
        <van-cell-group inset title="联系信息">
          <van-field v-model="form.contactName" name="contactName" placeholder="请填写您的姓名"
            :rules="[{ required: true, message: '请填写姓名' }]" maxlength="20">
            <template #label>
              <span class="required-label">
                <span class="required-star">*</span>姓名
              </span>
            </template>
          </van-field>

          <van-field v-model="form.contactPhone" name="contactPhone" placeholder="请填写您的手机号码" :rules="[
            { required: true, message: '请填写手机号码' },
            { pattern: /^1[3-9]\d{9}$/, message: '请填写正确的手机号码' }
          ]" maxlength="11">
            <template #label>
              <span class="required-label" style="height: 30px;">
                <span class="required-star">*</span>手机号
              </span>
            </template>
            <template #button>
              <van-button size="small" type="primary" :disabled="!canSendCode || countdown > 0" :loading="sendingCode"
                @click="sendVerificationCode">
                {{ countdown > 0 ? `${countdown}s后重发` : '发送验证码' }}
              </van-button>
            </template>
          </van-field>

          <van-field v-if="canSendCode" v-model="form.verificationCode" name="verificationCode" placeholder="请输入6位验证码"
            :rules="[
              { required: true, message: '请输入验证码' },
              { pattern: /^\d{6}$/, message: '请输入6位数字验证码' }
            ]" maxlength="6" type="number">
            <template #label>
              <span class="required-label">
                <span class="required-star">*</span>验证码
              </span>
            </template>
          </van-field>

          <van-field v-model="form.contactEmail" name="contactEmail" label="邮箱地址" placeholder="请填写邮箱地址"
            maxlength="50" />
          <van-field name="contactEmail" label="勾选用户须知" />



        </van-cell-group>

        <!-- 提交按钮 -->
        <div class="submit-section">
          <van-button type="primary" native-type="submit" block round :loading="submitting" loading-text="提交中...">
            提交
          </van-button>
        </div>
      </van-form>
    </div>

    <!-- 时间选择器 -->
    <van-popup v-model:show="showTimePicker" position="bottom">
      <van-datetime-picker v-model="selectedTime" type="datetime" title="选择时间" @confirm="onTimeConfirm"
        @cancel="showTimePicker = false" />
    </van-popup>

    <!-- 地点选择器 -->
    <van-popup v-model:show="showLocationPicker" position="bottom">
      <van-picker :columns="locationPickerColumns" title="选择地点" @confirm="onLocationConfirm"
        @cancel="showLocationPicker = false" @change="onLocationPickerChange" />
    </van-popup>

    <!-- 上传选择菜单 -->
    <van-action-sheet v-model:show="showUploadMenu" title="选择上传方式" cancel-text="取消">
      <div class="upload-actions">
        <div class="upload-action-item" @click="handleCameraUpload">
          <van-icon name="photograph" />
          <span>拍摄</span>
        </div>
        <div class="upload-action-item" @click="handleGalleryUpload">
          <van-icon name="photo-o" />
          <span>从手机相册选择</span>
        </div>
        <div class="upload-action-item" @click="handleChatUpload">
          <van-icon name="chat-o" />
          <span>从聊天会话选择</span>
        </div>
      </div>
    </van-action-sheet>

    <!-- 隐藏的文件输入框 -->
    <input ref="cameraInput" type="file" accept="image/*" capture="camera" style="display: none"
      @change="onFileSelect" />
    <input ref="galleryInput" type="file" accept="image/*" multiple style="display: none" @change="onFileSelect" />
    <input ref="chatInput" type="file" multiple style="display: none" @change="onFileSelect" />


  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast } from 'vant'

export default {
  name: 'SubmitIssuePage',
  setup() {
    const route = useRoute()
    const router = useRouter()

    const issueType = ref(route.query.type || 'complaint')
    const submitting = ref(false)
    const showTimePicker = ref(false)
    const selectedTime = ref(new Date())
    const showUploadMenu = ref(false)
    const queryCode = ref('')
    const cameraInput = ref(null)
    const galleryInput = ref(null)
    const chatInput = ref(null)
    const sendingCode = ref(false)
    const countdown = ref(0)
    const serverVerificationCode = ref('')
    const showLocationPicker = ref(false)
    const selectedProvince = ref('')
    const selectedCity = ref('')
    const selectedDistrict = ref('')
    const provinces = ref([])
    const cities = ref([])
    const districts = ref([])
    const locationPickerColumns = ref([[], [], []])

    // 表单数据
    const form = reactive({
      title: '',
      description: '',
      location: '',
      happenTime: '',
      contactName: '',
      contactPhone: '',
      contactEmail: '',
      verificationCode: '',
      images: [],
      isPublic: false,
      urgency: 'low'
    })

    // 页面标题
    const pageTitle = computed(() => {
      return getTypeName(issueType.value)
    })

    // 是否可以发送验证码
    const canSendCode = computed(() => {
      return form.contactPhone && /^1[3-9]\d{9}$/.test(form.contactPhone)
    })

    // 省市区数据
    const locationData = {
      '北京市': {
        '北京市': ['东城区', '西城区', '朝阳区', '丰台区', '石景山区', '海淀区', '门头沟区', '房山区', '通州区', '顺义区', '昌平区', '大兴区', '怀柔区', '平谷区', '密云区', '延庆区']
      },
      '上海市': {
        '上海市': ['黄浦区', '徐汇区', '长宁区', '静安区', '普陀区', '虹口区', '杨浦区', '闵行区', '宝山区', '嘉定区', '浦东新区', '金山区', '松江区', '青浦区', '奉贤区', '崇明区']
      },
      '天津市': {
        '天津市': ['和平区', '河东区', '河西区', '南开区', '河北区', '红桥区', '东丽区', '西青区', '津南区', '北辰区', '武清区', '宝坻区', '滨海新区', '宁河区', '静海区', '蓟州区']
      },
      '重庆市': {
        '重庆市': ['万州区', '涪陵区', '渝中区', '大渡口区', '江北区', '沙坪坝区', '九龙坡区', '南岸区', '北碚区', '綦江区', '大足区', '渝北区', '巴南区', '黔江区', '长寿区', '江津区', '合川区', '永川区', '南川区', '璧山区', '铜梁区', '潼南区', '荣昌区', '开州区', '梁平区', '武隆区']
      },
      '广东省': {
        '广州市': ['荔湾区', '越秀区', '海珠区', '天河区', '白云区', '黄埔区', '番禺区', '花都区', '南沙区', '从化区', '增城区'],
        '深圳市': ['罗湖区', '福田区', '南山区', '宝安区', '龙岗区', '盐田区', '龙华区', '坪山区', '光明区', '大鹏新区'],
        '珠海市': ['香洲区', '斗门区', '金湾区'],
        '佛山市': ['禅城区', '南海区', '顺德区', '三水区', '高明区'],
        '东莞市': ['东莞市'],
        '中山市': ['中山市']
      },
      '江苏省': {
        '南京市': ['玄武区', '秦淮区', '建邺区', '鼓楼区', '浦口区', '栖霞区', '雨花台区', '江宁区', '六合区', '溧水区', '高淳区'],
        '苏州市': ['虎丘区', '吴中区', '相城区', '姑苏区', '吴江区', '常熟市', '张家港市', '昆山市', '太仓市'],
        '无锡市': ['锡山区', '惠山区', '滨湖区', '梁溪区', '新吴区', '江阴市', '宜兴市']
      },
      '浙江省': {
        '杭州市': ['上城区', '下城区', '江干区', '拱墅区', '西湖区', '滨江区', '萧山区', '余杭区', '富阳区', '临安区', '桐庐县', '淳安县', '建德市'],
        '宁波市': ['海曙区', '江北区', '北仑区', '镇海区', '鄞州区', '奉化区', '象山县', '宁海县', '余姚市', '慈溪市'],
        '温州市': ['鹿城区', '龙湾区', '瓯海区', '洞头区', '永嘉县', '平阳县', '苍南县', '文成县', '泰顺县', '瑞安市', '乐清市']
      }
    }

    // 初始化省份数据
    const initLocationData = () => {
      provinces.value = Object.keys(locationData).map(province => ({ text: province, value: province }))
      locationPickerColumns.value[0] = provinces.value

      // 初始化第一个省份的城市数据
      if (provinces.value.length > 0) {
        const firstProvince = provinces.value[0].value
        selectedProvince.value = firstProvince

        const cityData = locationData[firstProvince] || {}
        cities.value = Object.keys(cityData).map(city => ({ text: city, value: city }))
        locationPickerColumns.value[1] = cities.value

        // 初始化第一个城市的区县数据
        if (cities.value.length > 0) {
          const firstCity = cities.value[0].value
          selectedCity.value = firstCity

          const districtData = locationData[firstProvince]?.[firstCity] || []
          districts.value = districtData.map(district => ({ text: district, value: district }))
          locationPickerColumns.value[2] = districts.value

          // 设置默认选中第一个区县
          if (districts.value.length > 0) {
            selectedDistrict.value = districts.value[0].value
          }
        }
      }
    }

    // 省份选择变化
    const onProvinceChange = (province) => {
      selectedProvince.value = province
      selectedCity.value = ''
      selectedDistrict.value = ''

      const cityData = locationData[province] || {}
      cities.value = Object.keys(cityData).map(city => ({ text: city, value: city }))
      locationPickerColumns.value[1] = cities.value

      // 自动选择第一个城市并初始化区县数据
      if (cities.value.length > 0) {
        const firstCity = cities.value[0].value
        selectedCity.value = firstCity

        const districtData = locationData[province]?.[firstCity] || []
        districts.value = districtData.map(district => ({ text: district, value: district }))
        locationPickerColumns.value[2] = districts.value

        // 自动选择第一个区县
        if (districts.value.length > 0) {
          selectedDistrict.value = districts.value[0].value
        }
      } else {
        locationPickerColumns.value[2] = []
        districts.value = []
      }
    }

    // 城市选择变化
    const onCityChange = (city) => {
      selectedCity.value = city
      selectedDistrict.value = ''

      const districtData = locationData[selectedProvince.value]?.[city] || []
      districts.value = districtData.map(district => ({ text: district, value: district }))
      locationPickerColumns.value[2] = districts.value

      // 自动选择第一个区县
      if (districts.value.length > 0) {
        selectedDistrict.value = districts.value[0].value
      }
    }

    // 区县选择变化
    const onDistrictChange = (district) => {
      selectedDistrict.value = district
    }

    // 地点选择确认
    const onLocationConfirm = (values) => {
      // 处理 Vant Picker 的确认事件参数
      let selectedValues = []

      // 如果 values 是对象（包含 selectedValues 属性）
      if (values && typeof values === 'object' && values.selectedValues) {
        selectedValues = values.selectedValues
      }
      // 如果 values 是数组
      else if (Array.isArray(values)) {
        selectedValues = values
      }
      // 如果都不是，使用当前选中的值
      else {
        selectedValues = [selectedProvince.value, selectedCity.value, selectedDistrict.value]
      }

      const [province, city, district] = selectedValues
      let location = ''
      if (province) location += province
      if (city && city !== province) location += city
      if (district) location += district

      form.location = location
      showLocationPicker.value = false
    }

    // 打开地点选择器
    const openLocationPicker = () => {
      showLocationPicker.value = true
    }

    // 地点选择器变化处理
    const onLocationPickerChange = (values, index) => {
      if (index === 0) {
        // 省份变化
        onProvinceChange(values[0])
      } else if (index === 1) {
        // 城市变化
        onCityChange(values[1])
      } else if (index === 2) {
        // 区县变化
        onDistrictChange(values[2])
      }
    }

    // 获取类型名称
    function getTypeName(type) {
      const typeMap = {
        complaint: '我有诉求',
        suggestion: '我要建言',
        consultation: '我要咨询',
        report: '我要爆料'
      }
      return typeMap[type] || '问题反馈'
    }

    // 获取类型图标
    function getTypeIcon(type) {
      const iconMap = {
        complaint: 'warning-o',
        suggestion: 'bulb-o',
        consultation: 'question-o',
        report: 'photo-o'
      }
      return iconMap[type] || 'chat-o'
    }

    // 时间确认
    const onTimeConfirm = (value) => {
      form.happenTime = formatDateTime(value)
      showTimePicker.value = false
    }

    // 格式化日期时间
    const formatDateTime = (date) => {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      return `${year}-${month}-${day} ${hours}:${minutes}`
    }

    // 格式化文件大小
    const formatFileSize = (bytes) => {
      if (bytes === 0) return '0 B'
      const k = 1024
      const sizes = ['B', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    // 发送验证码
    const sendVerificationCode = async () => {
      if (!canSendCode.value || countdown.value > 0) {
        return
      }

      sendingCode.value = true

      try {
        // 模拟发送验证码接口
        await new Promise(resolve => setTimeout(resolve, 1000))

        // 生成6位随机验证码（实际项目中由服务器生成）
        const code = Math.floor(100000 + Math.random() * 900000).toString()
        serverVerificationCode.value = code

        // 在开发环境下显示验证码（实际项目中不应该显示）
        console.log('验证码:', code)
        showToast(`验证码已发送至 ${form.contactPhone}`)

        // 开始倒计时
        startCountdown()

      } catch (error) {
        showToast('发送失败，请重试')
      } finally {
        sendingCode.value = false
      }
    }

    // 开始倒计时
    const startCountdown = () => {
      countdown.value = 60
      const timer = setInterval(() => {
        countdown.value--
        if (countdown.value <= 0) {
          clearInterval(timer)
        }
      }, 1000)
    }

    // 文件大小超限
    const onOversize = () => {
      showToast('文件大小不能超过5MB')
    }

    // 移除图片
    const removeImage = (index) => {
      form.images.splice(index, 1)
    }

    // 处理相机拍摄
    const handleCameraUpload = () => {
      showUploadMenu.value = false
      cameraInput.value?.click()
    }

    // 处理相册选择
    const handleGalleryUpload = () => {
      showUploadMenu.value = false
      galleryInput.value?.click()
    }

    // 处理聊天会话选择
    const handleChatUpload = () => {
      showUploadMenu.value = false
      chatInput.value?.click()
    }

    // 处理文件选择
    const onFileSelect = (event) => {
      const files = Array.from(event.target.files)
      const isFromChat = event.target === chatInput.value

      files.forEach(file => {
        // 检查文件大小
        if (file.size > 10 * 1024 * 1024) {
          showToast('文件大小不能超过10MB')
          return
        }

        // 对于相机和相册，只允许图片文件
        if (!isFromChat && (!file.type || !file.type.startsWith('image/'))) {
          showToast('只能上传图片文件')
          return
        }

        // 检查数量限制
        if (form.images.length >= 5) {
          showToast('最多只能上传5个文件')
          return
        }

        // 创建文件对象
        if (file.type && file.type.startsWith('image/')) {
          // 图片文件，生成预览
          const reader = new FileReader()
          reader.onload = (e) => {
            form.images.push({
              file: file,
              url: e.target.result,
              content: e.target.result,
              type: 'image',
              name: file.name,
              size: file.size
            })
          }
          reader.readAsDataURL(file)
        } else {
          // 非图片文件，只保存文件信息
          form.images.push({
            file: file,
            url: null,
            content: null,
            type: 'file',
            name: file.name,
            size: file.size,
            fileType: file.type || 'unknown'
          })
        }
      })

      // 清空input值，允许重复选择同一文件
      event.target.value = ''
    }

    // 生成查询码
    const generateQueryCode = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
      let result = ''
      for (let i = 0; i < 8; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length))
      }
      return result
    }

    // 验证码校验
    const validateVerificationCode = () => {
      if (!form.verificationCode) {
        showToast('请输入验证码')
        return false
      }

      if (form.verificationCode !== serverVerificationCode.value) {
        showToast('验证码错误，请重新输入')
        return false
      }

      return true
    }

    // 提交表单
    const onSubmit = async (values) => {
      // 验证码校验
      if (!validateVerificationCode()) {
        return
      }

      submitting.value = true

      try {
        // 模拟提交请求
        await new Promise(resolve => setTimeout(resolve, 2000))

        // 生成查询码
        queryCode.value = generateQueryCode()

        showToast('提交成功')

        // 跳转到提交结果页面
        router.push({
          path: '/submit-result',
          query: {
            type: issueType.value,
            queryCode: queryCode.value
          }
        })
      } catch (error) {
        showToast('提交失败，请重试')
      } finally {
        submitting.value = false
      }
    }

    // 成功确认（保留以防其他地方使用）
    const onSuccessConfirm = () => {
      showSuccessDialog.value = false
      router.push('/appeal')
    }

    onMounted(() => {
      // 验证用户是否已同意留言说明（使用sessionStorage，每次会话都需要重新同意）
      const hasAgreed = sessionStorage.getItem('message_guidelines_agreed_current_session')

      console.log('[SubmitIssue] onMounted 验证留言说明状态:', {
        hasAgreed,
        timestamp: new Date().toLocaleTimeString()
      })

      if (!hasAgreed || hasAgreed !== 'true') {
        console.log('[SubmitIssue] 未同意留言说明，重定向到留言说明页面')
        // 如果未同意，重定向到留言说明页面
        router.push({
          path: '/message-guidelines',
          query: { redirect: '/submit-issue' }
        })
        return
      } else {
        console.log('[SubmitIssue] 已同意留言说明，继续初始化页面')
      }

      // 设置默认时间为当前时间
      form.happenTime = formatDateTime(new Date())
      // 初始化地点数据
      initLocationData()
    })

    return {
      issueType,
      form,
      submitting,
      showTimePicker,
      selectedTime,
      showUploadMenu,
      cameraInput,
      galleryInput,
      chatInput,
      sendingCode,
      countdown,
      canSendCode,
      showLocationPicker,
      selectedProvince,
      selectedCity,
      selectedDistrict,
      locationPickerColumns,
      pageTitle,
      getTypeName,
      getTypeIcon,
      onTimeConfirm,
      formatFileSize,
      onOversize,
      removeImage,
      handleCameraUpload,
      handleGalleryUpload,
      handleChatUpload,
      onFileSelect,
      sendVerificationCode,
      validateVerificationCode,
      openLocationPicker,
      onLocationConfirm,
      onLocationPickerChange,
      onSubmit,
      onSuccessConfirm
    }
  }
}
</script>

<style scoped>
.submit-issue-page {
  background: #f7f8fa;
  min-height: 100vh;
  padding-bottom: 20px;
}

.form-container {
  /* padding: 16px; */
  margin-bottom: 70px;
}

/* 类型指示器 */
.type-indicator {
  margin-bottom: 16px;
  text-align: center;
}

.type-badge {
  display: inline-flex;
  align-items: center;
  padding: 8px 16px;
  border-radius: 20px;
  color: white;
  font-size: 14px;
  font-weight: bold;
}

.type-badge.complaint {
  background: linear-gradient(135deg, #ff6b6b, #ee5a52);
}

.type-badge.suggestion {
  background: linear-gradient(135deg, #4ecdc4, #44a08d);
}

.type-badge.consultation {
  background: linear-gradient(135deg, #45b7d1, #96c93d);
}

.type-badge.report {
  background: linear-gradient(135deg, #f093fb, #f5576c);
}

.type-badge .van-icon {
  margin-right: 4px;
  font-size: 16px;
}

/* 表单组 */
:deep(.van-cell-group) {
  margin-bottom: 16px;
  border-radius: 12px;
  overflow: hidden;
}

:deep(.van-cell-group__title) {
  padding: 16px 16px 8px;
  font-weight: bold;
  color: #333;
}

/* 必填字段星号样式 */
.required-label {
  display: flex;
  align-items: center;
}

.required-star {
  color: #FF0000;
  margin-right: 4px;
  font-weight: bold;
}

/* 验证码按钮样式 */
:deep(.van-field__button .van-button) {
  height: 32px;
  font-size: 13px;
  border-radius: 16px;
  min-width: 80px;
}

:deep(.van-field__button .van-button--disabled) {
  background-color: #f5f5f5;
  color: #c8c9cc;
  border-color: #f5f5f5;
}

/* 上传提示 */
.upload-tip,
.switch-tip {
  display: flex;
  align-items: center;
  font-size: 12px;
  color: #666;
  line-height: 1.4;
}

.upload-tip .van-icon {
  margin-right: 4px;
  color: #1989fa;
}

/* 提交区域 */
.submit-section {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  padding: 12px 16px;
  border-top: 1px solid #ebedf0;
  display: flex;
  gap: 12px;
}

.submit-section .van-button {
  height: 48px;
  font-size: 16px;
  font-weight: bold;
}

/* 单选组 */
:deep(.van-radio-group--horizontal) {
  display: flex;
  gap: 16px;
}

:deep(.van-radio) {
  flex: 1;
}

/* 上传容器样式 */
.upload-container {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 8px;
}

.uploaded-files {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  width: 100%;
}

.uploaded-item {
  position: relative;
  width: 80px;
  height: 80px;
  border-radius: 5px;
  /* overflow: hidden; */
  border: 1px solid #eee;
}

.uploaded-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 5px;
}

.uploaded-file {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
  padding: 8px;
  box-sizing: border-box;
}

.file-icon {
  font-size: 24px;
  color: #1989fa;
  margin-bottom: 4px;
}

.file-info {
  text-align: center;
  width: 100%;
}

.file-name {
  font-size: 10px;
  color: #333;
  line-height: 1.2;
  word-break: break-all;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  margin-bottom: 2px;
}

.file-size {
  font-size: 9px;
  color: #666;
  line-height: 1;
}

.delete-icon {
  position: absolute;
  top: -6px;
  right: -6px;
  width: 20px;
  height: 20px;
  background: #ff4444;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.add-attachment-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  border: 2px dashed #ddd;
  border-radius: 8px;
  background: #fafafa;
  cursor: pointer;
  transition: all 0.3s ease;
}

.add-attachment-btn:hover {
  border-color: #1989fa;
  background: #f0f8ff;
}

.add-attachment-btn:active {
  transform: scale(0.95);
}

.add-attachment-btn .van-icon {
  font-size: 24px;
  color: #999;
  margin-bottom: 4px;
}

.add-attachment-btn span {
  font-size: 12px;
  color: #666;
}

/* 上传操作菜单样式 */
.upload-actions {
  padding: 20px 0;
}

.upload-action-item {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.upload-action-item:hover {
  background-color: #f5f5f5;
}

.upload-action-item:active {
  background-color: #e8e8e8;
}

.upload-action-item .van-icon {
  font-size: 20px;
  color: #1989fa;
  margin-right: 12px;
  width: 24px;
  text-align: center;
}

.upload-action-item span {
  font-size: 16px;
  color: #333;
}

/* 响应式设计 */
@media (max-width: 375px) {
  .form-container {
    /* padding: 12px; */
  }

  .submit-section {
    /* padding: 0 12px; */
  }

  .type-badge {
    padding: 6px 12px;
    font-size: 13px;
  }
}

/* 深色模式适配 */
@media (prefers-color-scheme: dark) {
  .submit-issue-page {
    background: #1a1a1a;
  }

  :deep(.van-cell-group__title) {
    color: #fff;
  }

  .upload-tip,
  .switch-tip {
    color: #ccc;
  }
}

:deep(.van-field__label) {
  width: 70px;
}

:deep(.public-switch .van-field__label) {
  width: 130px;
}
</style>