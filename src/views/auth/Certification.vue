<template>
  <div class="certification">
    <van-nav-bar 
      title="认证中心" 
      left-text="返回" 
      left-arrow 
      @click-left="onBack" 
      fixed 
    />
    
    <div class="certification-content">
      <van-form @submit="onSubmit" ref="formRef">
        <!-- 个人信息 -->
        <div class="form-section">
          <h3 class="section-title">个人信息</h3>
          
          <van-field
            v-model="formData.realName"
            name="realName"
            label="真实姓名"
            placeholder="请输入真实姓名"
            :rules="nameRules"
            maxlength="20"
          />
          
          <van-field
            v-model="formData.idCard"
            name="idCard"
            label="身份证号"
            placeholder="请输入18位身份证号码"
            :rules="idCardRules"
            maxlength="18"
          />
          
          <van-field
            v-model="formData.region"
            name="region"
            label="所在地区"
            placeholder="请选择省市区"
            readonly
            is-link
            :rules="[{ required: true, message: '请选择所在地区' }]"
            @click="showAreaPicker = true"
          />

          <van-field
            v-model="formData.introduction"
            name="introduction"
            label="个人简介"
            type="textarea"
            placeholder="请简要介绍您的个人情况（200字以内）"
            :rules="[{ required: true, message: '请填写个人简介' }]"
            rows="4"
            maxlength="200"
            show-word-limit
          />
        </div>

        <!-- 证件上传 -->
        <div class="form-section">
          <h3 class="section-title">证件上传</h3>
          
          <div class="upload-section">
            <div class="upload-item">
              <div class="upload-label">
                <span class="required">*</span>
                手持身份证正面照片
              </div>
              <div class="upload-tip">请确保面部和证件信息清晰可见</div>
              <van-uploader
                v-model="formData.idCardFront"
                :max-count="1"
                :max-size="5 * 1024 * 1024"
                accept="image/*"
                @oversize="onOversize"
                @delete="onDeleteFront"
                upload-text="上传照片"
                class="custom-uploader"
              >
                <template #preview-cover="{ file }">
                  <div class="preview-cover">
                    <van-icon name="eye-o" @click="previewImage(file.url)" />
                    <van-icon name="delete-o" @click="onDeleteFront" />
                  </div>
                </template>
              </van-uploader>
            </div>
            
            <div class="upload-item">
              <div class="upload-label">
                <span class="required">*</span>
                身份证反面照片
              </div>
              <div class="upload-tip">请确保国徽面和有效期信息清晰可见</div>
              <van-uploader
                v-model="formData.idCardBack"
                :max-count="1"
                :max-size="5 * 1024 * 1024"
                accept="image/*"
                @oversize="onOversize"
                @delete="onDeleteBack"
                upload-text="上传照片"
                class="custom-uploader"
              >
                <template #preview-cover="{ file }">
                  <div class="preview-cover">
                    <van-icon name="eye-o" @click="previewImage(file.url)" />
                    <van-icon name="delete-o" @click="onDeleteBack" />
                  </div>
                </template>
              </van-uploader>
            </div>
          </div>
        </div>

        <!-- 提交按钮 -->
        <div class="submit-section">
          <van-button 
            type="primary" 
            native-type="submit" 
            block 
            :loading="submitting"
            :disabled="!canSubmit"
          >
            {{ submitting ? '提交中...' : '提交认证申请' }}
          </van-button>
        </div>
      </van-form>
    </div>

    <!-- 地区选择弹窗 -->
    <van-popup v-model:show="showAreaPicker" position="bottom">
      <van-area
        :area-list="areaList"
        @confirm="onAreaConfirm"
        @cancel="showAreaPicker = false"
        title="选择地区"
      />
    </van-popup>

    <!-- 图片预览 -->
    <van-image-preview
      v-model:show="showImagePreview"
      :images="previewImages"
      :start-position="previewIndex"
    />
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showSuccessToast, showConfirmDialog } from 'vant'

export default {
  name: 'Certification',
  setup() {
    const router = useRouter()
    const formRef = ref()
    const submitting = ref(false)
    const showAreaPicker = ref(false)
    const showImagePreview = ref(false)
    const previewImages = ref([])
    const previewIndex = ref(0)

    // 表单数据
    const formData = ref({
      region: '',
      realName: '',
      idCard: '',
      introduction: '',
      idCardFront: [],
      idCardBack: []
    })

    // 地区数据（简化版，实际项目中应该从API获取）
    const areaList = ref({
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
        130200: '唐山市',
        310100: '上海市',
        320100: '南京市',
        320200: '无锡市',
        440100: '广州市',
        440300: '深圳市'
      },
      county_list: {
        110101: '东城区',
        110102: '西城区',
        110105: '朝阳区',
        110106: '丰台区',
        120101: '和平区',
        120102: '河东区',
        310101: '黄浦区',
        310104: '徐汇区',
        320102: '玄武区',
        320104: '秦淮区',
        440103: '荔湾区',
        440104: '越秀区',
        440305: '南山区',
        440306: '宝安区'
      }
    })

    // 姓名验证规则
    const nameRules = [
      { required: true, message: '请输入真实姓名' },
      { 
        pattern: /^[\u4e00-\u9fa5]{2,20}$/, 
        message: '姓名应为2-20位中文字符' 
      }
    ]

    // 身份证验证规则
    const idCardRules = [
      { required: true, message: '请输入身份证号码' },
      { 
        validator: (val) => {
          if (!val) return true
          // 18位身份证号码验证
          const reg = /^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/
          if (!reg.test(val)) {
            return '请输入正确的18位身份证号码'
          }
          
          // 校验码验证
          const factor = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2]
          const parity = [1, 0, 'X', 9, 8, 7, 6, 5, 4, 3, 2]
          let sum = 0
          for (let i = 0; i < 17; i++) {
            sum += val[i] * factor[i]
          }
          const last = parity[sum % 11]
          if (last != val[17].toUpperCase()) {
            return '身份证号码校验位错误'
          }
          return true
        }
      }
    ]

    // 检查是否可以提交
    const canSubmit = computed(() => {
      return formData.value.region &&
             formData.value.realName &&
             formData.value.idCard &&
             formData.value.introduction &&
             formData.value.idCardFront.length > 0 &&
             formData.value.idCardBack.length > 0
    })

    // 地区选择确认
    const onAreaConfirm = (value) => {
      if (value && value.selectedOptions && Array.isArray(value.selectedOptions)) {
        formData.value.region = value.selectedOptions.map(option => option.text).join('/')
      }
      showAreaPicker.value = false
    }

    // 文件大小超限
    const onOversize = () => {
      showToast('文件大小不能超过5MB')
    }

    // 删除正面照片
    const onDeleteFront = () => {
      formData.value.idCardFront = []
    }

    // 删除反面照片
    const onDeleteBack = () => {
      formData.value.idCardBack = []
    }

    // 预览图片
    const previewImage = (url) => {
      previewImages.value = [url]
      previewIndex.value = 0
      showImagePreview.value = true
    }

    // 返回上一页
    const onBack = () => {
      if (canSubmit.value) {
        showConfirmDialog({
          title: '提示',
          message: '您已填写部分信息，确定要离开吗？'
        }).then(() => {
          router.back()
        }).catch(() => {
          // 取消
        })
      } else {
        router.back()
      }
    }

    // 提交表单
    const onSubmit = async () => {
      try {
        submitting.value = true
        
        // 模拟提交请求
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        showSuccessToast('认证申请提交成功！我们将在3-5个工作日内完成审核')
        
        setTimeout(() => {
          router.back()
        }, 1500)
        
      } catch (error) {
        showToast('提交失败，请重试')
      } finally {
        submitting.value = false
      }
    }

    return {
      formRef,
      formData,
      submitting,
      showAreaPicker,
      showImagePreview,
      previewImages,
      previewIndex,
      areaList,
      nameRules,
      idCardRules,
      canSubmit,
      onAreaConfirm,
      onOversize,
      onDeleteFront,
      onDeleteBack,
      previewImage,
      onBack,
      onSubmit
    }
  }
}
</script>

<style scoped>
.certification {
  background: #f7f8fa;
  min-height: 100vh;
}

.certification-content {
  margin-top: 46px;
  padding: 16px;
}

.form-section {
  background: white;
  border-radius: 8px;
  margin-bottom: 16px;
  overflow: hidden;
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  color: #323233;
  padding: 16px 16px 8px;
  margin: 0;
  border-bottom: 1px solid #ebedf0;
}

.upload-section {
  padding: 16px;
}

.upload-item {
  margin-bottom: 24px;
}

.upload-item:last-child {
  margin-bottom: 0;
}

.upload-label {
  font-size: 14px;
  color: #323233;
  margin-bottom: 4px;
  font-weight: 500;
}

.required {
  color: #ee0a24;
  margin-right: 4px;
}

.upload-tip {
  font-size: 12px;
  color: #969799;
  margin-bottom: 12px;
  line-height: 1.4;
}

.custom-uploader {
  margin-top: 8px;
}

.preview-cover {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.3);
  color: white;
}

.preview-cover .van-icon {
  margin: 0 8px;
  font-size: 20px;
}

.submit-section {
  margin-top: 24px;
  padding: 0 16px 32px;
}

/* 表单字段样式调整 */
:deep(.van-field__label) {
  width: 80px;
  color: #323233;
  font-weight: 500;
}

:deep(.van-field__control) {
  color: #323233;
}

:deep(.van-field--error .van-field__control) {
  color: #ee0a24;
}

/* 上传组件样式调整 */
:deep(.van-uploader__upload) {
  width: 80px;
  height: 80px;
  border: 2px dashed #dcdee0;
  border-radius: 8px;
  background: #fafafa;
}

:deep(.van-uploader__upload:active) {
  background: #f2f3f5;
}

:deep(.van-uploader__preview) {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
}

:deep(.van-uploader__preview-image) {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 地区选择器样式 */
:deep(.van-area__header) {
  padding: 16px;
  border-bottom: 1px solid #ebedf0;
}

:deep(.van-area__title) {
  font-size: 16px;
  font-weight: bold;
}
</style>