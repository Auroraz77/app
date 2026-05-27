<template>
  <view class="chat-page">
    <!-- 消息列表 -->
    <scroll-view
      class="chat-container"
      scroll-y
      :scroll-into-view="scrollTarget"
      scroll-with-animation
    >
      <view
        v-for="(msg, index) in messages"
        :key="index"
        :id="'msg-' + index"
        :class="['message', msg.isUser ? 'user-message' : 'assistant-message']"
      >
        <!-- 普通文本消息 -->
        <view v-if="!msg.data" class="content">
          <text>{{ msg.text }}</text>
          <!-- summary 类型附带的总结文本 -->
          <text v-if="msg.summary" class="summary-text">{{ msg.summary }}</text>
        </view>

        <!-- 数据列表消息 -->
        <view v-else class="content data-content">
          <text v-if="msg.text" class="data-intro">{{ msg.text }}</text>
          <view
            v-for="(item, i) in (msg.showAll ? msg.data : msg.data.slice(0, 5))"
            :key="i"
            class="attraction-card"
          >
            <view class="card-header">
              <text class="card-name">{{ item['名称'] || item.name || '未知景点' }}</text>
              <text class="card-price" v-if="item['价格'] !== undefined">¥{{ item['价格'] }}</text>
            </view>
            <view class="card-meta">
              <text v-if="item['省份'] || item['城市']">{{ item['省份'] || '' }} {{ item['城市'] || '' }}</text>
              <text v-if="item['星级']"> · {{ item['星级'] }}</text>
              <text v-if="item['评分']"> · {{ item['评分'] }}分</text>
            </view>
            <text v-if="item['销量']" class="card-sales">销量: {{ item['销量'] }}</text>
          </view>
          <!-- 展开/收起 -->
          <view
            v-if="msg.data.length > 5"
            class="show-more"
            @tap="msg.showAll = !msg.showAll"
          >
            <text>{{ msg.showAll ? '收起' : '查看更多 (' + msg.data.length + '条)' }}</text>
          </view>
        </view>
      </view>

      <!-- 加载中动画 -->
      <view v-if="loading" id="loading-msg" class="message assistant-message">
        <view class="content loading-content">
          <view class="dot-typing">
            <view class="dot"></view>
            <view class="dot"></view>
            <view class="dot"></view>
          </view>
        </view>
      </view>

      <!-- 滚动锚点 -->
      <view id="msg-bottom" :style="{ height: '1rpx' }"></view>
    </scroll-view>

    <!-- 输入区域 -->
    <view class="input-area">
      <view class="input-form">
        <input
          class="question-input"
          v-model="question"
          placeholder="请输入您的问题..."
          placeholder-class="input-placeholder"
          :disabled="loading"
          :adjust-position="true"
          :cursor-spacing="20"
          confirm-type="send"
          @confirm="sendMessage"
        />
        <view
          class="submit-btn"
          :class="{ disabled: loading || !question.trim() }"
          @tap="sendMessage"
        >
          发送
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, nextTick } from 'vue'
import { queryAttraction } from '@/utils/api.js'

/**
 * 消息结构：
 *   文本消息: { text: string, isUser: boolean }
 *   数据消息: { text: string, isUser: false, data: array, columns: array, type: string, summary: string, showAll: boolean }
 */
const messages = ref([
  {
    text: '您好！我是景点智能助手，可以帮您查询景点信息。请问有什么可以帮您？',
    isUser: false
  }
])

const question = ref('')
const loading = ref(false)
const scrollTarget = ref('')

function scrollToBottom() {
  nextTick(() => {
    scrollTarget.value = ''
    nextTick(() => {
      scrollTarget.value = 'msg-bottom'
    })
  })
}

async function sendMessage() {
  const q = question.value.trim()
  if (!q || loading.value) return

  messages.value.push({ text: q, isUser: true })
  question.value = ''
  loading.value = true
  scrollToBottom()

  try {
    const result = await queryAttraction(q, false)

    if (result.success) {
      // 类型1: 数据列表 (list / summary)
      if (result.type === 'list' || result.type === 'summary') {
        let intro = ''
        if (result.type === 'summary' && result.summary) {
          intro = result.summary
        }
        messages.value.push({
          text: intro,
          isUser: false,
          data: result.data || [],
          columns: result.columns || [],
          type: result.type,
          summary: result.type === 'summary' ? '' : '',
          showAll: false
        })
      }
      // 类型2: 知识 / 天气 / 错误
      else if (result.type === 'knowledge' || result.type === 'weather' || result.type === 'error') {
        messages.value.push({ text: result.text || '查询完成', isUser: false })
      }
      // 类型3: CSV 导出结果
      else if (result.csv) {
        let text = result.result || '导出成功'
        // #ifdef H5
        const blob = new Blob([result.csv], { type: 'text/csv;charset=utf-8' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = '景点数据.csv'
        a.click()
        URL.revokeObjectURL(url)
        text += '\n（CSV文件已下载）'
        // #endif
        // #ifdef APP-PLUS
        const filePath = `${uni.env.USER_DATA_PATH}/景点数据.csv`
        const fs = uni.getFileSystemManager()
        fs.writeFileSync(filePath, result.csv, 'utf-8')
        uni.saveFile({
          tempFilePath: filePath,
          success: () => { text += '\n（CSV文件已保存）' },
          fail: () => { text += '\n（CSV保存失败）' }
        })
        // #endif
        messages.value.push({ text, isUser: false })
      }
      // 兜底
      else {
        messages.value.push({ text: result.result || '查询完成', isUser: false })
      }
    } else {
      messages.value.push({ text: '查询失败：' + result.error, isUser: false })
    }
  } catch (err) {
    messages.value.push({ text: '网络错误，请检查后端服务是否启动', isUser: false })
  } finally {
    loading.value = false
    scrollToBottom()
  }
}
</script>

<style scoped>
.chat-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: linear-gradient(180deg, #e0f2ff 0%, #f5f8fb 100%);
}

/* 消息列表 */
.chat-container {
  flex: 1;
  background: linear-gradient(180deg, #e0f2ff 0%, #f5f8fb 100%);
}

.message {
  margin-bottom: 24rpx;
  padding: 0 20rpx;
}

.user-message {
  display: flex;
  justify-content: flex-end;
}

.user-message .content {
  background: linear-gradient(135deg, #1976d2 0%, #42a5f5 100%);
  color: #ffffff;
  padding: 20rpx 28rpx;
  border-radius: 28rpx 28rpx 8rpx 28rpx;
  max-width: 70%;
  word-wrap: break-word;
  font-size: 28rpx;
  text-align: left;
  margin-right: 16rpx;
}

.assistant-message {
  text-align: left;
}

.assistant-message .content {
  background: #ffffff;
  color: #333333;
  padding: 20rpx 28rpx;
  border-radius: 28rpx 28rpx 28rpx 8rpx;
  display: inline-block;
  max-width: 85%;
  word-wrap: break-word;
  white-space: pre-wrap;
  font-size: 28rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);
}

/* 数据列表内容 */
.data-content {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
  max-width: 90%;
}

.data-intro {
  font-size: 26rpx;
  color: #333333;
  line-height: 1.6;
  margin-bottom: 8rpx;
  white-space: pre-wrap;
}

.summary-text {
  display: block;
  margin-top: 8rpx;
  font-size: 26rpx;
  color: #666666;
  line-height: 1.6;
}

/* 景点小卡片 */
.attraction-card {
  background: #f5f8fb;
  border-radius: 16rpx;
  padding: 20rpx;
  border: 1rpx solid #e3f2fd;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8rpx;
}

.card-name {
  font-size: 28rpx;
  font-weight: bold;
  color: #1976d2;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-price {
  font-size: 28rpx;
  font-weight: bold;
  color: #ff5722;
  margin-left: 16rpx;
}

.card-meta {
  font-size: 22rpx;
  color: #999999;
  margin-bottom: 4rpx;
}

.card-sales {
  font-size: 22rpx;
  color: #bbbbbb;
}

/* 展开/收起 */
.show-more {
  text-align: center;
  padding: 12rpx 0;
}

.show-more text {
  font-size: 24rpx;
  color: #1976d2;
  text-decoration: underline;
}

/* 加载动画 - 三点跳动 */
.loading-content {
  padding: 16rpx 28rpx !important;
}

.dot-typing {
  display: flex;
  align-items: center;
  gap: 10rpx;
  height: 32rpx;
}

.dot {
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
  background: #1976d2;
  animation: dotBounce 1.4s infinite ease-in-out both;
}

.dot:nth-child(1) { animation-delay: 0s; }
.dot:nth-child(2) { animation-delay: 0.2s; }
.dot:nth-child(3) { animation-delay: 0.4s; }

@keyframes dotBounce {
  0%, 80%, 100% { transform: scale(0.4); opacity: 0.4; }
  40% { transform: scale(1); opacity: 1; }
}

/* 输入区域 */
.input-area {
  background: #ffffff;
  padding: 16rpx 20rpx;
  padding-bottom: calc(16rpx + env(safe-area-inset-bottom));
  border-top: 1rpx solid #e8e8e8;
  box-shadow: 0 -2rpx 12rpx rgba(0, 0, 0, 0.04);
}

.input-form {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.question-input {
  flex: 1;
  padding: 20rpx 28rpx;
  border: 1rpx solid #e0e0e0;
  border-radius: 40rpx;
  background: #f5f8fb;
  color: #333333;
  font-size: 28rpx;
}

.input-placeholder {
  color: #bbbbbb;
}

.submit-btn {
  padding: 20rpx 40rpx;
  background: linear-gradient(135deg, #1976d2 0%, #42a5f5 100%);
  border-radius: 40rpx;
  color: #ffffff;
  font-size: 28rpx;
  font-weight: bold;
  white-space: nowrap;
}

.submit-btn.disabled {
  opacity: 0.5;
}
</style>
