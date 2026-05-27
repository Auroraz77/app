<template>
  <view class="dashboard">
    <!-- 标题 -->
    <view class="title" :style="{ paddingTop: statusBarHeight + 'px' }">热门旅游景点数据大屏</view>

    <!-- 瀑布流滚动区域 -->
    <scroll-view scroll-y class="scroll-content" :style="{ height: scrollHeight + 'px' }">
      <!-- 模块一：简介卡片 + 地图区 -->
      <view class="module">
        <!-- 景点信息卡片（地图上方） -->
        <view class="section section-card">
          <AttractionCard :attraction="currentAttraction" />
        </view>
        <view class="section section-map">
          <EchartMap title="假期出行数据地图分布" :option="mapOption" />
        </view>
      </view>

      <!-- 模块二：销量排行（Tab 切换） -->
      <view class="module">
        <view class="tab-bar">
          <view
            class="tab-item"
            :class="{ active: salesTab === 'history' }"
            @tap="salesTab = 'history'"
          >热门景点</view>
          <view
            class="tab-item"
            :class="{ active: salesTab === 'live' }"
            @tap="salesTab = 'live'"
          >今日TOP6</view>
        </view>
        <view class="section section-chart">
          <EchartBar
            v-if="salesTab === 'history'"
            title="热门景点销量数据"
            :option="historySalesOption"
          />
          <EchartBar
            v-else
            title="今日销量 TOP6 景点"
            :option="liveRankingOption"
          />
        </view>
      </view>

      <!-- 模块三：分布占比 -->
      <view class="module">
        <!-- 4A/5A 玫瑰图 -->
        <view class="section section-chart">
          <EchartPie title="4A/5A 景点分布" :option="province4a5aOption" />
        </view>
        <!-- 价格区间分布 -->
        <view class="section section-chart">
          <EchartScatter title="价格区间分布" :option="priceOption" />
        </view>
      </view>

      <!-- 底部留白（避免 TabBar 遮挡） -->
      <view class="bottom-spacer"></view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad, onUnload } from '@dcloudio/uni-app'
import {
  getLiveRanking,
  getTopHistorySales,
  getSalesByProvince,
  getProvince4a5aCount,
  getPriceDistribution,
  getRandomAttraction
} from '@/utils/api.js'
import EchartBar from '@/components/EchartBar.vue'
import EchartPie from '@/components/EchartPie.vue'
import EchartMap from '@/components/EchartMap.vue'
import EchartScatter from '@/components/EchartScatter.vue'
import AttractionCard from '@/components/AttractionCard.vue'

// ============ 状态 ============

const salesTab = ref('history') // 'history' | 'live'

const currentAttraction = ref({ name: '', city: '', description: '' })
const historySalesOption = ref({})
const province4a5aOption = ref({})
const mapOption = ref({})
const liveRankingOption = ref({})
const priceOption = ref({})

const timers = []
const scrollHeight = ref(600)
const statusBarHeight = ref(0)

// ============ 生命周期 ============

onLoad(() => {
  // 计算滚动区域高度：屏幕高度 - 标题高度 - tabBar 高度
  const sysInfo = uni.getSystemInfoSync()
  statusBarHeight.value = sysInfo.statusBarHeight || 20
  const titleContentHeight = 44 // 标题文字区域约 44px
  const tabBarHeight = 50 // tabBar 约 50px
  scrollHeight.value = sysInfo.windowHeight - statusBarHeight.value - titleContentHeight - tabBarHeight

  fetchHistorySales()
  fetchProvince4a5a()
  fetchMapData()
  fetchLiveRanking()
  fetchPriceDistribution()
  fetchRandomAttraction()

  timers.push(setInterval(fetchMapData, 5000))
  timers.push(setInterval(fetchLiveRanking, 500))
  timers.push(setInterval(fetchPriceDistribution, 10000))
  timers.push(setInterval(fetchRandomAttraction, 3000))
})

onUnload(() => {
  timers.forEach((t) => clearInterval(t))
  timers.length = 0
})

// ============ 数据获取 ============

async function fetchHistorySales() {
  try {
    const result = await getTopHistorySales()
    if (result.success && result.data.length > 0) {
      const names = []
      const values = []
      result.data.reverse().slice(0, 6).forEach(function (item) {
        names.push(item['名称'])
        values.push(item['销量'])
      })
      historySalesOption.value = {
        tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
        grid: { left: '3%', right: '18%', bottom: 20, top: 20, containLabel: true },
        xAxis: {
          type: 'value',
          axisLine: { show: false }, axisTick: { show: false },
          axisLabel: { show: false }, splitLine: { show: false }
        },
        yAxis: {
          type: 'category', data: names,
          axisLine: { show: false }, axisTick: { show: false },
          axisLabel: { color: '#666666', fontSize: 11 }
        },
        series: [{
          name: '销量', type: 'bar', barWidth: 12, data: values,
          itemStyle: {
            borderRadius: [0, 6, 6, 0],
            color: {
              type: 'linear', x: 0, y: 0, x2: 1, y2: 0,
              colorStops: [
                { offset: 0, color: '#0039CB' },
                { offset: 0.7, color: '#9B59B6' },
                { offset: 1, color: '#E74C3C' }
              ]
            }
          },
          label: { show: true, position: 'right', color: '#1976d2', fontSize: 11, fontWeight: 'bold', formatter: '{c}' }
        }]
      }
    }
  } catch (err) {
    console.error('获取历史销量数据失败:', err)
  }
}

async function fetchProvince4a5a() {
  try {
    const result = await getProvince4a5aCount()
    if (result.success && result.data.length > 0) {
      const sortedData = result.data.sort(function (a, b) { return b.value - a.value })
      province4a5aOption.value = {
        tooltip: { trigger: 'item', formatter: '{b}: {c}个' },
        legend: {
          type: 'scroll', orient: 'vertical', right: 10, top: 'center',
          itemWidth: 10, itemHeight: 10, itemGap: 10,
          textStyle: { color: '#666666', fontSize: 10 },
          pageTextStyle: { color: '#666666' },
          pageIconColor: '#aaa', pageIconInactiveColor: '#ddd'
        },
        series: [{
          name: '4A-5A景区数量', type: 'pie',
          radius: ['18%', '88%'], center: ['40%', '50%'],
          roseType: 'area', itemStyle: { borderRadius: 4 },
          label: { show: true, color: '#fff', fontSize: 9, position: 'inside', formatter: '{b}' },
          labelLine: { show: false },
          data: sortedData
        }]
      }
    }
  } catch (err) {
    console.error('获取4A/5A景区数据失败:', err)
  }
}

async function fetchMapData() {
  try {
    const result = await getSalesByProvince()
    if (result.success && result.data.length > 0) {
      const maxVal = Math.max(...result.data.map(function (d) { return d.value || 0 }))
      mapOption.value = {
        tooltip: { trigger: 'item', formatter: function (p) { return p.name + ': ' + (p.value || 0) } },
        visualMap: {
          min: 0, max: maxVal, left: 'left', bottom: 20,
          text: ['高', '低'], textStyle: { color: '#666666', fontSize: 11 },
          inRange: { color: ['#e0ffff', '#006edd'] }, show: true
        },
        series: [{
          type: 'map', map: 'china',
          label: { show: true, color: '#333333', fontSize: 8 },
          itemStyle: { areaColor: '#e3f2fd', borderColor: '#b0bec5' },
          emphasis: { label: { color: '#1a1a1a' }, itemStyle: { areaColor: '#90caf9' } },
          data: result.data
        }]
      }
    }
  } catch (err) {
    console.error('获取地图数据失败:', err)
  }
}

async function fetchLiveRanking() {
  try {
    const result = await getLiveRanking()
    if (result.success) {
      const names = []
      const values = []
      result.data.reverse().slice(0, 6).forEach(function (item) {
        names.push(item['名称'])
        values.push(item.today_sales)
      })
      liveRankingOption.value = {
        color: ['#3398DB'],
        tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
        grid: { left: '3%', right: '8%', bottom: 20, top: 20, containLabel: true },
        xAxis: {
          type: 'value',
          axisLabel: { show: true, color: '#666666', fontSize: 11, formatter: function (v) { return v >= 1000 ? v / 1000 + 'k' : v } },
          axisLine: { show: true, lineStyle: { color: '#cccccc' } },
          splitLine: { lineStyle: { color: '#f0f0f0' } }
        },
        yAxis: {
          type: 'category', data: names,
          axisLabel: { color: '#666666', fontSize: 11 },
          axisLine: { show: false }, axisTick: { show: false }
        },
        series: [{
          data: values, type: 'bar', barWidth: '50%',
          label: { show: true, position: 'right', color: '#1976d2', fontSize: 11, fontWeight: 'bold' },
          itemStyle: {
            color: {
              type: 'linear', x: 0, y: 0, x2: 1, y2: 0,
              colorStops: [
                { offset: 0, color: '#42a5f5' },
                { offset: 1, color: '#1976d2' }
              ]
            },
            borderRadius: [0, 5, 5, 0]
          }
        }]
      }
    }
  } catch (err) {
    console.error('获取排名数据失败:', err)
  }
}

async function fetchPriceDistribution() {
  try {
    const result = await getPriceDistribution()
    if (result.success) {
      const data = result.data.map(function (item) { return [item.xAxis, item.yAxis] })
      priceOption.value = {
        color: ['#42a5f5'],
        tooltip: { trigger: 'axis', axisPointer: { type: 'shadow', label: { show: true } } },
        grid: { left: '3%', right: '4%', bottom: '3%', top: 30, containLabel: true },
        xAxis: {
          type: 'value',
          axisLabel: { color: '#666666', fontSize: 11 },
          axisLine: { show: true, lineStyle: { color: '#cccccc' } },
          splitLine: { lineStyle: { color: '#f0f0f0' } }
        },
        yAxis: {
          type: 'value',
          axisLabel: { color: '#666666', fontSize: 11 },
          axisLine: { show: true, lineStyle: { color: '#cccccc' } },
          splitLine: { lineStyle: { color: '#f0f0f0' } }
        },
        series: [{
          type: 'scatter',
          symbolSize: function (val) {
            // 用平方根缩放，保证面积与数值成正比，上限 28
            var size = Math.sqrt(val[1]) * 1.5
            return size < 4 ? 4 : Math.min(size, 28)
          },
          data: data,
          itemStyle: {
            color: {
              type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: '#1976d2' },
                { offset: 1, color: '#42a5f5' }
              ]
            },
            shadowBlur: 10, shadowColor: 'rgba(25, 118, 210, 0.3)', shadowOffsetY: 5
          }
        }]
      }
    }
  } catch (err) {
    console.error('获取价格分布数据失败:', err)
  }
}

async function fetchRandomAttraction() {
  try {
    const result = await getRandomAttraction()
    if (result.success) {
      currentAttraction.value = result.data
    }
  } catch (err) {
    console.error('获取景点简介失败:', err)
  }
}
</script>

<style scoped>
.dashboard {
  min-height: 100vh;
  background: linear-gradient(180deg, #e0f2ff 0%, #f5f8fb 30%, #f5f8fb 100%);
}

.title {
  text-align: center;
  color: #1a1a1a;
  font-size: 36rpx;
  font-weight: bold;
  padding: 20rpx 0;
}

.scroll-content {
  padding: 0 20rpx;
  box-sizing: border-box;
}

.module {
  margin-bottom: 24rpx;
  background: #ffffff;
  border-radius: 16rpx;
  padding: 16rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);
}

.section {
  width: 100%;
}

.section-map {
  height: 500rpx;
}

.section-card {
  min-height: 200rpx;
  margin-bottom: 16rpx;
}

.section-chart {
  height: 500rpx;
}

/* Tab 栏 */
.tab-bar {
  display: flex;
  background: #f0f4f8;
  border-radius: 12rpx;
  padding: 6rpx;
  margin-bottom: 16rpx;
}

.tab-item {
  flex: 1;
  text-align: center;
  color: #999999;
  font-size: 26rpx;
  padding: 14rpx 0;
  border-radius: 10rpx;
  transition: all 0.3s;
}

.tab-item.active {
  background: #ffffff;
  color: #1976d2;
  font-weight: bold;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.08);
}

.bottom-spacer {
  height: 120rpx;
}
</style>
