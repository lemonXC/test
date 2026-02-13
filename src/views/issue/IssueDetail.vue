<template>
  <div class="issue-detail">
    <!-- 导航栏 -->
    <van-nav-bar title="问题详情" left-text="返回" left-arrow fixed @click-left="onBack" class="nav-bar" />

    <!-- 加载状态 -->
    <div class="loading-container" v-if="loading">
      <div class="loading-content">
        <van-loading size="24px" color="#1989fa">加载中...</van-loading>
      </div>
    </div>

    <!-- 无数据状态 -->
    <div class="no-data-container" v-if="!issue && !loading">
      <div class="no-data-content">
        <div class="no-data-icon">
          <van-icon name="search" size="48" color="#c8c9cc" />
        </div>
        <div class="no-data-text">
          <h3 class="no-data-title">未找到相关问题</h3>
          <p class="no-data-description">
            抱歉，没有找到与查询码对应的问题信息。<br>
            请检查查询码是否正确，或联系客服获取帮助。
          </p>
        </div>
        <div class="no-data-actions">
          <van-button type="primary" size="large" @click="onBack">
            返回查询
          </van-button>
        </div>
      </div>
    </div>

    <div class="content" v-if="issue">
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
            <van-icon name="clock-o" />
            <span class="label">提交时间</span>
            <span class="value">{{ issue.createTime }}</span>
          </div>
        </div>
      </div>

      <!-- 问题内容 -->
      <div class="issue-content">
        <p class="content-text">{{ issue.content }}</p>
        <!-- 图片附件区域 -->
        <div v-if="imageAttachments.length > 0" class="image-attachments-section">
          <div class="image-attachments-grid">
            <div v-for="(attachment, index) in imageAttachments" :key="index" class="image-attachment-item"
              @click="onAttachmentClick(attachment)">
              <div class="image-thumbnail-container">
                <img :src="attachment.url" :alt="attachment.name" class="image-thumbnail" />
              </div>
              <span class="image-attachment-name">{{ attachment.name }}</span>
            </div>
          </div>
        </div>
        <!-- 其他文件附件区域 -->
        <div v-if="otherAttachments.length > 0" class="other-attachments-section">
          <h4 class="attachment-section-title">其他附件：</h4>
          <div class="other-attachments-list">
            <div v-for="(attachment, index) in otherAttachments" :key="index" class="other-attachment-item"
              @click="onAttachmentClick(attachment)">
              <van-icon :name="getFileIcon(attachment.type)" class="file-icon" />
              <span class="other-attachment-name" :title="attachment.name">{{ attachment.name }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 部门留言区域 -->
      <div class="department-replies" v-if="issue.departmentReplies && issue.departmentReplies.length > 0">
        <h3 class="section-title">留言</h3>
        <div class="replies-list">
          <div v-for="(reply, index) in issue.departmentReplies" :key="index" class="reply-item">
            <div class="reply-header">
              <span class="department-name">{{ reply.department }}</span>
              <span class="reply-time">{{ reply.replyTime }}</span>
            </div>
            <div class="reply-content-wrapper">
              <p class="reply-content"
                :class="{ 'reply-content-truncated': !expandedDepartmentReplies[index] && isContentTooLong(reply.content) }">
                {{ reply.content }}
              </p>
              <span v-if="isContentTooLong(reply.content)" class="expand-button" @click="toggleDepartmentReply(index)">
                {{ expandedDepartmentReplies[index] ? '收起' : '展开' }}
              </span>

              <!-- 附件展示区域 -->
              <div v-if="reply.attachments && reply.attachments.length > 0" class="department-reply-attachments">
                <!-- 图片附件区域 -->
                <div v-if="reply.attachments.filter(att => att.type === 'image').length > 0"
                  class="uploaded-images-section">
                  <div class="uploaded-images-grid">
                    <div v-for="(attachment, attIndex) in reply.attachments.filter(att => att.type === 'image')"
                      :key="`dept-image-${index}-${attIndex}`" class="uploaded-image-item">
                      <img :src="attachment.url" :alt="attachment.name" class="uploaded-image"
                        @click="onAttachmentClick(attachment)" />
                    </div>
                  </div>
                </div>

                <!-- 其他文件附件区域 -->
                <div v-if="reply.attachments.filter(att => att.type !== 'image').length > 0"
                  class="uploaded-files-section">
                  <div v-for="(attachment, attIndex) in reply.attachments.filter(att => att.type !== 'image')"
                    :key="`dept-file-${index}-${attIndex}`" class="uploaded-file-row">
                    <div class="file-content" @click="onAttachmentClick(attachment)">
                      <van-icon :name="getFileIcon(attachment.type || getFileTypeFromName(attachment.name))"
                        class="file-icon" />
                      <span class="file-name" :title="attachment.name">{{ attachment.name }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="operation-records" v-if="operationRecords && operationRecords.length > 0">
        <h3 class="section-title">问题操作记录</h3>
        <div class="operation-card">
          <van-cell-group>
            <van-cell
              v-for="rec in operationRecords"
              :key="rec.id || rec.time + rec.department"
              :title="rec.action"
              :label="formatRecordLabel(rec)"
              icon="notes-o"
            />
          </van-cell-group>
        </div>
      </div>

      <!-- 专家求助区域 - 只在从在线解答进入时显示 -->
      <div class="expert-help" v-if="issue.expertHelp && isFromOnlineAnswer">
        <h3 class="section-title">智库求助</h3>
        <div class="help-content">
          <div v-for="(help) in issue.expertHelp" :key="help.helpTime">
            <span class="department-name">求助：</span>
            <p class="reply-content">{{ help.content }}</p>
            <div class="reply-footer">
              <span class="reply-time">{{ help.helpTime }}</span>
              <div class="comment-image-container" @click="openExpertHelpModal(help)">
                <img src="/comment.png" alt="评论图片" class="comment-image" />
              </div>
            </div>

            <!-- 专家回复区域 - 微博评论区样式 -->
            <div v-if="help.reply && help.reply.length > 0" class="expert-replies-section">
              <!-- 显示最新一条回复 -->
              <div class="latest-reply" v-if="help.reply.length > 0">
                <div class="reply-item">
                  <div class="reply-header">
                    <span class="expert-name">{{ help.reply[0].expertName }}</span>
                    <span class="reply-time">{{ help.reply[0].expertReplyTime }}</span>
                  </div>
                  <div class="reply-content-wrapper">
                    <p class="reply-content"
                      :class="{ 'content-collapsed': !expandedReplies[`${help.helpTime}-${help.reply.length - 1}`] && isContentTooLong(help.reply[help.reply.length - 1].expertReply) }"
                      ref="replyContentRef">
                      {{ help.reply[help.reply.length - 1].expertReply }}
                    </p>
                    <!-- 展开/收起按钮 -->
                    <!-- <span v-if="isContentTooLong(help.reply[help.reply.length - 1].expertReply)" class="expand-btn"
                      @click="toggleReplyExpand(`${help.helpTime}-${help.reply.length - 1}`)">
                      {{ expandedReplies[`${help.helpTime}-${help.reply.length - 1}`] ? '收起' : '展开' }}
                    </span> -->
                  </div>
                </div>
              </div>

              <!-- 回复数量提示 - 点击弹出完整回复页面 -->
              <div class="replies-count-trigger" v-if="help.reply.length > 1" @click="openRepliesModal(help)">
                <span class="count-text">共{{ help.reply.length }}条回复</span>
                <van-icon name="arrow" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 留言功能区域 - 仅在从"待回复"进入时显示showMessageForm -->
    </div>


    <!-- 专家回复弹窗 -->
    <van-popup v-model:show="showRepliesModal" position="bottom" :style="{ height: '80%', maxHeight: '80vh' }" round
      closeable close-icon-position="top-right" @close="closeRepliesModal" :transition="'van-slide-up'" :duration="0.4"
      :overlay-style="{ 'animation-duration': '0.4s' }">
      <div class="replies-modal">
        <div class="modal-header">
          <h3 class="modal-title">专家回复 ({{ currentReplies.length }}条)</h3>
        </div>

        <div class="modal-content">
          <div v-for="(reply, index) in currentReplies" :key="index" class="modal-reply-item">
            <div class="reply-header">
              <span class="expert-name">{{ reply.expertName }}</span>
              <span class="reply-time">{{ reply.expertReplyTime }}</span>
            </div>
            <div class="reply-content-wrapper">
              <p class="reply-content"
                :class="{ 'reply-content-truncated': !expandedModalReplies[index] && isContentTooLong(reply.expertReply) }">
                {{ reply.expertReply }}
              </p>
              <!-- 展开/收起按钮 -->
              <span v-if="isContentTooLong(reply.expertReply)" class="expand-button"
                @click="toggleModalReplyExpand(index)">
                {{ expandedModalReplies[index] ? '收起' : '展开' }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </van-popup>

    <!-- 智库求助表单弹窗 -->
    <van-popup v-model:show="showExpertHelpModal" position="bottom" :style="{ height: '80%' }" round>
      <div>
        <div class="modal-content">
          <div class="message-form">
            <!-- 输入框容器 -->
            <div class="input-container">
              <van-field v-model="messageForm.content" type="textarea" placeholder="请输入您的回复内容..." rows="4"
                maxlength="1000" show-word-limit :error="messageForm.error" :error-message="messageForm.errorMessage"
                style="color: #000;" />
              <!-- 附件上传按钮 - 放置在输入框左下角 -->
              <div class="attachment-btn" @click="handleExpertHelpAttachmentUpload"
                v-if="expertHelpForm.attachments.length < 5">
                🔗
              </div>

              <!-- 已上传的文件列表 -->
              <div v-if="expertHelpForm.attachments.length > 0" class="uploaded-files-container">
                <!-- 图片附件区域 -->
                <div v-if="expertHelpImageAttachments.length > 0" class="uploaded-images-section">
                  <div class="uploaded-images-grid">
                    <div v-for="(attachment, index) in expertHelpImageAttachments" :key="`image-${index}`"
                      class="uploaded-image-item">
                      <img :src="attachment.url" :alt="attachment.name" class="uploaded-image" />
                      <!-- 删除按钮 -->
                      <div class="delete-icon"
                        @click="removeExpertHelpAttachment(expertHelpForm.attachments.indexOf(attachment))">
                        <van-icon name="cross" />
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 其他文件附件区域 -->
                <div v-if="expertHelpOtherAttachments.length > 0" class="uploaded-files-section">
                  <div v-for="(attachment, index) in expertHelpOtherAttachments" :key="`file-${index}`"
                    class="uploaded-file-row">
                    <div class="file-content">
                      <van-icon :name="getFileIcon(attachment.name)" class="file-icon" />
                      <span class="file-name" :title="attachment.name">{{ attachment.name }}</span>
                    </div>
                    <!-- 删除按钮 -->
                    <div class="delete-icon"
                      @click="removeExpertHelpAttachment(expertHelpForm.attachments.indexOf(attachment))">
                      <van-icon name="cross" size="12" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <!-- 上传提示 -->
            <!-- <div class="upload-tip" v-if="messageForm.attachments.length > 0">
            <van-icon name="info-o" />
            单个文件不超过10MB
          </div> -->
            <div class="form-actions">
              <van-button type="primary" size="large" :loading="messageForm.submitting" @click="submitMessage"
                :disabled="!messageForm.content.trim()">
                提交
              </van-button>
            </div>
          </div>
        </div>
      </div>
    </van-popup>

    <!-- 上传选择菜单 -->
    <van-action-sheet v-model:show="showUploadMenu" title="选择上传方式" cancel-text="取消">
      <div class="upload-actions">
        <div class="upload-action-item" @click="handleCameraUpload">
          <van-icon name="photograph" />
          <span>拍摄照片</span>
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

    <!-- 底部固定输入框 - 根据问题状态控制显示 -->
    <transition name="bottom-input" appear>
      <div class="bottom-input-bar" v-if="shouldShowBottomInput">
        <div class="input-wrapper" @click="openBottomExpertHelpModal">
          <van-icon name="edit" class="input-icon" />
          <span class="input-placeholder">{{ bottomInputPlaceholder }}</span>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast } from 'vant'
import { IssueStatus, StatusText, StatusColor, IssueStatusManager } from '@/data/mockIssueData.js'

const router = useRouter()
const route = useRoute()

// 检测是否从待督办入口进入
const isFromSupervise = computed(() => {
  return route.query.from === 'pending_supervise'
})

// 检测是否从在线解答模块进入
const isFromOnlineAnswer = computed(() => {
  return route.query.source === 'online_answer'
})

// 检测是否从问题管理模块进入
const isFromIssueManagement = computed(() => {
  return route.query.source === 'issue_management' ||
    route.query.source === 'appeal' ||
    route.query.source === 'query_code_list' ||
    (!route.query.source && !isFromOnlineAnswer.value)
})

// 获取传递的状态参数
const passedStatus = computed(() => {
  return route.query.status
})

// 获取传递的来源标签页参数
const passedFrom = computed(() => {
  return route.query.from
})

// 控制底部输入框显示的计算属性
const shouldShowBottomInput = computed(() => {
  if (!issue.value) return false
  
  // 当问题状态为"已回复"(REVIEWED)时，完全隐藏底部固定输入框
  if (issue.value.status === IssueStatus.REVIEWED) {
    return false
  }
  
  // 只有从问题管理模块进入时才显示底部输入框
  return isFromIssueManagement.value
})

// 动态placeholder文本的计算属性
const bottomInputPlaceholder = computed(() => {
  if (!issue.value) return '点击发起回复...'
  
  // 当问题状态为"待督办"时，设置特殊的placeholder文本
  if (issue.value.status === IssueStatus.SUPERVISE) {
    return '点击记录督办情况'
  }
  
  // 其他状态使用默认placeholder文本
  return '点击发起回复...'
})

const issue = ref(null)
const loading = ref(true)
const showImagePreview = ref(false)
const previewImages = ref([])
const previewIndex = ref(0)

// 留言功能相关状态
const showMessageForm = ref(false)
const messageForm = ref({
  content: '',
  submitting: false,
  error: false,
  errorMessage: '',
  attachments: []
})

// 智库求助功能相关状态
const showExpertHelpForm = ref(false)
const expertHelpForm = ref({
  content: '',
  submitting: false,
  error: false,
  errorMessage: '',
  attachments: []
})

// 专家回复展开状态管理
const expertReplyStates = ref({})
const expandedReplies = ref({}) // 记录每个回复的展开状态

// 专家回复弹窗相关状态
const showRepliesModal = ref(false)
const currentReplies = ref([])
const expandedModalReplies = ref({})

// 部门留言展开状态管理
const expandedDepartmentReplies = ref({})

// 评论回复弹窗相关状态
const showCommentModal = ref(false)

// 智库求助弹窗相关状态
const showExpertHelpModal = ref(false)
const currentHelpItem = ref(null)
const commentForm = ref({
  content: '',
  submitting: false,
  error: false,
  errorMessage: ''
})

// 附件上传相关状态
const showUploadMenu = ref(false)
const currentUploadTarget = ref('message') // 'message' 或 'expertHelp'
const cameraInput = ref(null)
const galleryInput = ref(null)
const chatInput = ref(null)

// 计算属性：分类附件
const imageAttachments = computed(() => {
  if (!issue.value || !issue.value.attachments) return []
  return issue.value.attachments.filter(attachment => attachment.type === 'image')
})

const otherAttachments = computed(() => {
  if (!issue.value || !issue.value.attachments) return []
  return issue.value.attachments.filter(attachment => attachment.type !== 'image')
})

// 计算属性：分类留言附件
const messageImageAttachments = computed(() => {
  return messageForm.value.attachments.filter(attachment => attachment.type === 'image')
})

const messageOtherAttachments = computed(() => {
  return messageForm.value.attachments.filter(attachment => attachment.type !== 'image')
})

// 计算属性：分类智库求助附件
const expertHelpImageAttachments = computed(() => {
  return expertHelpForm.value.attachments.filter(attachment => attachment.type === 'image')
})

const expertHelpOtherAttachments = computed(() => {
  return expertHelpForm.value.attachments.filter(attachment => attachment.type !== 'image')
})

const operationRecords = computed(() => {
  if (!issue.value) return []
  return issue.value.operationRecords || []
})

const formatRecordLabel = (rec) => `操作部门：${rec.department} · 操作时间：${rec.time}${rec.remark ? ' · ' + rec.remark : ''}`

// 模拟问题数据
const mockIssues = {
  1: {
    id: 1,
    title: '关于小区停车位分配不合理的问题反映',
    content: '我们小区停车位分配存在严重不公平现象，一些业主占用多个停车位，而另一些业主却无法找到停车位。这种情况已经持续了很长时间，严重影响了小区的和谐氛围。希望相关部门能够重视并解决这个问题，制定更加公平合理的停车位分配方案。',
    status: IssueStatus.PENDING,
    category: '我有诉求',
    createTime: '2024-01-15 10:30:00',
    updateTime: '2024-01-15 10:30:00',
    attachments: [
      { type: 'image', name: '停车位现状.jpg', url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzMzMyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuWBnOi9puS9jeePsOeKtjwvdGV4dD48L3N2Zz4=' },
      { type: 'document', name: '投诉材料.pdf', url: '/files/complaint.pdf' }
    ],
    operationRecords: [
      { id: 101, department: '社区管理委员会', action: '审核', time: '2024-01-15 11:00:00' },
      { id: 102, department: '社区管理委员会', action: '分拨', time: '2024-01-15 13:20:00', remark: '转交物业管理处' },
      { id: 103, department: '物业管理处', action: '部门答复', time: '2024-01-16 14:30:00' },
      { id: 104, department: '城管执法局', action: '部门答复', time: '2024-01-18 16:45:00', remark: '联合会商后反馈' }
    ],
    departmentReplies: [
      {
        department: '物业管理处',
        content: '您好，关于停车位分配问题，我们已经收到您的反映。经过初步调查，确实存在部分业主占用多个停车位的情况。我们将在本周内召开业主大会，讨论制定新的停车位管理办法，包括实行一户一位制度、设置临时停车区域等措施。同时，我们会加强日常巡查，对违规占用停车位的行为进行劝导和管理。感谢您的理解与配合。',
        replyTime: '2024-01-16 14:30:00',
        attachments: [
          { type: 'image', name: '停车位分配图', url: '/public/book.png' }
        ],
      },
      {
        department: '社区管理委员会',
        content: '已收到反映，正在处理中。',
        replyTime: '2024-01-17 09:15:00',
        attachments: [
          { type: 'document', name: '处理流程说明.pdf', url: '/files/process.pdf' },
          { type: 'image', name: '现场照片.jpg', url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzMzMyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPueOsOWcuueFp+eJhzwvdGV4dD48L3N2Zz4=' }
        ]
      },
      {
        department: '城管执法局',
        content: '关于小区停车位管理问题，我们建议通过以下方式解决：1. 完善停车位管理制度；2. 加强业主自律；3. 必要时可申请执法介入。我们会配合物业做好相关工作，确保小区停车秩序的规范化管理。如有需要，请及时联系我们。',
        replyTime: '2024-01-18 16:45:00',
        attachments: [
          { type: 'document', name: '停车管理规定.doc', url: '/files/parking_rules.doc' },
          { type: 'document', name: '执法流程图.pdf', url: '/files/enforcement_flow.pdf' }
        ]
      }
    ],
    expertHelp: [{
      content: '根据《环境噪声污染防治法》，夜间施工需要特殊许可，建议收集更多证据，包括噪音分贝测试数据。',
      helpTime: '2024-01-16 10:15:00',
      reply: [{
        expertReply: '已协助联系相关部门，问题正在处理中。建议居民可以通过法律途径维护自己的权益。已协助联系相关部门，问题正在处理中。建议居民可以通过法律途径维护自己的权益。已协助联系相关部门，问题正在处理中。建议居民可以通过法律途径维护自己的权益。已协助联系相关部门，问题正在处理中。建议居民可以通过法律途径维护自己的权益。',
        expertName: '张三',
        expertReplyTime: '2024-01-17 11:20:00'
      }, {
        expertReply: '已协助联系相关部门，问题正在处理中。建议居民可以通过法律途径维护自己的权益。',
        expertName: '李四',
        expertReplyTime: '2024-01-17 11:20:00'
      }],
    }, {
      content: '根据《环境噪声污染防治法》，夜间施工需要特殊许可，建议收集更多证据，包括噪音分贝测试数据。',
      helpTime: '2024-01-16 10:15:00',
      reply: []
    }]
  },
  2: {
    id: 2,
    title: '道路积水严重影响出行安全',
    content: '每逢下雨天，我们这条路就会严重积水，水深可达20-30厘米，给居民出行带来很大不便，特别是老人和小孩出行存在安全隐患。这个问题已经存在多年，希望相关部门能够尽快解决排水问题。',
    status: IssueStatus.PROCESSING,
    category: '我有诉求',
    createTime: '2024-01-14 14:20:00',
    updateTime: '2024-01-16 09:15:00',
    attachments: [
      { type: 'image', name: '积水现场1.jpg', url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZTZmN2ZmIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzMzMyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuenr+awtOeOsOWcujE8L3RleHQ+PC9zdmc+' },
      { type: 'image', name: '积水现场2.jpg', url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZTZmN2ZmIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzMzMyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuenr+awtOeOsOWcujI8L3RleHQ+PC9zdmc+' }
    ],
    operationRecords: [
      { id: 201, department: '市政工程部', action: '审核', time: '2024-01-14 15:00:00' },
      { id: 202, department: '市政工程部', action: '分拨', time: '2024-01-14 15:10:00', remark: '转交施工单位' },
      { id: 203, department: '施工单位', action: '部门答复', time: '2024-01-15 17:00:00' }
    ],
    departmentReplies: [
      {
        department: '市政工程部',
        content: '您好，我们已收到您的反映，将安排工作人员实地查看情况，并制定相应的解决方案。预计在一周内给出具体的处理时间表。已协助联系相关部门，问题正在处理中。建议居民可以通过法律途径维护自己的权益。已协助联系相关部门，问题正在处理中。建议居民可以通过法律途径维护自己的权益。已协助联系相关部门，问题正在处理中。建议居民可以通过法律途径维护自己的权益。已协助联系相关部门，问题正在处理中。建议居民可以通过法律途径维护自己的权益。已协助联系相关部门，问题正在处理中。建议居民可以通过法律途径维护自己的权益。',
        replyTime: '2024-01-15 16:30:00'
      }
    ],
    expertHelp: null
  },
  3: {
    id: 3,
    title: '噪音污染问题持续困扰居民生活质量',
    content: '附近工地夜间施工噪音严重，从晚上10点一直持续到凌晨2点，严重影响居民正常休息。我们多次向工地反映，但问题依然存在。希望相关部门能够规范施工时间，保障居民的正常休息权利。',
    status: IssueStatus.RESOLVED,
    category: '我有诉求',
    createTime: '2024-01-13 20:45:00',
    updateTime: '2024-01-17 11:20:00',
    attachments: [
      { type: 'audio', name: '噪音录音.mp3', url: '/audio/noise.mp3' }
    ],
    operationRecords: [
      { id: 301, department: '环保局', action: '审核', time: '2024-01-16 13:20:00' },
      { id: 302, department: '环保局', action: '分拨', time: '2024-01-16 13:35:00', remark: '转交城管执法局' },
      { id: 303, department: '城管执法局', action: '部门答复', time: '2024-01-17 09:30:00' }
    ],
    departmentReplies: [
      {
        department: '环保局',
        content: '经过实地检测，该工地确实存在夜间施工噪音超标问题，我们已责令施工单位立即整改，并将加强后续监管。',
        replyTime: '2024-01-16 14:20:00'
      },
      {
        department: '城管执法局',
        content: '我们将加强夜间巡查，确保施工单位严格按照规定时间施工，违规施工将面临严厉处罚。',
        replyTime: '2024-01-17 09:30:00'
      }
    ],
    expertHelp: [{
      content: '根据《环境噪声污染防治法》，夜间施工需要特殊许可，建议收集更多证据，包括噪音分贝测试数据。',
      helpTime: '2024-01-16 10:15:00',
      reply: [{
        expertReply: '已协助联系相关部门，问题正在处理中。建议居民可以通过法律途径维护自己的权益。已协助联系相关部门，问题正在处理中。建议居民可以通过法律途径维护自己的权益。已协助联系相关部门，问题正在处理中。建议居民可以通过法律途径维护自己的权益。已协助联系相关部门，问题正在处理中。建议居民可以通过法律途径维护自己的权益。已协助联系相关部门，问题正在处理中。建议居民可以通过法律途径维护自己的权益。已协助联系相关部门，问题正在处理中。建议居民可以通过法律途径维护自己的权益。已协助联系相关部门，问题正在处理中。建议居民可以通过法律途径维护自己的权益。已协助联系相关部门，问题正在处理中。建议居民可以通过法律途径维护自己的权益。已协助联系相关部门，问题正在处理中。建议居民可以通过法律途径维护自己的权益。已协助联系相关部门，问题正在处理中。建议居民可以通过法律途径维护自己的权益。',
        expertName: '张三',
        expertReplyTime: '2024-01-17 11:20:00'
      }, {
        expertReply: '已协助联系相关部门，问题正在处理中。建议居民可以通过法律途径维护自己的权益。',
        expertName: '李四',
        expertReplyTime: '2024-01-17 11:20:00'
      }],
    }, {
      content: '根据《环境噪声污染防治法》，夜间施工需要特殊许可，建议收集更多证据，包括噪音分贝测试数据。',
      helpTime: '2024-01-16 10:15:00',
      reply: []
    }]
  },
  4: {
    id: 4,
    title: '小区物业管理服务质量问题',
    content: '小区物业管理存在多项问题：1. 保安值班不到位，经常出现无人值守情况；2. 清洁卫生工作不及时，垃圾清理不彻底；3. 设施维护不当，电梯经常故障；4. 收费不透明，缺乏详细账目。这些问题严重影响了业主的生活质量，需要相关部门进行督办处理。',
    status: IssueStatus.REVIEWED,
    category: '我有诉求',
    createTime: '2024-01-12 16:45:00',
    updateTime: '2024-01-18 14:30:00',
    attachments: [
      { type: 'image', name: '物业问题现场.jpg', url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZmZmMGY1Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzMzMyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPueJqeS4muWVj+mimDwvdGV4dD48L3N2Zz4=' },
      { type: 'document', name: '投诉记录.pdf', url: '/files/property-complaint.pdf' }
    ],
    departmentReplies: [
      {
        department: '住建局',
        content: '我们已收到关于该小区物业管理问题的反映，将组织专项检查组进行实地调研，并督促物业公司限期整改。',
        replyTime: '2024-01-16 10:20:00'
      }
    ],
    expertHelp: null
  },
  5: {
    id: 5,
    title: '小区安全管理问题需要督办',
    content: '小区安全管理存在严重问题：门禁系统经常失效，外来人员可以随意进入；监控设备老化，部分区域存在监控盲区；保安巡逻不到位，夜间安全隐患较大。这些问题已经多次反映但未得到有效解决，需要相关部门进行督办处理。',
    status: IssueStatus.SUPERVISE,
    category: '安全管理',
    createTime: '2024-01-10 14:20:00',
    updateTime: '2024-01-18 16:30:00',
    attachments: [
      { type: 'image', name: '门禁故障.jpg', url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZmZlZWVlIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iI2VlMGEyNCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPumXqOelgeaVhemanDwvdGV4dD48L3N2Zz4=' },
      { type: 'document', name: '安全隐患报告.pdf', url: '/files/security-report.pdf' }
    ],
    departmentReplies: [
      {
        department: '物业管理处',
        content: '我们已经注意到安全管理方面的问题，正在制定整改方案。',
        replyTime: '2024-01-12 09:30:00'
      },
      {
        department: '社区安全办',
        content: '已将此问题列为重点督办事项，要求物业公司在一周内提交详细整改计划，并限期完成整改。',
        replyTime: '2024-01-18 16:30:00'
      }
    ],
    expertHelp: null
  }
}

// 获取状态类型
const getStatusType = (status) => {
  const typeMap = {
    [IssueStatus.PENDING]: 'warning',
    [IssueStatus.PROCESSING]: 'primary',
    [IssueStatus.RESOLVED]: 'success',
    [IssueStatus.REVIEWED]: 'default',
    [IssueStatus.SUPERVISE]: 'danger'
  }
  return typeMap[status] || 'default'
}

// 获取状态颜色 - 增强版，根据来源优化显示
const getStatusColor = (status) => {
  // 如果是从在线解答模块进入，使用在线解答的状态颜色映射
  if (isFromOnlineAnswer.value) {
    const onlineAnswerColorMap = {
      'PENDING_REPLY': '#ff976a',  // 橙色 - 待回复
      'REPLIED': '#07c160',        // 绿色 - 已回复
    }
    return onlineAnswerColorMap[passedStatus.value] || StatusColor[status] || '#969799'
  }
  
  // 如果是从问题管理模块进入，使用问题管理的状态颜色映射
  if (isFromIssueManagement.value) {
    const issueManagementColorMap = {
      'PENDING_REPLY': '#ff9500',     // 橙色 - 待回复
      'PENDING_SUPERVISE': '#1989fa', // 蓝色 - 待督办
      'REPLIED': '#07c160',           // 绿色 - 已回复
      'COMPLETED': '#969799'          // 灰色 - 已完成
    }
    return issueManagementColorMap[passedStatus.value] || StatusColor[status] || '#969799'
  }
  
  return StatusColor[status] || '#969799'
}

// 获取状态文本 - 增强版，根据来源优化显示
const getStatusText = (status) => {
  // 如果是从在线解答模块进入，使用在线解答的状态文本映射
  if (isFromOnlineAnswer.value) {
    const onlineAnswerTextMap = {
      'PENDING_REPLY': '待回复',
      'REPLIED': '已回复'
    }
    return onlineAnswerTextMap[passedStatus.value] || StatusText[status] || '未知'
  }
  
  // 如果是从问题管理模块进入，使用问题管理的状态文本映射
  if (isFromIssueManagement.value) {
    const issueManagementTextMap = {
      'PENDING_REPLY': '待回复',
      'PENDING_SUPERVISE': '待督办',
      'REPLIED': '已回复',
      'COMPLETED': '已完成'
    }
    return issueManagementTextMap[passedStatus.value] || StatusText[status] || '未知'
  }
  
  return StatusText[status] || '未知'
}

// 从文件名获取文件类型
const getFileTypeFromName = (fileName) => {
  const extension = fileName.split('.').pop().toLowerCase()
  const typeMap = {
    'pdf': 'pdf',
    'doc': 'word',
    'docx': 'word',
    'xls': 'excel',
    'xlsx': 'excel',
    'jpg': 'image',
    'jpeg': 'image',
    'png': 'image',
    'gif': 'image',
    'mp3': 'audio',
    'wav': 'audio',
    'mp4': 'video',
    'avi': 'video'
  }
  return typeMap[extension] || 'document'
}

// 获取文件图标
const getFileIcon = (type) => {
  const iconMap = {
    'document': 'description',
    'pdf': 'description',
    'audio': 'music-o',
    'video': 'video-o',
    'excel': 'description',
    'word': 'description'
  }
  return iconMap[type] || 'description'
}

// 处理附件点击
const onAttachmentClick = (attachment) => {
  if (attachment.type === 'image') {
    // 收集所有图片附件
    const imageAttachments = issue.value.attachments.filter(att => att.type === 'image')
    previewImages.value = imageAttachments.map(att => att.url)
    previewIndex.value = imageAttachments.findIndex(att => att.url === attachment.url)
    showImagePreview.value = true
  } else {
    // 其他文件类型的处理（这里可以添加下载逻辑）
    console.log('点击文件:', attachment.name)
  }
}

// 返回上一页
const onBack = () => {
  router.back()
}

// 切换部门留言展开状态
const toggleDepartmentReply = (index) => {
  expandedDepartmentReplies.value[index] = !expandedDepartmentReplies.value[index]
}

// 格式化文件大小
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 处理附件上传 - 弹出上传选择菜单
const handleAttachmentUpload = () => {
  currentUploadTarget.value = 'message'
  showUploadMenu.value = true
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

    // 根据上传目标选择对应的表单
    const targetForm = currentUploadTarget.value === 'expertHelp' ? expertHelpForm : messageForm

    // 检查数量限制
    if (targetForm.value.attachments.length >= 5) {
      showToast('最多只能上传5个文件')
      return
    }

    // 创建文件对象
    if (file.type && file.type.startsWith('image/')) {
      // 图片文件，生成预览
      const reader = new FileReader()
      reader.onload = (e) => {
        targetForm.value.attachments.push({
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
      targetForm.value.attachments.push({
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

// 移除附件
const removeAttachment = (index) => {
  messageForm.value.attachments.splice(index, 1)
}

// 提交留言
const submitMessage = async () => {
  // 表单验证
  if (!messageForm.value.content.trim()) {
    messageForm.value.error = true
    messageForm.value.errorMessage = '请输入留言内容'
    return
  }

  if (messageForm.value.content.trim().length < 5) {
    messageForm.value.error = true
    messageForm.value.errorMessage = '留言内容至少需要5个字符'
    return
  }

  messageForm.value.submitting = true
  messageForm.value.error = false
  messageForm.value.errorMessage = ''

  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1500))

    // 添加留言到当前问题的回复列表
    const newReply = {
      department: '用户留言',
      content: messageForm.value.content.trim(),
      replyTime: new Date().toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }),
      attachments: [...messageForm.value.attachments] // 包含附件数据
    }

    if (!issue.value.departmentReplies) {
      issue.value.departmentReplies = []
    }
    issue.value.departmentReplies.push(newReply)

    // 重置表单
    messageForm.value.content = ''
    messageForm.value.attachments = []

    // 显示成功提示
    showToast('留言提交成功')
    closeExpertHelpModal()

  } catch (error) {
    messageForm.value.error = true
    messageForm.value.errorMessage = '提交失败，请重试'

    // 显示错误提示
    showToast('提交失败，请重试')
  } finally {
    messageForm.value.submitting = false
  }
}

// 智库求助附件上传处理
const handleExpertHelpAttachmentUpload = () => {
  showUploadMenu.value = true
  currentUploadTarget.value = 'expertHelp'
}

// 移除智库求助附件
const removeExpertHelpAttachment = (index) => {
  expertHelpForm.value.attachments.splice(index, 1)
}

// 提交智库求助
const submitExpertHelp = async () => {
  // 表单验证
  if (!expertHelpForm.value.content.trim()) {
    expertHelpForm.value.error = true
    expertHelpForm.value.errorMessage = '请输入求助内容'
    return
  }

  if (expertHelpForm.value.content.trim().length < 10) {
    expertHelpForm.value.error = true
    expertHelpForm.value.errorMessage = '求助内容至少需要10个字符'
    return
  }

  expertHelpForm.value.submitting = true
  expertHelpForm.value.error = false
  expertHelpForm.value.errorMessage = ''

  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1500))

    // 添加智库求助到当前问题
    const newExpertHelp = {
      content: expertHelpForm.value.content.trim(),
      helpTime: new Date().toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }),
      expertReply: '',
      expertName: '',
      expertReplyTime: '',
      attachments: [...expertHelpForm.value.attachments]
    }

    if (!issue.value.expertHelp) {
      issue.value.expertHelp = []
    }
    issue.value.expertHelp.push(newExpertHelp)

    // 重置表单
    expertHelpForm.value.content = ''
    expertHelpForm.value.attachments = []

    // 显示成功提示
    showToast('智库求助提交成功')

  } catch (error) {
    expertHelpForm.value.error = true
    expertHelpForm.value.errorMessage = '提交失败，请重试'

    // 显示错误提示
    showToast('提交失败，请重试')
  } finally {
    expertHelpForm.value.submitting = false
  }
}

// 检查是否显示留言表单和智库求助表单
const checkShowMessageForm = () => {
  // 检查路由查询参数，看是否从"待回复"选项卡进入
  const fromTab = route.query.from
  const issueStatus = issue.value?.status

  // 如果从问题管理页面的"待回复"选项卡进入，则显示留言表单
  showMessageForm.value = fromTab === 'pending_reply' || issueStatus === 'pending_reply'

  // 如果从在线解答页面的"待回复"选项卡进入，则显示智库求助表单
  // 这里我们通过检查referrer或者添加额外的查询参数来区分
  // 暂时使用一个简单的逻辑：如果从pending_reply进入且当前页面路径包含特定标识
  showExpertHelpForm.value = fromTab === 'pending_reply' && route.query.source === 'online_answer'
}

// 判断回复内容是否超过五行
const isContentTooLong = (content) => {
  if (!content) return false
  // 简单估算：每行约30个字符，五行约150个字符
  return content.length > 50
}

// 切换单条回复的展开/收起状态
const toggleReplyExpand = (replyKey) => {
  expandedReplies.value[replyKey] = !expandedReplies.value[replyKey]
}

// 切换全部回复的展开/收起状态
const toggleAllReplies = (helpTime) => {
  expertReplyStates.value[helpTime] = !expertReplyStates.value[helpTime]
}

// 打开专家回复弹窗
const openRepliesModal = (help) => {
  // 添加触觉反馈（如果支持）
  if (navigator.vibrate) {
    navigator.vibrate(10)
  }

  // 预加载数据
  currentReplies.value = help.reply || []
  expandedModalReplies.value = {} // 重置展开状态

  // 添加微小延迟，让点击动画完成
  setTimeout(() => {
    showRepliesModal.value = true
  }, 50)
}

// 关闭专家回复弹窗
const closeRepliesModal = () => {
  showRepliesModal.value = false
  currentReplies.value = []
  expandedModalReplies.value = {}
}

// 切换弹窗中单条回复的展开/收起状态
const toggleModalReplyExpand = (index) => {
  expandedModalReplies.value[index] = !expandedModalReplies.value[index]
}

// 打开评论回复弹窗
const openCommentModal = (help) => {
  // 添加触觉反馈（如果支持）
  if (navigator.vibrate) {
    navigator.vibrate(10)
  }

  // 设置当前智库求助项
  currentHelpItem.value = help

  // 重置表单状态
  commentForm.value = {
    content: '',
    submitting: false,
    error: false,
    errorMessage: ''
  }

  // 添加微小延迟，让点击动画完成
  setTimeout(() => {
    showCommentModal.value = true
  }, 50)
}

// 关闭评论回复弹窗
const closeCommentModal = () => {
  showCommentModal.value = false
  currentHelpItem.value = null
  commentForm.value = {
    content: '',
    submitting: false,
    error: false,
    errorMessage: ''
  }
}

// 打开智库求助弹窗
const openExpertHelpModal = (help) => {
  // 添加触觉反馈（如果支持）
  if (navigator.vibrate) {
    navigator.vibrate(10)
  }

  // 设置当前智库求助项
  currentHelpItem.value = help

  // 重置表单状态
  expertHelpForm.value = {
    content: '',
    submitting: false,
    error: false,
    errorMessage: '',
    attachments: []
  }

  // 添加微小延迟，让点击动画完成
  setTimeout(() => {
    showExpertHelpModal.value = true
  }, 50)
}

// 关闭智库求助弹窗
const closeExpertHelpModal = () => {
  showExpertHelpModal.value = false
  currentHelpItem.value = null
  expertHelpForm.value = {
    content: '',
    submitting: false,
    error: false,
    errorMessage: '',
    attachments: []
  }
}

// 处理底部输入框点击事件
const openBottomExpertHelpModal = () => {
  // 添加触觉反馈（如果支持）
  if (navigator.vibrate) {
    navigator.vibrate(10)
  }

  // 使用第一个智库求助项，如果没有则创建一个默认的
  const defaultHelp = issue.value?.expertHelp?.[0] || { id: 'default' }

  // 设置当前智库求助项
  currentHelpItem.value = defaultHelp

  // 重置表单状态
  expertHelpForm.value = {
    content: '',
    submitting: false,
    error: false,
    errorMessage: '',
    attachments: []
  }

  // 添加微小延迟，让点击动画完成
  setTimeout(() => {
    showExpertHelpModal.value = true
  }, 50)
}

// 提交评论回复
const submitComment = async () => {
  if (!commentForm.value.content.trim()) {
    showToast('请输入回复内容')
    return
  }

  commentForm.value.submitting = true
  commentForm.value.error = false

  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))

    // 这里应该调用实际的API
    // const response = await api.submitHelpComment({
    //   helpId: currentHelpItem.value.id,
    //   content: commentForm.value.content
    // })

    showToast('回复提交成功')
    closeCommentModal()

    // 可以在这里刷新数据或更新本地状态

  } catch (error) {
    commentForm.value.error = true
    commentForm.value.errorMessage = error.message || '提交失败，请重试'
    showToast('提交失败，请重试')
  } finally {
    commentForm.value.submitting = false
  }
}

// 加载问题详情
const loadIssueDetail = () => {
  loading.value = true
  const issueId = route.params.id

  // 模拟异步加载过程
  setTimeout(() => {
    // 处理不同格式的issueId
    let targetIssue = null

    // 如果是数字格式，直接使用
    if (!isNaN(issueId)) {
      targetIssue = mockIssues[parseInt(issueId)]
    } else {
      // 如果是字符串格式（如'issue_001'），需要映射到对应的数字ID
      const issueMapping = {
        'issue_001': 1,
        'issue_002': 2,
        'issue_003': 3,
        'issue_004': 4,
        'issue_005': 5
      }
      const mappedId = issueMapping[issueId]
      if (mappedId) {
        targetIssue = mockIssues[mappedId]
      }
    }

    issue.value = targetIssue
    loading.value = false

    // 加载完成后检查是否显示留言表单
    if (issue.value) {
      checkShowMessageForm()
    }
  }, 500) // 模拟500ms的加载时间
}

onMounted(() => {
  loadIssueDetail()
})
</script>

<style scoped>
.issue-detail {
  min-height: 100vh;
  background-color: #f7f8fa;
}


/* 加载状态样式 */
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
  padding: 20px;
}

.loading-content {
  text-align: center;
}

/* 无数据状态样式 */
.no-data-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
  padding: 20px;
}

.no-data-content {
  text-align: center;
  max-width: 300px;
}

.no-data-icon {
  margin-bottom: 16px;
}

.no-data-text {
  margin-bottom: 24px;
}

.no-data-title {
  font-size: 18px;
  font-weight: 600;
  color: #323233;
  margin: 0 0 8px 0;
}

.no-data-description {
  font-size: 14px;
  color: #969799;
  line-height: 1.5;
  margin: 0;
}

.no-data-actions {
  margin-top: 24px;
}


.content {
  padding: 16px 16px 85px;
  margin-top: 46px;
  /* 为固定导航栏留出空间 */
}

.issue-card {
  background: white;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.issue-header {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.issue-title {
  font-size: 18px;
  font-weight: 600;
  color: #323233;
  line-height: 1.4;
  margin: 0;
  flex: 1;
  margin-bottom: 8px;
}

/* .issue-meta {
  display: flex;
  flex-direction: column;
  gap: 8px;
} */

.status-tag {
  flex-shrink: 0;
}

.time-info {
  font-size: 12px;
  color: #969799;
}

.meta-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 8px;
  font-size: 14px;
  line-height: 1.4;
  gap: 8px;
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
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.issue-content,
.attachments-section,
.department-replies,
.expert-help {
  padding: 10px;
  border-radius: 12px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #323233;
  margin-bottom: 10px;
  padding-bottom: 5px;
  border-bottom: 1px solid #e4e7ed;
}

.content-text {
  font-size: 14px;
  /* color: #646566; */
  line-height: 1.6;
  margin: 0;
}

/* 附件分类样式 */
.attachment-section-title {
  font-size: 14px;
  font-weight: 600;
  color: #323233;
  margin: 16px 0 12px 0;
}

/* 图片附件样式 */
.image-attachments-section {
  margin-top: 16px;
}

.image-attachments-grid {
  /* display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 12px; */
}

.image-attachment-item {
  cursor: pointer;
  transition: transform 0.2s;
  text-align: center;
}

.image-attachment-item:active {
  transform: scale(0.95);
}

.image-thumbnail-container {
  position: relative;
  width: 100%;
  /* height: 80px; */
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #ebedf0;
  background-color: #f7f8fa;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.2s;
}

.image-attachment-item:hover .image-thumbnail-container {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.image-thumbnail {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.2s;
}

.image-attachment-item:hover .image-thumbnail {
  transform: scale(1.05);
}

.image-attachment-name {
  font-size: 12px;
  color: #646566;
  margin-top: 6px;
  display: block;
  word-break: break-all;
  line-height: 1.3;
}

/* 其他文件样式 */
.other-attachments-section {
  margin-top: 16px;
}

.other-attachments-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.other-attachment-item {
  display: flex;
  align-items: center;
}

.other-attachment-item:hover {
  background-color: #f0f1f5;
}

.other-attachment-item:active {
  background-color: #e8e9ed;
}

.other-attachment-item .file-icon {
  font-size: 20px;
  color: #1989fa;
  margin-right: 5px;
  flex-shrink: 0;
}

.other-attachment-name {
  font-size: 14px;
  color: #323233;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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

/* 评论按钮样式 */
.reply-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.comment-icon-btn {
  font-size: 24px;
  color: #1989fa;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  position: relative;
  overflow: hidden;
  background: rgba(25, 137, 250, 0.1);
  border: 1px solid #1989fa;
  min-width: 40px;
  min-height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.comment-icon-btn::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  background: rgba(25, 137, 250, 0.1);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  z-index: 0;
}

.comment-icon-btn:hover {
  color: #0570d9;
  transform: scale(1.1);
}

.comment-icon-btn:active {
  transform: scale(0.95);
  color: #0570d9;
}

.comment-icon-btn:active::before {
  width: 100%;
  height: 100%;
}

/* 评论弹窗样式 */
.comment-modal {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #fff;
  animation: modalSlideIn 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.comment-modal .modal-header {
  padding: 20px 20px 10px;
  border-bottom: 1px solid #ebedf0;
  flex-shrink: 0;
}

.comment-modal .modal-title {
  font-size: 18px;
  font-weight: 600;
  color: #323233;
  margin: 0;
  text-align: center;
}

.comment-modal .modal-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.comment-form {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.comment-form .van-field {
  flex: 1;
  margin-bottom: 20px;
  border: 1px solid #ebedf0;
  border-radius: 8px;
  background: #f7f8fa;
}

.comment-form .van-field:deep(.van-field__control) {
  background: transparent;
  resize: none;
}

.form-actions {
  display: flex;
  gap: 12px;
  margin-top: auto;
}

.form-actions .van-button {
  flex: 1;
  height: 44px;
  border-radius: 8px;
  font-weight: 500;
}

.form-actions .van-button--default {
  background: #f7f8fa;
  border-color: #ebedf0;
  color: #646566;
}

.form-actions .van-button--primary {
  background: linear-gradient(135deg, #1989fa 0%, #0570d9 100%);
  border: none;
  box-shadow: 0 2px 8px rgba(25, 137, 250, 0.3);
}

.form-actions .van-button--primary:active {
  transform: translateY(1px);
  box-shadow: 0 1px 4px rgba(25, 137, 250, 0.3);
}

.reply-content-container {
  display: flex;
  flex-direction: column;
  align-items: end;
}

/* 智库求助弹窗样式 */
.expert-help-modal {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #fff;
  animation: modalSlideIn 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.expert-help-modal .modal-header {
  padding: 20px 20px 10px;
  border-bottom: 1px solid #ebedf0;
  flex-shrink: 0;
}

.expert-help-modal .modal-title {
  font-size: 18px;
  font-weight: 600;
  color: #323233;
  margin: 0;
  text-align: center;
}

.expert-help-modal .modal-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.expert-help-modal .help-form {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.expert-help-modal .input-container {
  position: relative;
  margin-bottom: 20px;
}

.expert-help-modal .van-field {
  border: 1px solid #ebedf0;
  border-radius: 8px;
  background: #f7f8fa;
}

.expert-help-modal .van-field:deep(.van-field__control) {
  background: transparent;
  resize: none;
}

.expert-help-modal .attachment-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 32px;
  height: 32px;
  background: #1989fa;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.3s ease;
  z-index: 10;
}

.expert-help-modal .attachment-btn:hover {
  background: #0570d9;
  transform: scale(1.05);
}

.expert-help-modal .attachment-btn:active {
  transform: scale(0.95);
}

.expert-help-modal .uploaded-files-container {
  margin-bottom: 20px;
}

.expert-help-modal .uploaded-images-section {
  margin-bottom: 15px;
}

.expert-help-modal .uploaded-images-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 10px;
}

.expert-help-modal .uploaded-image-item {
  position: relative;
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
  background: #f7f8fa;
}

.expert-help-modal .uploaded-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.expert-help-modal .uploaded-files-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.expert-help-modal .uploaded-file-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px;
  background: #f7f8fa;
  border-radius: 8px;
  border: 1px solid #ebedf0;
}

.expert-help-modal .file-content {
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
}

.expert-help-modal .file-icon {
  font-size: 18px;
  color: #1989fa;
  margin-right: 8px;
  flex-shrink: 0;
}

.expert-help-modal .file-name {
  font-size: 14px;
  color: #323233;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.expert-help-modal .delete-icon {
  width: 24px;
  height: 24px;
  background: #ee0a24;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-left: 8px;
  flex-shrink: 0;
}

.expert-help-modal .delete-icon:hover {
  background: #c8102e;
  transform: scale(1.1);
}

.expert-help-modal .delete-icon:active {
  transform: scale(0.9);
}

.expert-help-modal .delete-icon .van-icon {
  color: white;
  font-size: 12px;
}

.expert-help-modal .form-actions {
  display: flex;
  gap: 12px;
  margin-top: auto;
}

.expert-help-modal .form-actions .van-button {
  flex: 1;
  height: 44px;
  border-radius: 8px;
  font-weight: 500;
}

.expert-help-modal .form-actions .van-button--default {
  background: #f7f8fa;
  border-color: #ebedf0;
  color: #646566;
}

.expert-help-modal .form-actions .van-button--primary {
  background: linear-gradient(135deg, #1989fa 0%, #0570d9 100%);
  border: none;
  box-shadow: 0 2px 8px rgba(25, 137, 250, 0.3);
}

.expert-help-modal .form-actions .van-button--primary:active {
  transform: translateY(1px);
  box-shadow: 0 1px 4px rgba(25, 137, 250, 0.3);
}

.reply-content {
  font-size: 14px;
  color: #646566;
  line-height: 1.5;
  margin: 0;
}

.replies-count-trigger {
  font-size: 14px;
  text-align: end;
  color: #1989fa;
}

/* 微博评论区风格样式 */
.expert-replies-section {
  margin-top: 12px;
}

.latest-reply {
  background-color: #f7f8fa;
  border-radius: 8px;
  padding-left: 24px;
}

.reply-count-trigger {
  color: #1989fa;
  font-size: 13px;
  cursor: pointer;
  padding: 8px 0;
  user-select: none;
  transition: opacity 0.2s;
}

.reply-count-trigger:active {
  opacity: 0.7;
}

.all-replies-dropdown {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  margin-top: 8px;
  overflow: hidden;
}

.dropdown-reply-item {
  padding: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.dropdown-reply-item:last-child {
  border-bottom: none;
}

.reply-content-wrapper {
  display: flex;
  flex-direction: column;
  margin-bottom: 12px;
}

.reply-content-truncated {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.expand-button {
  color: #1989fa;
  font-size: 13px;
  cursor: pointer;
  margin-bottom: 4px;
  user-select: none;
  transition: opacity 0.2s;
  text-align: end;
}

.expand-button:active {
  opacity: 0.7;
}

/* 部门回复附件样式 */
.department-reply-attachments {
  margin-top: 5px;
}

.department-reply-attachments .uploaded-images-section {
  margin-bottom: 12px;
}

.department-reply-attachments .uploaded-images-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 8px;
}

.department-reply-attachments .uploaded-image-item {
  position: relative;
  aspect-ratio: 1;
  border-radius: 6px;
  overflow: hidden;
  background: #f7f8fa;
}

.department-reply-attachments .uploaded-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  cursor: pointer;
}

.department-reply-attachments .uploaded-files-section {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.department-reply-attachments .uploaded-file-row {
  display: flex;
  align-items: center;
}

.department-reply-attachments .file-content {
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
  cursor: pointer;
}

.department-reply-attachments .file-icon {
  font-size: 16px;
  color: #1989fa;
  margin-right: 6px;
  flex-shrink: 0;
}

.department-reply-attachments .file-name {
  font-size: 13px;
  color: #323233;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.expert-name {
  font-weight: 600;
  color: #1989fa;
  font-size: 14px;
}

.expert-reply-time {
  color: #969799;
  font-size: 12px;
  margin-left: 8px;
}

.help-content {
  display: flex;
  flex-direction: column;
  /* gap: 15px; */
}

.help-title {
  font-size: 14px;
  font-weight: 600;
  color: #323233;
  margin: 0 0 8px 0;
}

.help-request,
.expert-reply {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: end;
}

.help-text {
  font-size: 14px;
  color: #646566;
  line-height: 1.5;
}

.help-time {
  font-size: 12px;
  color: #969799;
}

.loading-state {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
}

/* 留言功能样式 */
.message-section {
  background-color: white;
  padding: 20px;
  border-radius: 12px;
  margin-top: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.message-form {
  margin-top: 16px;
}

/* 输入框容器样式 */
.input-container {
  position: relative;

  background-color: #f7f8fa;
  border-radius: 2.133333vw;
  border: 1px solid #ebedf0;
  margin-bottom: 4.266667vw;
}

/* 附件上传按钮样式 */
.attachment-btn {
  position: absolute;
  /* bottom: 8px; */
  top: 90px;
  left: 8px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.3s ease;
  z-index: 10;
}

.attachment-btn:hover {
  background-color: #1989fa;
  border-color: #1989fa;
  color: white;
}

.attachment-btn:active {
  transform: scale(0.95);
}

.message-form :deep(.van-field) {
  background-color: #f7f8fa;
  /* border-radius: 8px;
  border: 1px solid #ebedf0;
  margin-bottom: 16px; */
}

.message-form :deep(.van-field--error) {
  border-color: #ee0a24;
}

.message-form :deep(.van-field__control) {
  font-size: 14px;
  line-height: 1.5;
}

.uploaded-files-container {
  padding: 10px;
}

/* 图片附件区域 */
.uploaded-images-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
  /* gap: 8px; */
}

.uploaded-image-item {
  position: relative;
  border-radius: 8px;
}

.uploaded-image {
  width: 90px;
  height: 90px;
  object-fit: cover;
  border-radius: 8px;
}

/* 其他文件附件区域 */
.uploaded-files-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.uploaded-file-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.file-content {
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
}

.file-icon {
  font-size: 20px;
  color: #666;
  margin-right: 2px;
  flex-shrink: 0;
}

.file-name {
  font-size: 14px;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
  min-width: 0;
}

.delete-icon {
  position: absolute;
  top: -6px;
  right: 12px;
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
  z-index: 1;
  transition: all 0.3s ease;
}

/* 文件行中的删除按钮 */
.uploaded-file-row .delete-icon {
  position: static;
  width: 16px;
  height: 16px;
  margin-left: 12px;
  flex-shrink: 0;
}

.delete-icon:hover {
  background-color: rgba(255, 0, 0, 0.8);
}

.upload-tip {
  display: flex;
  align-items: center;
  font-size: 12px;
  color: #666;
  line-height: 1.4;
  margin-top: 8px;
  padding: 8px 12px;
  background-color: #f0f9ff;
  border-radius: 6px;
  border: 1px solid #e1f5fe;
}

.upload-tip .van-icon {
  margin-right: 4px;
  color: #1989fa;
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

/* 专家回复弹窗样式 */
.replies-modal {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #fff;
}

.modal-header {
  padding: 20px 16px 16px;
  border-bottom: 1px solid #f0f0f0;
  flex-shrink: 0;
}

.modal-title {
  font-size: 18px;
  font-weight: 600;
  color: #323233;
  margin: 0;
  text-align: center;
}

.modal-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  padding-bottom: 50px !important;
  -webkit-overflow-scrolling: touch;
}

.modal-reply-item {
  background-color: #f7f8fa;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  transition: all 0.3s ease;
}

.modal-reply-item:last-child {
  margin-bottom: 0;
}

.modal-reply-item .reply-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.modal-reply-item .expert-name {
  font-weight: 600;
  color: #1989fa;
  font-size: 15px;
}

.modal-reply-item .reply-time {
  color: #969799;
  font-size: 13px;
}

.modal-reply-item .reply-content {
  font-size: 15px;
  color: #323233;
  line-height: 1.6;
  margin: 0;
  word-break: break-word;
}

.modal-reply-item .expand-button {
  color: #1989fa;
  font-size: 14px;
  cursor: pointer;
  margin-top: 8px;
  user-select: none;
  transition: opacity 0.2s;
  display: inline-block;
  text-align: end;
}

.modal-reply-item .expand-button:active {
  opacity: 0.7;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .issue-header {
    flex-direction: column;
    align-items: flex-start;
    /* gap: 12px; */
  }

  .status-tag {
    align-self: flex-start;
  }

  .replies-modal {
    height: 100%;
  }

  .modal-header {
    padding: 16px;
  }

  .modal-title {
    font-size: 16px;
  }

  .modal-content {
    padding: 12px;
  }

  .modal-reply-item {
    padding: 12px;
    margin-bottom: 12px;
  }

  /* 移动端动画优化 */
  .replies-count-trigger {
    transition: all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  }

  .modal-reply-item {
    animation-duration: 0.4s;
  }

  .replies-modal {
    animation-duration: 0.3s;
  }
}

/* 高性能设备动画增强 */
@media (prefers-reduced-motion: no-preference) and (min-resolution: 2dppx) {
  .replies-count-trigger {
    transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  }

  .modal-reply-item {
    animation-duration: 0.6s;
  }

  .replies-modal {
    animation-duration: 0.5s;
  }
}

/* 减少动画偏好设置 */
@media (prefers-reduced-motion: reduce) {

  .replies-count-trigger,
  .modal-reply-item,
  .replies-modal,
  .modal-reply-item .expand-button {
    animation: none !important;
    transition: none !important;
  }

  .van-popup--bottom {
    transition: transform 0.2s ease !important;
  }
}

/* 弹窗动画优化 */
.van-popup--bottom {
  transition: transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

/* 点击触发元素动画效果 */
.replies-count-trigger {
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  transform-origin: center;
  position: relative;
  overflow: hidden;
}

.replies-count-trigger::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  background: rgba(25, 137, 250, 0.1);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  z-index: 0;
}

.replies-count-trigger:active {
  transform: scale(0.98);
  background-color: rgba(25, 137, 250, 0.05);
}

.replies-count-trigger:active::before {
  width: 200%;
  height: 200%;
}

.replies-count-trigger .count-text,
.replies-count-trigger .arrow-icon {
  position: relative;
  z-index: 1;
  transition: all 0.2s ease;
}

.replies-count-trigger:active .count-text {
  color: #1989fa;
}

.replies-count-trigger:active .arrow-icon {
  transform: translateX(2px);
  color: #1989fa;
}

/* 弹窗内容渐入动画 */
.replies-modal {
  animation: modalSlideIn 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

@keyframes modalSlideIn {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }

  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 回复项目渐入动画 */
.modal-reply-item {
  animation: replyItemFadeIn 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  animation-fill-mode: both;
}

.modal-reply-item:nth-child(1) {
  animation-delay: 0.1s;
}

.modal-reply-item:nth-child(2) {
  animation-delay: 0.15s;
}

.modal-reply-item:nth-child(3) {
  animation-delay: 0.2s;
}

.modal-reply-item:nth-child(4) {
  animation-delay: 0.25s;
}

.modal-reply-item:nth-child(5) {
  animation-delay: 0.3s;
}

.modal-reply-item:nth-child(n+6) {
  animation-delay: 0.35s;
}

@keyframes replyItemFadeIn {
  0% {
    opacity: 0;
    transform: translateY(15px) scale(0.95);
  }

  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* 优化展开按钮动画 */
.modal-reply-item .expand-button {
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  position: relative;
}

.modal-reply-item .expand-button:hover {
  transform: translateY(-1px);
  color: #0570d9;
}

.modal-reply-item .expand-button:active {
  transform: translateY(0) scale(0.95);
  opacity: 0.8;
}

.upload-action-item span {
  font-size: 16px;
  color: #333;
}

.form-actions {
  display: flex;
  justify-content: center;
  margin-top: 16px;
}

.form-actions .van-button {
  width: 100%;
  height: 44px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
}

/* 底部固定输入框样式 */
.bottom-input-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  border-top: 1px solid #ebedf0;
  padding: 12px 16px;
  z-index: 999;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
}

/* 底部输入框过渡动画 */
.bottom-input-enter-active,
.bottom-input-leave-active {
  transition: all 0.3s ease;
}

.bottom-input-enter-from,
.bottom-input-leave-to {
  transform: translateY(100%);
  opacity: 0;
}

.bottom-input-enter-to,
.bottom-input-leave-from {
  transform: translateY(0);
  opacity: 1;
}

.input-wrapper {
  display: flex;
  align-items: center;
  background: #f7f8fa;
  border: 1px solid #ebedf0;
  border-radius: 20px;
  padding: 10px 16px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.input-wrapper:hover {
  background: #f2f3f5;
  border-color: #c8c9cc;
}

.input-wrapper:active {
  background: #e8e9eb;
  transform: scale(0.98);
}

.input-icon {
  color: #969799;
  margin-right: 8px;
}

.input-placeholder {
  flex: 1;
  color: #969799;
  font-size: 14px;
}

.arrow-icon {
  color: #969799;
  transform: rotate(-90deg);
  transition: transform 0.3s ease;
}

.input-wrapper:hover .arrow-icon {
  transform: rotate(-90deg) scale(1.1);
}

/* 评论图片样式 */
.comment-image-container {
  margin-top: 8px;
  margin-right: 10px;
  display: flex;
  justify-content: flex-start;
}

.comment-image {
  width: 20px;
  height: 20px;
  object-fit: cover;
  border-radius: 8px;
  opacity: 0.8;
  transition: opacity 0.3s ease;
}

.comment-image:hover {
  opacity: 1;
}

:deep(#van-field-1-input) {
  color: #000;
}
</style>
