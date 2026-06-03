<template>
  <view class="page">
    <!-- ===== 上半部分：用户信息区 ===== -->
    <view class="user-section" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="user-header">
        <view class="avatar-wrap">
          <image class="avatar" src="/static/logo.png" mode="aspectFill" />
        </view>
        <view class="user-info">
          <text class="username">{{ userInfo.username }}</text>
          <text class="user-id">ID: {{ userInfo.id }}</text>
        </view>
        <view class="settings-btn" @click="onSettings">
          <uni-icons type="gear" size="22" color="#ffffff" />
        </view>
      </view>

      <view class="stats-row">
        <view class="stat-item" @click="activeTab = '行程计划'">
          <text class="stat-value">{{ tripPlanCount }}</text>
          <text class="stat-label">行程计划</text>
        </view>
        <view class="stat-divider"></view>
        <view class="stat-item" @click="activeTab = '账单'">
          <text class="stat-value">¥{{ totalExpense }}</text>
          <text class="stat-label">账单</text>
        </view>
      </view>
    </view>

    <!-- ===== 下半部分：内容区 ===== -->
    <view class="memo-section">
      <view class="tab-bar">
        <view class="tab-item" :class="{ active: activeTab === '行程计划' }" @click="activeTab = '行程计划'">
          <text>行程计划</text>
        </view>
        <view class="tab-item" :class="{ active: activeTab === '账单' }" @click="activeTab = '账单'">
          <text>账单</text>
        </view>
      </view>

      <!-- ===== 行程计划 Tab ===== -->
      <view v-if="activeTab === '行程计划'">
        <view class="action-row">
          <scroll-view class="tag-scroll" scroll-x :show-scrollbar="false">
            <view class="tag-list">
              <view v-for="tag in quickTags" :key="tag" class="capsule-tag"
                :class="{ active: activeTag === tag }" @click="activeTag = tag">
                <text>{{ tag }}</text>
              </view>
            </view>
          </scroll-view>
          <view class="sort-btn" @click="showTripForm = true">
            <uni-icons type="plusempty" size="18" color="#1976d2" />
          </view>
        </view>

        <scroll-view class="content-scroll" scroll-y :style="{ height: activeContentHeight + 'px' }">
          <!-- 按日期分组的行程 -->
          <view v-if="filteredTripGroups.length === 0" class="empty-state">
            <uni-icons type="calendar" size="48" color="#ccc" />
            <text class="empty-text">暂无行程，点击右上角 + 添加</text>
          </view>

          <view class="section-card" v-for="group in filteredTripGroups" :key="group.date">
            <view class="section-header">
              <view class="section-indicator" :class="{ green: group.status === 'planned' }"></view>
              <text class="section-title">{{ group.date }}</text>
              <text class="section-subtitle">{{ group.items.length }} 个行程</text>
            </view>
            <view class="plan-list">
              <view class="plan-item" v-for="item in group.items" :key="item.id" @longpress="onTripLongPress(item)">
                <view class="plan-dot" :class="{ green: item.status !== 'pending' }"></view>
                <view class="plan-content">
                  <text class="plan-name">{{ item.name }}</text>
                  <text class="plan-meta">{{ item.time || '待定' }} · {{ item.note || '暂无备注' }}</text>
                </view>
                <view class="plan-status-tag" :class="item.status">
                  <text>{{ statusLabel[item.status] || '待规划' }}</text>
                </view>
              </view>
            </view>
          </view>

          <view class="add-day-btn" @click="showTripForm = true">
            <uni-icons type="plusempty" size="18" color="#1976d2" />
            <text class="add-day-text">添加行程</text>
          </view>

          <view class="bottom-spacer"></view>
        </scroll-view>
      </view>

      <!-- ===== 账单 Tab ===== -->
      <view v-if="activeTab === '账单'">
        <view class="bill-summary">
          <view class="bill-summary-item">
            <text class="bill-summary-label">总支出</text>
            <text class="bill-summary-value">¥{{ totalExpense }}</text>
          </view>
          <view class="bill-summary-divider"></view>
          <view class="bill-summary-item">
            <text class="bill-summary-label">笔数</text>
            <text class="bill-summary-value">{{ allBills.length }}</text>
          </view>
          <view class="bill-summary-divider"></view>
          <view class="bill-summary-item">
            <text class="bill-summary-label">日均</text>
            <text class="bill-summary-value">¥{{ avgDaily }}</text>
          </view>
        </view>

        <view class="action-row">
          <scroll-view class="tag-scroll" scroll-x :show-scrollbar="false">
            <view class="tag-list">
              <view v-for="cat in billCategories" :key="cat" class="capsule-tag"
                :class="{ active: activeBillCat === cat }" @click="activeBillCat = cat">
                <text>{{ cat }}</text>
              </view>
            </view>
          </scroll-view>
          <view class="sort-btn" @click="showBillForm = true">
            <uni-icons type="plusempty" size="18" color="#1976d2" />
          </view>
        </view>

        <scroll-view class="content-scroll" scroll-y :style="{ height: activeContentHeight + 'px' }">
          <view v-if="filteredBillGroups.length === 0" class="empty-state">
            <uni-icons type="wallet" size="48" color="#ccc" />
            <text class="empty-text">暂无账单，点击右上角 + 添加</text>
          </view>

          <view class="bill-group" v-for="group in filteredBillGroups" :key="group.date">
            <view class="bill-date-header">
              <text class="bill-date">{{ group.date }}</text>
              <text class="bill-date-total">-¥{{ group.dayTotal }}</text>
            </view>
            <view class="bill-card">
              <view class="bill-item" v-for="item in group.items" :key="item.id" @longpress="onBillLongPress(item)">
                <view class="bill-icon" :style="{ background: item.color || '#1976d2' }">
                  <uni-icons :type="item.icon || 'wallet'" size="18" color="#ffffff" />
                </view>
                <view class="bill-info">
                  <text class="bill-name">{{ item.name }}</text>
                  <text class="bill-category">{{ item.category }}</text>
                </view>
                <text class="bill-amount">-¥{{ item.amount }}</text>
              </view>
            </view>
          </view>

          <view class="add-day-btn" @click="showBillForm = true">
            <uni-icons type="plusempty" size="18" color="#1976d2" />
            <text class="add-day-text">记一笔</text>
          </view>

          <view class="bottom-spacer"></view>
        </scroll-view>
      </view>
    </view>

    <!-- ===== 添加行程弹窗 ===== -->
    <uni-popup ref="tripPopup" type="center" :is-mask-click="true">
      <view class="popup-box">
        <view class="popup-header">
          <text class="popup-title">添加行程</text>
          <view @click="showTripForm = false"><uni-icons type="closeempty" size="20" color="#999" /></view>
        </view>
        <view class="popup-body">
          <input class="form-input" v-model="tripForm.name" placeholder="行程名称（如：外滩夜景）" />
          <input class="form-input" v-model="tripForm.trip_date" placeholder="日期（如：5月28日）" />
          <input class="form-input" v-model="tripForm.time" placeholder="时间（如：晚上 19:00）" />
          <input class="form-input" v-model="tripForm.note" placeholder="备注（如：带相机）" />
          <view class="status-picker">
            <text class="picker-label">状态：</text>
            <view v-for="s in statusOptions" :key="s.value" class="capsule-tag"
              :class="{ active: tripForm.status === s.value }" @click="tripForm.status = s.value">
              <text>{{ s.label }}</text>
            </view>
          </view>
        </view>
        <view class="popup-footer">
          <view class="popup-btn cancel" @click="showTripForm = false"><text>取消</text></view>
          <view class="popup-btn confirm" @click="submitTrip"><text>确认添加</text></view>
        </view>
      </view>
    </uni-popup>

    <!-- ===== 添加账单弹窗 ===== -->
    <uni-popup ref="billPopup" type="center" :is-mask-click="true">
      <view class="popup-box">
        <view class="popup-header">
          <text class="popup-title">记一笔</text>
          <view @click="showBillForm = false"><uni-icons type="closeempty" size="20" color="#999" /></view>
        </view>
        <view class="popup-body">
          <input class="form-input" v-model="billForm.name" placeholder="名称（如：迪士尼门票）" />
          <input class="form-input" v-model.number="billForm.amount" type="digit" placeholder="金额（如：399）" />
          <input class="form-input" v-model="billForm.bill_date" placeholder="日期（如：5月28日）" />
          <view class="status-picker">
            <text class="picker-label">分类：</text>
            <scroll-view scroll-x :show-scrollbar="false" style="flex:1;white-space:nowrap;">
              <view style="display:flex;gap:12rpx;">
                <view v-for="cat in billCatOptions" :key="cat.value" class="capsule-tag"
                  :class="{ active: billForm.category === cat.value }" @click="billForm.category = cat.value">
                  <text>{{ cat.label }}</text>
                </view>
              </view>
            </scroll-view>
          </view>
        </view>
        <view class="popup-footer">
          <view class="popup-btn cancel" @click="showBillForm = false"><text>取消</text></view>
          <view class="popup-btn confirm" @click="submitBill"><text>确认添加</text></view>
        </view>
      </view>
    </uni-popup>

  </view>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { getTripPlans, createTripPlan, deleteTripPlan, getBills, createBill, deleteBill } from '@/utils/api.js'

const userInfo = ref({ id: '--', username: '加载中...' })
const activeTab = ref('行程计划')
const activeTag = ref('全部')
const activeBillCat = ref('全部')
const contentHeight = ref(500)
const statusBarHeight = ref(44)
const showTripForm = ref(false)
const showBillForm = ref(false)
const tripPopup = ref(null)
const billPopup = ref(null)

const quickTags = ['全部', '未完成', '已完成']
const statusLabel = { pending: '未完成', completed: '已完成' }
const statusOptions = [
  { label: '未完成', value: 'pending' },
  { label: '已完成', value: 'completed' },
]
const billCategories = ['全部', '交通', '门票', '餐饮', '住宿', '购物']
const billCatOptions = [
  { label: '交通', value: '交通' },
  { label: '门票', value: '门票' },
  { label: '餐饮', value: '餐饮' },
  { label: '住宿', value: '住宿' },
  { label: '购物', value: '购物' },
]

// 表单数据
const tripForm = ref({ name: '', trip_date: '', time: '', note: '', status: 'pending' })
const billForm = ref({ name: '', category: '门票', amount: '', bill_date: '' })

// 真实数据
const allTripPlans = ref([])
const allBills = ref([])

// 监听弹窗开关
watch(showTripForm, (v) => v ? tripPopup.value?.open() : tripPopup.value?.close())
watch(showBillForm, (v) => v ? billPopup.value?.open() : billPopup.value?.close())

// ============ 行程计划计算属性 ============

const tripPlanCount = computed(() => allTripPlans.value.length)
const activeContentHeight = computed(() => {
  return activeTab.value === '行程计划' ? contentHeight.value + 90 : contentHeight.value
})

const filteredTripGroups = computed(() => {
  let plans = allTripPlans.value
  if (activeTag.value !== '全部') {
    const statusMap = { '未完成': 'pending', '已完成': 'completed' }
    plans = plans.filter(p => p.status === statusMap[activeTag.value])
  }
  const groups = {}
  plans.forEach(item => {
    if (!groups[item.trip_date]) {
      groups[item.trip_date] = { date: item.trip_date, items: [], status: item.status }
    }
    groups[item.trip_date].items.push(item)
  })
  return Object.values(groups)
})

// ============ 账单计算属性 ============

const totalExpense = computed(() => allBills.value.reduce((s, b) => s + b.amount, 0))

const avgDaily = computed(() => {
  const dates = [...new Set(allBills.value.map(b => b.bill_date))]
  if (dates.length === 0) return 0
  return Math.round(totalExpense.value / dates.length)
})

const filteredBillGroups = computed(() => {
  let bills = allBills.value
  if (activeBillCat.value !== '全部') {
    bills = bills.filter(b => b.category === activeBillCat.value)
  }
  const groups = {}
  bills.forEach(item => {
    if (!groups[item.bill_date]) {
      groups[item.bill_date] = { date: item.bill_date, items: [], dayTotal: 0 }
    }
    groups[item.bill_date].items.push(item)
    groups[item.bill_date].dayTotal += item.amount
  })
  return Object.values(groups)
})

// ============ 数据加载 ============

async function loadTripPlans() {
  try {
    const res = await getTripPlans()
    if (res.success) allTripPlans.value = res.data
  } catch (e) {
    console.error('加载行程失败', e)
  }
}

async function loadBills() {
  try {
    const res = await getBills()
    if (res.success) allBills.value = res.data
  } catch (e) {
    console.error('加载账单失败', e)
  }
}

// ============ 提交操作 ============

async function submitTrip() {
  if (!tripForm.value.name.trim()) {
    uni.showToast({ title: '请输入行程名称', icon: 'none' })
    return
  }
  if (!tripForm.value.trip_date.trim()) {
    uni.showToast({ title: '请输入日期', icon: 'none' })
    return
  }
  try {
    const res = await createTripPlan(tripForm.value)
    if (res.success) {
      uni.showToast({ title: '添加成功', icon: 'success' })
      showTripForm.value = false
      tripForm.value = { name: '', trip_date: '', time: '', note: '', status: 'pending' }
      loadTripPlans()
    } else {
      uni.showToast({ title: res.message || '添加失败', icon: 'none' })
    }
  } catch (e) {
    uni.showToast({ title: '网络错误', icon: 'none' })
  }
}

async function submitBill() {
  if (!billForm.value.name.trim()) {
    uni.showToast({ title: '请输入名称', icon: 'none' })
    return
  }
  if (!billForm.value.amount || billForm.value.amount <= 0) {
    uni.showToast({ title: '请输入有效金额', icon: 'none' })
    return
  }
  if (!billForm.value.bill_date.trim()) {
    uni.showToast({ title: '请输入日期', icon: 'none' })
    return
  }
  const catColors = { '交通': '#42a5f5', '门票': '#1976d2', '餐饮': '#ff9800', '住宿': '#7b1fa2', '购物': '#e91e63' }
  const catIcons = { '交通': 'navigate', '门票': 'image', '餐饮': 'coffee', '住宿': 'home', '购物': 'gift' }
  const cat = billForm.value.category
  try {
    const res = await createBill({
      ...billForm.value,
      icon: catIcons[cat] || 'wallet',
      color: catColors[cat] || '#1976d2',
    })
    if (res.success) {
      uni.showToast({ title: '添加成功', icon: 'success' })
      showBillForm.value = false
      billForm.value = { name: '', category: '门票', amount: '', bill_date: '' }
      loadBills()
    } else {
      uni.showToast({ title: res.message || '添加失败', icon: 'none' })
    }
  } catch (e) {
    uni.showToast({ title: '网络错误', icon: 'none' })
  }
}

function onTripLongPress(item) {
  uni.showActionSheet({
    itemList: ['删除此行程'],
    success: async (res) => {
      if (res.tapIndex === 0) {
        await deleteTripPlan(item.id)
        uni.showToast({ title: '已删除', icon: 'success' })
        loadTripPlans()
      }
    },
  })
}

function onBillLongPress(item) {
  uni.showActionSheet({
    itemList: ['删除此账单'],
    success: async (res) => {
      if (res.tapIndex === 0) {
        await deleteBill(item.id)
        uni.showToast({ title: '已删除', icon: 'success' })
        loadBills()
      }
    },
  })
}

// ============ 其他事件 ============

function onSettings() {
  uni.showModal({
    title: '设置',
    content: '是否退出登录？',
    success: (res) => {
      if (res.confirm) {
        uni.removeStorageSync('token')
        uni.removeStorageSync('user')
        uni.reLaunch({ url: '/pages/login/index' })
      }
    },
  })
}

// ============ 生命周期 ============

function loadUserInfoFromStorage() {
  try {
    const stored = uni.getStorageSync('user')
    if (stored) userInfo.value = JSON.parse(stored)
  } catch (e) {}
}

function refreshProfileData() {
  loadUserInfoFromStorage()
  loadTripPlans()
  loadBills()
}

function consumeProfileRefreshFlag() {
  const needsRefresh = uni.getStorageSync('profileNeedsRefresh')
  if (needsRefresh) {
    uni.removeStorageSync('profileNeedsRefresh')
    refreshProfileData()
    return true
  }
  return false
}

onMounted(() => {
  const sysInfo = uni.getSystemInfoSync()
  statusBarHeight.value = sysInfo.statusBarHeight || 44
  contentHeight.value = Math.max(320, sysInfo.windowHeight - statusBarHeight.value - 350)

  refreshProfileData()
  uni.$on('profile-data-updated', refreshProfileData)
})

onUnmounted(() => {
  uni.$off('profile-data-updated', refreshProfileData)
})

onShow(() => {
  if (!consumeProfileRefreshFlag()) {
    refreshProfileData()
  }
})
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: #f5f8fb;
  overflow-x: hidden;
}

/* ===== 用户信息区 ===== */
.user-section {
  background: linear-gradient(135deg, #42a5f5 0%, #1976d2 100%);
  padding: 40rpx 32rpx 36rpx;
  border-radius: 0 0 32rpx 32rpx;
}

.user-header { display: flex; align-items: center; margin-bottom: 32rpx; }

.avatar-wrap {
  width: 100rpx; height: 100rpx; border-radius: 50%; overflow: hidden;
  border: 4rpx solid rgba(255,255,255,0.4); flex-shrink: 0;
}

.avatar { width: 100%; height: 100%; }

.user-info { flex: 1; margin-left: 24rpx; display: flex; flex-direction: column; }

.username { font-size: 34rpx; font-weight: 700; color: #fff; margin-bottom: 6rpx; }
.user-id { font-size: 24rpx; color: rgba(255,255,255,0.7); }

.settings-btn {
  width: 64rpx; height: 64rpx; border-radius: 50%;
  background: rgba(255,255,255,0.15); display: flex; align-items: center; justify-content: center;
}

.stats-row {
  display: flex; align-items: center;
  background: rgba(255,255,255,0.12); border-radius: 16rpx; padding: 24rpx 0;
}

.stat-item { flex: 1; display: flex; flex-direction: column; align-items: center; }
.stat-value { font-size: 36rpx; font-weight: 700; color: #fff; }
.stat-label { font-size: 22rpx; color: rgba(255,255,255,0.75); margin-top: 4rpx; }
.stat-divider { width: 1rpx; height: 48rpx; background: rgba(255,255,255,0.2); }

/* ===== 内容区 ===== */
.memo-section {
  background: #fff; margin: -16rpx 0 0; border-radius: 24rpx 24rpx 0 0;
  padding-top: 24rpx; position: relative; z-index: 1;
}

.tab-bar { display: flex; padding: 0 60rpx; border-bottom: 1rpx solid #f0f0f0; }

.tab-item { flex: 1; text-align: center; padding: 16rpx 0; position: relative; }
.tab-item text { font-size: 28rpx; color: #999; }
.tab-item.active text { color: #1976d2; font-weight: 700; }
.tab-item.active::after {
  content: ''; position: absolute; bottom: 0; left: 50%; transform: translateX(-50%);
  width: 48rpx; height: 4rpx; background: #1976d2; border-radius: 2rpx;
}

.action-row { display: flex; align-items: center; padding: 16rpx 24rpx; gap: 12rpx; }
.tag-scroll { flex: 1; white-space: nowrap; }
.tag-list { display: flex; gap: 14rpx; }

.capsule-tag {
  display: inline-flex; align-items: center; justify-content: center;
  padding: 0 28rpx; height: 52rpx; border-radius: 26rpx; background: #f0f4f8; flex-shrink: 0;
}
.capsule-tag text { font-size: 24rpx; color: #666; }
.capsule-tag.active { background: #e3f2fd; }
.capsule-tag.active text { color: #1976d2; font-weight: 600; }

.sort-btn {
  width: 52rpx; height: 52rpx; border-radius: 50%; background: #f0f4f8;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}

.content-scroll { padding: 0; }

.empty-state {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 80rpx 0;
}
.empty-text { margin-top: 16rpx; font-size: 26rpx; color: #bbb; }

/* ===== 行程卡片 ===== */
.section-card {
  background: #fff; margin: 0 24rpx 20rpx; border-radius: 16rpx; padding: 24rpx;
  box-shadow: 0 2rpx 16rpx rgba(0,0,0,0.05); border: 1rpx solid #f0f0f0;
}

.section-header { display: flex; align-items: center; gap: 12rpx; margin-bottom: 20rpx; }
.section-indicator { width: 6rpx; height: 28rpx; border-radius: 3rpx; background: linear-gradient(180deg,#42a5f5,#1976d2); }
.section-indicator.green { background: linear-gradient(180deg,#66bb6a,#388e3c); }
.section-title { font-size: 30rpx; font-weight: 700; color: #1a1a1a; }
.section-subtitle { font-size: 22rpx; color: #999; margin-left: auto; }

.plan-list { margin-bottom: 16rpx; }

.plan-item {
  display: flex; align-items: flex-start; gap: 16rpx; padding: 14rpx 0;
  border-bottom: 1rpx solid #f5f5f5;
}
.plan-item:last-child { border-bottom: none; }

.plan-dot { width: 14rpx; height: 14rpx; border-radius: 50%; background: #42a5f5; margin-top: 8rpx; flex-shrink: 0; }
.plan-dot.green { background: #66bb6a; }

.plan-content { flex: 1; display: flex; flex-direction: column; gap: 4rpx; }
.plan-name { font-size: 28rpx; color: #333; font-weight: 500; }
.plan-meta { font-size: 24rpx; color: #999; }

.plan-status-tag {
  padding: 4rpx 16rpx; border-radius: 20rpx; flex-shrink: 0; margin-top: 4rpx;
}
.plan-status-tag text { font-size: 20rpx; }
.plan-status-tag.pending { background: #fff3e0; }
.plan-status-tag.pending text { color: #f57c00; }
.plan-status-tag.completed { background: #e8f5e9; }
.plan-status-tag.completed text { color: #388e3c; }

.add-day-btn {
  display: flex; align-items: center; justify-content: center; gap: 8rpx;
  margin: 16rpx 24rpx 0; padding: 20rpx; background: #e3f2fd;
  border-radius: 16rpx; border: 1rpx dashed #1976d2;
}
.add-day-text { font-size: 28rpx; color: #1976d2; font-weight: 600; }
.bottom-spacer { height: 32rpx; }

/* ===== 账单样式 ===== */
.bill-summary {
  display: flex; align-items: center; margin: 0 24rpx 12rpx;
  background: linear-gradient(135deg,#e3f2fd,#bbdefb); border-radius: 16rpx; padding: 24rpx 0;
}
.bill-summary-item { flex: 1; display: flex; flex-direction: column; align-items: center; }
.bill-summary-label { font-size: 22rpx; color: #666; margin-bottom: 8rpx; }
.bill-summary-value { font-size: 34rpx; font-weight: 700; color: #1976d2; }
.bill-summary-divider { width: 1rpx; height: 48rpx; background: rgba(25,118,210,0.15); }

.bill-group { margin: 0 24rpx 20rpx; }
.bill-date-header { display: flex; justify-content: space-between; align-items: center; padding: 8rpx 0 12rpx; }
.bill-date { font-size: 26rpx; font-weight: 600; color: #333; }
.bill-date-total { font-size: 26rpx; font-weight: 600; color: #ff5722; }

.bill-card {
  background: #fff; border-radius: 16rpx; box-shadow: 0 2rpx 16rpx rgba(0,0,0,0.05);
  border: 1rpx solid #f0f0f0; overflow: hidden;
}

.bill-item {
  display: flex; align-items: center; padding: 20rpx 24rpx; border-bottom: 1rpx solid #f5f5f5;
}
.bill-item:last-child { border-bottom: none; }

.bill-icon {
  width: 64rpx; height: 64rpx; border-radius: 14rpx;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.bill-info { flex: 1; margin-left: 16rpx; display: flex; flex-direction: column; gap: 4rpx; }
.bill-name { font-size: 28rpx; color: #333; font-weight: 500; }
.bill-category { font-size: 22rpx; color: #999; }
.bill-amount { font-size: 30rpx; font-weight: 600; color: #ff5722; flex-shrink: 0; }

/* ===== 弹窗表单 ===== */
.popup-box {
  width: 600rpx; background: #fff; border-radius: 24rpx; overflow: hidden;
}
.popup-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 28rpx 32rpx; border-bottom: 1rpx solid #f0f0f0;
}
.popup-title { font-size: 32rpx; font-weight: 700; color: #333; }
.popup-body { padding: 28rpx 32rpx; }

.form-input {
  width: 100%; height: 80rpx; padding: 0 24rpx; border: 1rpx solid #e0e0e0;
  border-radius: 12rpx; font-size: 28rpx; color: #333; background: #f9f9f9;
  margin-bottom: 20rpx; box-sizing: border-box;
}

.status-picker { display: flex; align-items: center; gap: 12rpx; margin-top: 8rpx; }
.picker-label { font-size: 26rpx; color: #666; flex-shrink: 0; }

.popup-footer {
  display: flex; border-top: 1rpx solid #f0f0f0;
}
.popup-btn {
  flex: 1; text-align: center; padding: 24rpx 0;
}
.popup-btn text { font-size: 30rpx; }
.popup-btn.cancel { background: #f5f5f5; }
.popup-btn.cancel text { color: #999; }
.popup-btn.confirm { background: #1976d2; }
.popup-btn.confirm text { color: #fff; font-weight: 600; }

</style>
