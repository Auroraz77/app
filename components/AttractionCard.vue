<template>
  <view class="attraction-card">
    <view class="card-header">
      <view class="city-badge">{{ attraction.city || '--' }}</view>
      <view class="attraction-name">{{ attraction.name || '加载中...' }}</view>
    </view>
    <view class="card-body">
      <view class="description-label">
        <text class="icon">&#10022;</text>
        <text>特色描述</text>
      </view>
      <view class="description-text">{{ attraction.description || '暂无简介' }}</view>
    </view>
    <view class="card-decoration">
      <text class="gondola-icon">&#9972;</text>
    </view>
  </view>
</template>

<script setup>
/**
 * 景点信息卡片组件
 *
 * 使用方法：
 *   <AttractionCard :attraction="currentAttraction" />
 *
 * Props:
 *   attraction - 景点对象 { name, city, description }
 *
 * TODO: 填入业务逻辑
 *   1. 在 dashboard/index.vue 中调用 getRandomAttraction() 获取数据
 *   2. 用 setInterval 每 3 秒轮播切换
 *   3. 在 onUnmounted 中清除定时器
 */

defineProps({
  attraction: {
    type: Object,
    default: () => ({
      name: '',
      city: '',
      description: ''
    })
  }
})
</script>

<style scoped>
.attraction-card {
  width: 100%;
  box-sizing: border-box;
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 50%, #e1f5fe 100%);
  border-radius: 16rpx;
  padding: 20rpx 24rpx;
  box-shadow: 0 4rpx 16rpx rgba(25, 118, 210, 0.1);
  position: relative;
  overflow: hidden;
  border: 1rpx solid rgba(25, 118, 210, 0.15);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 16rpx;
}

.city-badge {
  background: linear-gradient(135deg, #1976d2 0%, #42a5f5 100%);
  color: #ffffff;
  padding: 6rpx 20rpx;
  border-radius: 24rpx;
  font-size: 22rpx;
  font-weight: bold;
  white-space: nowrap;
}

.attraction-name {
  color: #1a1a1a;
  font-size: 32rpx;
  font-weight: bold;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
}

.card-body {
  position: relative;
  z-index: 2;
}

.description-label {
  display: flex;
  align-items: center;
  gap: 8rpx;
  color: #1976d2;
  font-size: 22rpx;
  margin-bottom: 12rpx;
}

.description-label .icon {
  font-size: 24rpx;
}

.description-text {
  color: #333333;
  font-size: 24rpx;
  line-height: 1.6;
  background: rgba(255, 255, 255, 0.7);
  padding: 12rpx 16rpx;
  border-radius: 8rpx;
  border-left: 4rpx solid #1976d2;
}

.card-decoration {
  position: absolute;
  bottom: 12rpx;
  right: 20rpx;
  opacity: 0.15;
  font-size: 60rpx;
  z-index: 3;
}

.gondola-icon {
  color: #1976d2;
}
</style>
