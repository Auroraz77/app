<template>
  <view class="page">
    <!-- 顶部搜索区 -->
    <view class="header">
      <!-- 搜索栏 -->
      <view class="search-bar">
        <view class="city-picker" @click="showCityPicker = true">
          <text class="city-text">{{ selectedCity }}</text>
          <uni-icons type="bottom" size="14" color="#ffffff" />
        </view>
        <view class="search-input-wrap">
          <uni-icons type="search" size="18" color="#999" />
          <input
            class="search-input"
            v-model="keyword"
            placeholder="搜索你感兴趣的关键词"
            placeholder-class="search-placeholder"
            confirm-type="search"
            @confirm="doSearch"
          />
        </view>
        <view class="search-btn" @click="doSearch">
          <text>搜索</text>
        </view>
      </view>

      <!-- 标签筛选 -->
      <scroll-view class="tag-scroll" scroll-x :show-scrollbar="false">
        <view class="tag-list">
          <view
            v-for="tag in tags"
            :key="tag.value"
            class="tag-item"
            :class="{ active: selectedStar === tag.value }"
            @click="selectTag(tag.value)"
          >
            <text>{{ tag.label }}</text>
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- 列表区 -->
    <scroll-view
      class="list-area"
      scroll-y
      :style="{ height: listHeight + 'px' }"
      @scrolltolower="loadMore"
    >
      <!-- 加载状态 -->
      <view v-if="loading && list.length === 0" class="loading-wrap">
        <uni-icons type="spinner-cycle" size="30" color="#0091EA" />
        <text class="loading-text">加载中...</text>
      </view>

      <!-- 空状态 -->
      <view v-if="!loading && list.length === 0" class="empty-wrap">
        <uni-icons type="search" size="50" color="#ccc" />
        <text class="empty-text">暂无搜索结果</text>
      </view>

      <!-- 门票卡片列表 -->
      <view class="card-list">
        <view class="card" v-for="item in list" :key="item.name">
          <view class="card-left">
            <view class="card-title-row">
              <text class="card-name">{{ item.name }}</text>
              <view v-if="item.star && item.star !== '未知'" class="star-badge">
                <text>{{ item.star }}</text>
              </view>
            </view>
            <view class="card-location">
              <uni-icons type="location" size="14" color="#999" />
              <text class="location-text">{{ item.city }}</text>
            </view>
            <view v-if="item.description" class="card-desc">
              <text>{{ item.description }}</text>
            </view>
          </view>
          <view class="card-right">
            <view class="price-area">
              <text class="price-symbol">¥</text>
              <text class="price-value">{{ formatPrice(item.price) }}</text>
              <text class="price-unit">起</text>
            </view>
            <view class="sales-text">已售 {{ item.sales }}</view>
          </view>
        </view>
      </view>

      <!-- 底部加载更多 -->
      <view v-if="list.length > 0" class="load-more">
        <text v-if="loading">加载中...</text>
        <text v-else-if="currentPage >= totalPages">— 已经到底了 —</text>
        <text v-else @click="loadMore">上拉加载更多</text>
      </view>
    </scroll-view>

    <!-- 城市选择弹窗 -->
    <uni-popup ref="cityPopup" type="bottom" :is-mask-click="true" @change="onPopupChange">
      <view class="city-popup">
        <view class="popup-header">
          <text class="popup-title">选择城市</text>
          <view @click="showCityPicker = false">
            <uni-icons type="closeempty" size="20" color="#999" />
          </view>
        </view>
        <scroll-view class="city-list" scroll-y>
          <view
            class="city-item"
            :class="{ active: selectedCity === '全部' }"
            @click="pickCity('全部')"
          >
            <text>全部城市</text>
          </view>
          <view
            v-for="c in cityList"
            :key="c"
            class="city-item"
            :class="{ active: selectedCity === c }"
            @click="pickCity(c)"
          >
            <text>{{ c }}</text>
          </view>
        </scroll-view>
      </view>
    </uni-popup>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getAttractions, getCities } from '@/utils/api.js'

const keyword = ref('')
const selectedCity = ref('全部')
const selectedStar = ref('')
const list = ref([])
const loading = ref(false)
const currentPage = ref(1)
const totalPages = ref(1)
const cityList = ref([])
const showCityPicker = ref(false)
const cityPopup = ref(null)
const listHeight = ref(600)

const tags = [
  { label: '全部', value: '' },
  { label: '5A 景区', value: '5A' },
  { label: '4A 景区', value: '4A' },
  { label: '3A 景区', value: '3A' },
]

onMounted(() => {
  // 计算列表高度：屏幕高度 - 顶部搜索区高度
  const sysInfo = uni.getSystemInfoSync()
  listHeight.value = sysInfo.windowHeight - 180
  loadCities()
  loadData(true)
})

async function loadCities() {
  try {
    const res = await getCities()
    if (res.success) {
      cityList.value = res.data
    }
  } catch (e) {
    console.error('加载城市列表失败', e)
  }
}

async function loadData(reset = false) {
  if (loading.value) return
  if (reset) {
    currentPage.value = 1
    list.value = []
  }
  loading.value = true
  try {
    const cityParam = selectedCity.value === '全部' ? '' : selectedCity.value
    const res = await getAttractions({
      keyword: keyword.value,
      city: cityParam,
      star: selectedStar.value,
      page: currentPage.value,
      pageSize: 15,
    })
    if (res.success) {
      if (reset) {
        list.value = res.data
      } else {
        list.value = [...list.value, ...res.data]
      }
      totalPages.value = res.pagination.total_pages
    }
  } catch (e) {
    console.error('加载数据失败', e)
  } finally {
    loading.value = false
  }
}

function doSearch() {
  loadData(true)
}

function selectTag(value) {
  selectedStar.value = value
  loadData(true)
}

function pickCity(city) {
  selectedCity.value = city
  showCityPicker.value = false
  loadData(true)
}

function loadMore() {
  if (loading.value || currentPage.value >= totalPages.value) return
  currentPage.value++
  loadData(false)
}

function formatPrice(price) {
  if (!price || price === 0) return '免费'
  return Number(price).toFixed(0)
}

function onPopupChange(e) {
  if (!e.show) {
    showCityPicker.value = false
  }
}

// 监听 showCityPicker 控制弹窗
import { watch } from 'vue'
watch(showCityPicker, (val) => {
  if (val) {
    cityPopup.value?.open()
  } else {
    cityPopup.value?.close()
  }
})
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: linear-gradient(180deg, #e0f2ff 0%, #f5f8fb 30%, #f5f8fb 100%);
  overflow-x: hidden;
}

/* ===== 顶部搜索区 ===== */
.header {
  background: linear-gradient(135deg, #42a5f5 0%, #1976d2 100%);
  padding: 24rpx 24rpx 20rpx;
  border-radius: 0 0 32rpx 32rpx;
}

.search-bar {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.city-picker {
  display: flex;
  align-items: center;
  gap: 6rpx;
  flex-shrink: 0;
}

.city-text {
  color: #ffffff;
  font-size: 30rpx;
  font-weight: 500;
  max-width: 120rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.search-input-wrap {
  flex: 1;
  display: flex;
  align-items: center;
  background: #ffffff;
  border-radius: 40rpx;
  padding: 0 24rpx;
  height: 72rpx;
}

.search-input {
  flex: 1;
  margin-left: 12rpx;
  font-size: 26rpx;
  color: #333;
}

.search-placeholder {
  color: #bbbbbb;
  font-size: 26rpx;
}

.search-btn {
  background: rgba(255, 255, 255, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.6);
  border-radius: 40rpx;
  padding: 0 28rpx;
  height: 72rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.search-btn text {
  color: #ffffff;
  font-size: 28rpx;
  font-weight: 500;
}

/* ===== 标签筛选 ===== */
.tag-scroll {
  margin-top: 24rpx;
  white-space: nowrap;
}

.tag-list {
  display: flex;
  gap: 16rpx;
  padding-bottom: 4rpx;
}

.tag-item {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 32rpx;
  height: 56rpx;
  border-radius: 28rpx;
  background: rgba(255, 255, 255, 0.2);
  flex-shrink: 0;
}

.tag-item text {
  color: rgba(255, 255, 255, 0.8);
  font-size: 26rpx;
}

.tag-item.active {
  background: #ffffff;
}

.tag-item.active text {
  color: #1976d2;
  font-weight: 600;
}

/* ===== 列表区 ===== */
.list-area {
  padding: 0;
}

.card-list {
  padding: 20rpx 24rpx;
  box-sizing: border-box;
}

/* ===== 门票卡片 ===== */
.card {
  background: #ffffff;
  border-radius: 20rpx;
  padding: 28rpx;
  margin-bottom: 20rpx;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);
  box-sizing: border-box;
  overflow: hidden;
}

.card-left {
  flex: 1;
  min-width: 0;
  margin-right: 24rpx;
}

.card-title-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 12rpx;
}

.card-name {
  font-size: 30rpx;
  font-weight: 600;
  color: #1a1a1a;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.star-badge {
  background: linear-gradient(135deg, #ff9800, #f57c00);
  border-radius: 8rpx;
  padding: 2rpx 12rpx;
  flex-shrink: 0;
}

.star-badge text {
  color: #ffffff;
  font-size: 20rpx;
  font-weight: 600;
}

.card-location {
  display: flex;
  align-items: center;
  gap: 6rpx;
  margin-bottom: 8rpx;
}

.location-text {
  font-size: 24rpx;
  color: #999999;
}

.card-desc {
  margin-top: 8rpx;
}

.card-desc text {
  font-size: 24rpx;
  color: #888888;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.card-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  flex-shrink: 0;
  width: 140rpx;
}

.price-area {
  display: flex;
  align-items: baseline;
}

.price-symbol {
  font-size: 22rpx;
  color: #ff5722;
  font-weight: 600;
}

.price-value {
  font-size: 36rpx;
  color: #ff5722;
  font-weight: 700;
  margin: 0 2rpx;
}

.price-unit {
  font-size: 22rpx;
  color: #ff5722;
}

.sales-text {
  font-size: 22rpx;
  color: #bbbbbb;
  margin-top: 8rpx;
  white-space: nowrap;
}

/* ===== 加载状态 ===== */
.loading-wrap,
.empty-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 0;
}

.loading-text,
.empty-text {
  margin-top: 16rpx;
  font-size: 28rpx;
  color: #999999;
}

.load-more {
  text-align: center;
  padding: 30rpx 24rpx 50rpx;
}

.load-more text {
  font-size: 24rpx;
  color: #bbbbbb;
}

/* ===== 城市选择弹窗 ===== */
.city-popup {
  background: #ffffff;
  border-radius: 24rpx 24rpx 0 0;
  max-height: 60vh;
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx 32rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.popup-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333333;
}

.city-list {
  max-height: 50vh;
  padding: 16rpx 0;
}

.city-item {
  padding: 24rpx 32rpx;
}

.city-item text {
  font-size: 30rpx;
  color: #333333;
}

.city-item.active {
  background: #e3f2fd;
}

.city-item.active text {
  color: #1976d2;
  font-weight: 600;
}
</style>
