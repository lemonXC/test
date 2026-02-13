<template>
  <div class="points-page">
    <van-nav-bar title="我的积分" left-text="返回" left-arrow @click-left="$router.go(-1)" />
    <div class="page-content">
      <div class="summary-card">
        <div class="summary-header">
          <van-icon name="gold-coin-o" size="26" />
          <span>当前积分</span>
        </div>
        <div class="points-value">{{ points }}</div>
        <div class="summary-actions">
          <van-button type="primary" size="small" @click="onRefresh" :loading="loading">刷新</van-button>
          <van-button type="default" size="small" @click="onRule">规则</van-button>
        </div>
      </div>

      <div class="list-card">
        <van-cell-group>
          <van-cell
            v-for="item in records"
            :key="item.id"
            :title="item.title"
            :label="formatLabel(item)"
            :value="formatValue(item)"
            icon="medal-o"
          />
        </van-cell-group>
        <div v-if="records.length === 0" class="empty">暂无积分记录</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import authService from '@/services/authService'
import { showToast } from 'vant'

const points = ref(0)
const records = ref([])
const loading = ref(false)

const loadData = async () => {
  loading.value = true
  try {
    const info = await authService.getUserInfo()
    if (info.success) {
      const user = info.data.user
      const key = `user_points_${user.id}`
      const keyRecords = `user_points_records_${user.id}`
      const storedPoints = parseInt(localStorage.getItem(key) || '120', 10)
      const storedRecords = JSON.parse(localStorage.getItem(keyRecords) || '[]')
      if (storedRecords.length === 0) {
        const init = [
          { id: 1, title: '完成任务', change: +20, time: new Date().toLocaleString('zh-CN') },
          { id: 2, title: '每日登录', change: +5, time: new Date().toLocaleString('zh-CN') },
          { id: 3, title: '违规扣减', change: -10, time: new Date().toLocaleString('zh-CN') }
        ]
        localStorage.setItem(keyRecords, JSON.stringify(init))
        records.value = init
      } else {
        records.value = storedRecords
      }
      points.value = storedPoints
    }
  } finally {
    loading.value = false
  }
}

const onRefresh = () => {
  loadData()
  showToast('已刷新')
}

const onRule = () => {
  showToast('积分规则：完成任务、登录、互动等可获得积分')
}

const formatLabel = (item) => `${item.time}`
const formatValue = (item) => `${item.change > 0 ? '+' : ''}${item.change}`

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.points-page {
  min-height: 100vh;
  background: #f7f8fa;
}
.page-content {
  padding: 16px;
}
.summary-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  margin-bottom: 16px;
  padding: 16px;
}
.summary-header {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #323233;
  margin-bottom: 12px;
}
.points-value {
  font-size: 32px;
  font-weight: 600;
  color: #1989fa;
}
.summary-actions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}
.list-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}
.empty {
  text-align: center;
  color: #969799;
  padding: 20px;
}
</style>