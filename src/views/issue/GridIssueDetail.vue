<template>
  <div class="issue-detail">
    <!-- 导航栏 -->
    <van-nav-bar title="问题详情" left-text="返回" left-arrow fixed @click-left="onBack" />

    <!-- 加载状态 -->
    <van-loading v-if="loading" class="loading-container" vertical>
      加载中...
    </van-loading>

    <!-- 详情内容 -->
    <div v-else-if="issue" class="detail-content">
      <!-- 问题基本信息 -->
      <div class="issue-card">
        <div class="issue-header">
          <h2 class="issue-title">{{ issue.title }}</h2>
          <van-tag :type="getStatusType(issue.status)" :color="getStatusColor(issue.status)" class="status-tag">
            {{ getStatusText(issue.status) }}
          </van-tag>
        </div>

        <div class="issue-meta">
          <div class="meta-item">
            <van-icon name="bookmark-o" />
            <span class="label">诉求分类</span>
            <span class="value">{{ issue.category }}</span>
          </div>
          <div class="meta-item">
            <van-icon name="manager-o" />
            <span class="label">受理部门</span>
            <span class="value">{{ issue.department }}</span>
          </div>
          <div class="meta-item">
            <van-icon name="clock-o" />
            <span class="label">提交时间</span>
            <span class="value">{{ formatDateTime(issue.created_at) }}</span>
          </div>
        </div>


      </div>

      <div class="issue-content">
        <p class="content-text">{{ issue.content }}</p>

        <!-- 附件展示 -->
        <div v-if="issue.attachments && issue.attachments.length > 0" class="attachments-section">
          <AttachmentViewer :attachments="issue.attachments" :type="'big'" />
        </div>
      </div>

      <div class="department-replies" v-if="replies.length > 0">
        <h3 class="section-title">留言</h3>
        <div class="replies-list">
          <div v-for="(reply, index) in replies" :key="index" class="reply-item">
            <div class="reply-header">
              <span class="department-name">{{ reply.creator_name }}</span>
              <span class="reply-time">{{ reply.created_at }}</span>
            </div>
            <div class="reply-content-wrapper">
              <p class="reply-content"
                :class="{ 'reply-content-truncated': !expandedDepartmentReplies[index] && isContentTooLong(reply.content) }">
                {{ reply.content }}
              </p>
              <span v-if="isContentTooLong(reply.content)" class="expand-button" @click="toggleDepartmentReply(index)">
                {{ expandedDepartmentReplies[index] ? '收起' : '展开' }}
              </span>

              <div v-if="reply.attachments && reply.attachments.length > 0">
                <AttachmentViewer :attachments="reply.attachments" />
              </div>

            </div>
          </div>
        </div>
      </div>

      <!-- 评价展示 -->
      <div v-if="review" class="evaluation-card">
        <h3>我的评价</h3>
        <div class="evaluation-content">
          <div class="rating-display">
            <van-rate v-model="review.rating" readonly allow-half :size="24" />
          </div>
          <div v-if="review.comment" class="comment-display">
            <p>{{ review.comment }}</p>
          </div>
          <div class="evaluation-time">
            {{ review.created_at }}
          </div>
        </div>
      </div>
    </div>

    <!-- 错误状态 -->
    <div v-else class="error-state">
      <van-empty description="问题不存在或已被删除" />
      <van-button type="primary" @click="onBack">返回列表</van-button>
    </div>

    <!-- 底部操作栏 -->
    <div v-if="issue" class="bottom-actions">
      <!-- 催办按钮 -->
      <van-button v-if="canShowUrgeButton" :type="'warning'" size="large" :disabled="!canUrgeToday" :loading="isUrging"
        @click="onUrgeClick" class="action-button urge-button">
        {{ isUrging ? '催办中...' : (canUrgeToday ? '催办处理' : '今日已催办') }}
      </van-button>

      <!-- 评价按钮 -->
      <van-button v-if="canShowEvaluateButton" type="primary" size="large" @click="onEvaluateClick"
        class="action-button">
        提交评价
      </van-button>
    </div>

    <!-- 催办确认弹窗 -->
    <van-dialog v-model:show="showUrgeDialog" title="催办确认" message="确定要催办此问题吗？每天只能催办一次。" show-cancel-button
      @confirm="confirmUrge" />

    <!-- 评价弹窗 -->
    <van-popup v-model:show="showEvaluatePopup" position="bottom" :style="{ height: '70%' }">
      <div class="evaluate-popup">
        <div class="popup-header">
          <h3>问题评价</h3>
          <van-icon name="cross" @click="closeEvaluatePopup" />
        </div>

        <div class="evaluate-form">
          <div class="rating-section">
            <label>满意度评分 <span class="required">*</span></label>
            <van-rate v-model="evaluateForm.rating" allow-half :size="24" @change="onRatingChange" />
            <span class="rating-desc">{{ getRatingText(evaluateForm.rating) }}</span>
          </div>

          <div class="comment-section">
            <label>评价内容</label>
            <van-field v-model="evaluateForm.comment" type="textarea" placeholder="请输入您的评价和建议..." rows="4"
              maxlength="200" show-word-limit />
          </div>

          <div class="popup-actions">
            <van-button type="primary" size="large" :disabled="!canSubmitEvaluation" :loading="evaluateForm.submitting"
              @click="submitEvaluation" block>
              提交评价
            </van-button>
          </div>
        </div>
      </div>
    </van-popup>

    <!-- 图片预览 -->
    <van-image-preview v-model:show="showImagePreview" :images="previewImages" :start-position="previewIndex" />
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast, showSuccessToast } from 'vant'
import {
  getIssueById,
  getRepliesByIssueId,
  getReviewByIssueId,
  getRemindersByIssueId,
  submitReview,
  IssueStatus,
  StatusText,
  StatusColor,
  IssueStatusManager
} from '@/data/mockIssueData.js'
import AttachmentViewer from '@/components/AttachmentViewer.vue'

export default {
  name: 'UserIssueDetail',
  components: {
    AttachmentViewer
  },
  setup() {
    const route = useRoute()
    const router = useRouter()

    const loading = ref(true)
    const issue = ref(null)
    const replies = ref([])
    const review = ref(null)
    const reminders = ref([])

    const showUrgeDialog = ref(false)
    const showEvaluatePopup = ref(false)
    const showImagePreview = ref(false)
    const previewImages = ref([])
    const previewIndex = ref(0)

    // 催办按钮状态管理
    const isUrging = ref(false) // 催办进行中状态
    const hasUrgedToday = ref(false) // 今日是否已催办（本地状态）

    const evaluateForm = ref({
      rating: 3,
      comment: '',
      submitting: false
    })

    // 计算属性
    const canShowUrgeButton = computed(() => {
      return issue.value && IssueStatusManager.canUrge(issue.value)
    })

    // 部门留言展开状态管理
    const expandedDepartmentReplies = ref({})

    const canShowEvaluateButton = computed(() => {
      return issue.value &&
        issue.value.status === IssueStatus.RESOLVED &&
        !review.value
    })

    const canUrgeToday = computed(() => {
      if (!issue.value) return false
      // 如果正在催办中或本地状态显示今日已催办，则不可催办
      if (isUrging.value || hasUrgedToday.value) return false
      // 否则检查系统状态
      return IssueStatusManager.canUrgeToday(issue.value.id)
    })

    const canSubmitEvaluation = computed(() => {
      return evaluateForm.value.rating > 0 && !evaluateForm.value.submitting
    })

    // 获取状态类型
    const getStatusType = (status) => {
      const typeMap = {
        [IssueStatus.PENDING]: 'warning',
        [IssueStatus.PROCESSING]: 'primary',
        [IssueStatus.RESOLVED]: 'success',
        [IssueStatus.REVIEWED]: 'default'
      }
      return typeMap[status] || 'default'
    }

    // 获取状态颜色
    const getStatusColor = (status) => {
      return StatusColor[status] || '#969799'
    }

    // 获取状态文本
    const getStatusText = (status) => {
      return StatusText[status] || '未知'
    }

    // 格式化日期时间
    const formatDateTime = (timeStr) => {
      if (!timeStr) return ''
      const date = new Date(timeStr)
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    // 判断回复内容是否超过五行
    const isContentTooLong = (content) => {
      // console.log(content.length > 50)
      if (!content) return false
      // 简单估算：每行约30个字符，五行约150个字符
      return content.length > 100
    }

    // 切换部门留言展开状态
    const toggleDepartmentReply = (index) => {
      expandedDepartmentReplies.value[index] = !expandedDepartmentReplies.value[index]
    }

    // 获取评分文本
    const getRatingText = (rating) => {
      const ratingTexts = {
        1: '非常不满意',
        1.5: '不满意',
        2: '不满意',
        2.5: '一般',
        3: '一般',
        3.5: '满意',
        4: '满意',
        4.5: '非常满意',
        5: '非常满意'
      }
      return ratingTexts[rating] || '请评分'
    }

    // 加载数据
    const loadData = async () => {
      try {
        loading.value = true
        const issueId = route.params.id

        // 获取问题详情
        const issueData = getIssueById(issueId)
        if (!issueData) {
          issue.value = null
          return
        }

        issue.value = issueData
        replies.value = getRepliesByIssueId(issueId)
        review.value = getReviewByIssueId(issueId)
        reminders.value = getRemindersByIssueId(issueId)

        // 初始化本地催办状态
        hasUrgedToday.value = !IssueStatusManager.canUrgeToday(issueId)

      } catch (error) {
        console.error('加载数据失败:', error)
        showToast('加载失败，请重试')
      } finally {
        loading.value = false
      }
    }

    // 返回上一页
    const onBack = () => {
      router.go(-1)
    }

    // 催办点击
    const onUrgeClick = () => {
      showUrgeDialog.value = true
    }

    // 确认催办
    const confirmUrge = async () => {
      try {
        // 设置催办进行中状态
        isUrging.value = true

        // 调用催办接口
        IssueStatusManager.addReminder(issue.value.id, 'current_user', '请尽快处理')

        // 立即设置本地状态为已催办
        hasUrgedToday.value = true

        showSuccessToast('催办成功')

        // 重新加载所有数据以确保状态同步
        await loadData()
      } catch (error) {
        // 如果催办失败，重置状态
        hasUrgedToday.value = false
        showToast(error.message)
      } finally {
        // 重置催办进行中状态
        isUrging.value = false
      }
    }

    // 评价点击
    const onEvaluateClick = () => {
      showEvaluatePopup.value = true
    }

    // 关闭评价弹窗
    const closeEvaluatePopup = () => {
      showEvaluatePopup.value = false
      evaluateForm.value = {
        rating: 3,
        comment: '',
        submitting: false
      }
    }

    // 评分变化
    const onRatingChange = (value) => {
      evaluateForm.value.rating = value
    }

    // 提交评价
    const submitEvaluation = async () => {
      if (!canSubmitEvaluation.value) {
        showToast('请选择评分')
        return
      }
      console.log(evaluateForm.value.rating)
      // return 

      try {
        evaluateForm.value.submitting = true

        await submitReview(
          issue.value.id,
          evaluateForm.value.rating,
          evaluateForm.value.comment,
          'current_user'
        )

        showSuccessToast('评价提交成功')
        closeEvaluatePopup()

        // 重新加载数据
        await loadData()

      } catch (error) {
        showToast(error.message)
      } finally {
        evaluateForm.value.submitting = false
      }
    }

    // 预览附件
    const previewAttachment = (attachment) => {
      if (attachment.type === 'image') {
        // 收集所有图片附件
        const allImages = []
        let currentIndex = 0

        // 问题附件中的图片
        if (issue.value.attachments) {
          issue.value.attachments.forEach((att, index) => {
            if (att.type === 'image') {
              allImages.push(att.url)
              if (att.id === attachment.id) {
                currentIndex = allImages.length - 1
              }
            }
          })
        }

        // 回复附件中的图片
        replies.value.forEach(reply => {
          if (reply.attachments) {
            reply.attachments.forEach(att => {
              if (att.type === 'image') {
                allImages.push(att.url)
                if (att.id === attachment.id) {
                  currentIndex = allImages.length - 1
                }
              }
            })
          }
        })

        previewImages.value = allImages
        previewIndex.value = currentIndex
        showImagePreview.value = true
      } else {
        // 文档类型，提示下载
        showToast('点击下载文档')
      }
    }

    // 页面加载时获取数据
    onMounted(() => {
      loadData()
    })

    return {
      loading,
      issue,
      replies,
      review,
      reminders,
      showUrgeDialog,
      showEvaluatePopup,
      showImagePreview,
      previewImages,
      previewIndex,
      evaluateForm,
      isUrging,
      hasUrgedToday,
      canShowUrgeButton,
      canShowEvaluateButton,
      canUrgeToday,
      canSubmitEvaluation,
      getStatusType,
      getStatusColor,
      getStatusText,
      isContentTooLong,
      toggleDepartmentReply,
      formatDateTime,
      getRatingText,
      onBack,
      onUrgeClick,
      confirmUrge,
      onEvaluateClick,
      closeEvaluatePopup,
      onRatingChange,
      submitEvaluation,
      previewAttachment,
      expandedDepartmentReplies
    }
  }
}
</script>

<style scoped>
.issue-detail {
  background: #f7f8fa;
  min-height: 100vh;
  padding-bottom: 80px;
  margin-top: 46px;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
}

.detail-content {
  padding: 16px;
}

.issue-card,
.replies-card,
.evaluation-card,
.reminders-card {
  background: white;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
}

.issue-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.issue-title {
  font-size: 18px;
  font-weight: 600;
  color: #323233;
  line-height: 1.4;
  margin: 0;
  flex: 1;
  margin-right: 12px;
}

.status-tag {
  flex-shrink: 0;
}

.issue-meta {
  /* margin-bottom: 16px; */
}

.meta-item {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  font-size: 14px;
  line-height: 1.4;
  gap: 8px;
}

.meta-item:last-child {
  margin-bottom: 0;
}

.meta-item .van-icon {
  margin-top: 2px;
  flex-shrink: 0;
}

.meta-item .label {
  color: #646566;
  width: 60px;
  flex-shrink: 0;
}

.meta-item .value {
  color: #323233;
  flex: 1;
}

.issue-content {
  padding: 0 10px;
  margin-bottom: 10px;
}

.issue-content h3,
.replies-card h3,
.evaluation-card h3,
.reminders-card h3 {
  font-size: 16px;
  font-weight: 600;
  color: #323233;
  margin: 0 0 12px 0;
}

.issue-content h4 {
  font-size: 14px;
  font-weight: 600;
  color: #646566;
  margin: 16px 0 8px 0;
}

.content-text {
  /* color: #323233;
  line-height: 1.6;
  margin: 0 0 16px 0; */

  font-size: 16px;
  /* color: #646566; */
  line-height: 1.6;
  margin: 0;
}

.attachments-section {
  margin-top: 12px;
}

.attachments-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 12px;
  margin-top: 8px;
}

.attachment-item {
  cursor: pointer;
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid #ebedf0;
}

.image-attachment {
  position: relative;
}

.image-attachment img {
  width: 100%;
  height: 80px;
  object-fit: cover;
}

.attachment-name {
  display: block;
  padding: 8px;
  font-size: 12px;
  color: #646566;
  background: #f7f8fa;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-attachment {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 8px;
  text-align: center;
}

.file-attachment .van-icon {
  color: #1989fa;
  margin-bottom: 8px;
}

.attachment-size {
  font-size: 10px;
  color: #969799;
  margin-top: 4px;
}


.reply-creator {
  font-weight: 600;
  color: #1989fa;
  font-size: 14px;
}

.reply-time {
  font-size: 12px;
  color: #969799;
}

.reply-content-wrapper {
  display: flex;
  flex-direction: column;
}

.reply-content {
  color: #323233;
  line-height: 1.6;
  margin-bottom: 8px;
}

.evaluation-content {
  space-y: 12px;
}

.rating-display {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.rating-text {
  font-size: 14px;
  color: #646566;
}

.comment-display p {
  color: #323233;
  line-height: 1.6;
  margin: 0 0 8px 0;
  font-size: 16px;
}

.evaluation-time {
  font-size: 12px;
  color: #969799;
  margin-bottom: 12px;
}

.evaluation-note {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #ff976a;
}

.reminders-list {
  space-y: 8px;
}

.reminder-item {
  padding: 8px 12px;
  background: #f7f8fa;
  border-radius: 6px;
  margin-bottom: 8px;
}

.reminder-time {
  font-size: 12px;
  color: #969799;
  margin-bottom: 4px;
}

.reminder-message {
  font-size: 14px;
  color: #323233;
}

.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  gap: 16px;
}

.bottom-actions {
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

.action-button {
  flex: 1;
}

/* 催办按钮样式 */
.urge-button {
  transition: all 0.3s ease;
}

.urge-button-disabled {
  opacity: 0.6 !important;
  background-color: #f7f8fa !important;
  border-color: #ebedf0 !important;
  color: #c8c9cc !important;
  cursor: not-allowed !important;
}

.urge-button-disabled:hover {
  background-color: #f7f8fa !important;
  border-color: #ebedf0 !important;
  color: #c8c9cc !important;
}

/* 催办按钮加载状态样式 */
.urge-button.van-button--loading {
  background-color: #ff976a !important;
  border-color: #ff976a !important;
}

.evaluate-popup {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #ebedf0;
}

.popup-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.popup-header .van-icon {
  font-size: 18px;
  color: #969799;
  cursor: pointer;
}

.evaluate-form {
  flex: 1;
  padding: 16px;
  display: flex;
  flex-direction: column;
}

.rating-section {
  margin-bottom: 24px;
}

.rating-section label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #323233;
  margin-bottom: 12px;
}

.required {
  color: #ee0a24;
}

.rating-desc {
  display: block;
  font-size: 12px;
  color: #646566;
  margin-top: 8px;
}

.comment-section {
  flex: 1;
  margin-bottom: 24px;
}

.comment-section label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #323233;
  margin-bottom: 12px;
}

.popup-actions {
  margin-top: auto;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #323233;
  margin-bottom: 10px;
  padding-bottom: 5px;
  border-bottom: 1px solid #e4e7ed;
}


.replies-list {
  display: flex;
  flex-direction: column;
  gap: 0px;
}

.reply-item {
  background-color: #f7f8fa;
  border-radius: 8px;
}

.reply-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
}

.reply-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
}

.department-name {
  font-size: 14px;
  font-weight: 600;
  color: #1989fa;
}

.reply-time {
  font-size: 12px;
  color: #969799;
}


.reply-content {
  font-size: 14px;
  color: #646566;
  line-height: 1.5;
  margin-bottom: 8px;
}

.department-replies {
  padding: 10px;
  border-radius: 12px;
}

.reply-content-truncated {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  margin: 0;
}

.expand-button {
  color: #1989fa;
  font-size: 13px;
  cursor: pointer;
  user-select: none;
  transition: opacity 0.2s;
  text-align: end;
}

.expand-button:active {
  opacity: 0.7;
}
</style>