<template>
  <div class="attachment-viewer">
    <!-- 图片附件 -->
    <div v-if="type === 'small' && imageAttachments.length > 0" class="image-attachments">
      <!-- <div class="attachment-title">图片附件</div> -->
      <div class="image-grid">
        <div v-for="(attachment, index) in imageAttachments" :key="index" class="image-item"
          @click="previewImage(attachment, index)">
          <img :src="attachment.url" :alt="attachment.name" />
          <p>{{ attachment.name }}</p>
        </div>
      </div>
    </div>

    <div v-if="type === 'big' && imageAttachments.length > 0" class="image-attachments">
      <div>
        <div v-for="(attachment, index) in imageAttachments" :key="index" class="image-item-big"
          @click="previewImage(attachment, index)">
          <img :src="attachment.url" :alt="attachment.name" />
          <p>{{ attachment.name }}</p>
        </div>
      </div>
    </div>

    <!-- 其他附件 -->
    <div v-if="otherAttachments.length > 0" class="other-attachments">
      <div class="attachment-title" v-if="type === 'big'">其他附件</div>
      <div class="file-list">
        <div v-for="(attachment, index) in otherAttachments" :key="index" class="file-item"
          @click="downloadFile(attachment)">
          <van-icon :name="getFileIcon(attachment)" class="file-icon" />
          <div class="file-info">
            <div class="file-name">{{ attachment.name }}</div>
          </div>
          <van-icon name="down" class="download-icon" />
        </div>
      </div>
    </div>

    <!-- 图片预览弹窗 -->
    <van-image-preview v-model:show="showImagePreview" :images="previewImages" :start-position="currentImageIndex"
      @change="onImageChange" />
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { showToast } from 'vant'

export default {
  name: 'AttachmentViewer',
  props: {
    attachments: {
      type: Array,
      default: () => []
    },
    type: {
      type: String,
      default: 'small'
    }
  },
  setup(props) {
    const showImagePreview = ref(false)
    const currentImageIndex = ref(0)

    // 分离图片和其他附件
    const imageAttachments = computed(() => {
      return props.attachments.filter(attachment =>
        attachment.type === 'image' ||
        (attachment.name && /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(attachment.name))
      )
    })

    const otherAttachments = computed(() => {
      return props.attachments.filter(attachment =>
        attachment.type !== 'image' &&
        !(attachment.name && /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(attachment.name))
      )
    })

    // 预览图片URL列表
    const previewImages = computed(() => {
      return imageAttachments.value.map(attachment => attachment.url)
    })

    // 获取文件图标
    const getFileIcon = (attachment) => {
      const extension = attachment.name?.split('.').pop()?.toLowerCase()

      const iconMap = {
        'pdf': 'description',
        'doc': 'description',
        'docx': 'description',
        'xls': 'description',
        'xlsx': 'description',
        'ppt': 'description',
        'pptx': 'description',
        'txt': 'description',
        'zip': 'description',
        'rar': 'description',
        '7z': 'description',
        'mp4': 'video-o',
        'avi': 'video-o',
        'mov': 'video-o',
        'mp3': 'music-o',
        'wav': 'music-o',
        'flac': 'music-o'
      }

      return iconMap[extension] || 'description'
    }

    // 格式化文件大小
    const formatFileSize = (bytes) => {
      if (!bytes) return ''

      const sizes = ['B', 'KB', 'MB', 'GB']
      const k = 1024
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    // 预览图片
    const previewImage = (attachment, index) => {
      currentImageIndex.value = index
      showImagePreview.value = true
    }

    // 图片切换事件
    const onImageChange = (index) => {
      currentImageIndex.value = index
    }

    // 下载文件
    const downloadFile = (attachment) => {
      try {
        // 创建下载链接
        const link = document.createElement('a')
        link.href = attachment.url
        link.download = attachment.name
        link.target = '_blank'

        // 触发下载
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        showToast('开始下载')
      } catch (error) {
        console.error('下载失败:', error)
        showToast('下载失败')
      }
    }

    return {
      showImagePreview,
      currentImageIndex,
      imageAttachments,
      otherAttachments,
      previewImages,
      getFileIcon,
      formatFileSize,
      previewImage,
      onImageChange,
      downloadFile
    }
  }
}
</script>

<style scoped>
.attachment-title {
  font-size: 14px;
  font-weight: 600;
  color: #323233;
  margin-bottom: 12px;
  padding-left: 8px;
  border-left: 3px solid #1989fa;
}

/* 图片附件样式 */
.image-attachments {
  margin-bottom: 16px;
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 8px;
}

.image-item {
  position: relative;
  width: 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
}

.image-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}


.image-item-big {
  display: flex;
  flex-direction: column;
  /* max-width: 300px; */
  /* max-height: 200px; */
}

.image-item-big p {
  font-size: 14px;
  text-align: center;
  margin-top: 5px;
}

.image-item-big img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* .image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
}

.image-item:hover .image-overlay {
  opacity: 1;
}

.image-overlay .van-icon {
  color: white;
  font-size: 20px;
} */

/* 其他附件样式 */

.file-list {
  background: #f7f8fa;
  border-radius: 8px;
  overflow: hidden;
}

.file-item {
  display: flex;
  align-items: center;
  padding-bottom: 12px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.file-item:last-child {
  border-bottom: none;
}

.file-item:hover {
  background: #f0f1f2;
}

.file-item:active {
  background: #e8e9ea;
}

.file-icon {
  font-size: 20px;
  color: #1989fa;
  margin-right: 12px;
  flex-shrink: 0;
}

.file-info {
  flex: 1;
  min-width: 0;
}

.file-name {
  font-size: 14px;
  color: #323233;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-bottom: 2px;
}

.file-size {
  font-size: 12px;
  color: #969799;
}

.download-icon {
  font-size: 16px;
  color: #969799;
  flex-shrink: 0;
}

/* 响应式设计 */
@media (max-width: 375px) {
  .image-grid {
    grid-template-columns: repeat(auto-fill, minmax(70px, 1fr));
    gap: 6px;
  }

  .image-item {
    width: 70px;
    height: 70px;
  }

  .file-item {
    /* padding: 10px 12px; */
  }

  .file-name {
    font-size: 13px;
  }
}
</style>