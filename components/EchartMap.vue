<template>
  <view class="chart-container">
    <view class="chart-title">{{ title }}</view>
    <l-echart ref="chartRef" :custom-style="chartStyle" @finished="onChartReady" />
  </view>
</template>

<script setup>
import { ref, watch, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts'
import chinaGeoJson from '@/static/china.json'

const props = defineProps({
  title: {
    type: String,
    default: '假期出行数据地图分布'
  },
  option: {
    type: Object,
    default: () => ({})
  }
})

const chartRef = ref(null)
let chartInstance = null
const chartStyle = { width: '100%', height: '100%', flex: '1' }

function onChartReady() {
  echarts.registerMap('china', chinaGeoJson)
  chartRef.value.init(echarts, (chart) => {
    chartInstance = chart
    if (props.option && Object.keys(props.option).length > 0) {
      chart.setOption(props.option)
    }
  })
}

watch(
  () => props.option,
  (newOption) => {
    if (chartInstance && newOption) {
      chartInstance.setOption(newOption)
    }
  },
  { deep: true }
)

onBeforeUnmount(() => {
  if (chartInstance) {
    chartInstance.dispose()
    chartInstance = null
  }
})
</script>

<style scoped>
.chart-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: transparent;
  overflow: hidden;
}

.chart-title {
  text-align: center;
  color: #1976d2;
  font-size: 28rpx;
  padding: 12rpx 0;
  font-weight: bold;
  flex-shrink: 0;
}
</style>
