<template>
  <view class="register-container">
    <view class="logo-area">
      <image class="logo" src="/static/logo.png" mode="aspectFit" />
      <text class="title">旅游景点助手</text>
      <text class="subtitle">创建新账号</text>
    </view>

    <view class="form-area">
      <view class="input-group">
        <uni-icons type="person" size="20" color="#1976d2" />
        <input
          class="input"
          v-model="username"
          placeholder="请输入用户名（3-20个字符）"
          placeholder-class="placeholder"
          maxlength="20"
        />
      </view>

      <view class="input-group">
        <uni-icons type="locked" size="20" color="#1976d2" />
        <input
          class="input"
          v-model="password"
          type="password"
          placeholder="请输入密码（至少6个字符）"
          placeholder-class="placeholder"
          maxlength="20"
        />
      </view>

      <view class="input-group">
        <uni-icons type="locked" size="20" color="#1976d2" />
        <input
          class="input"
          v-model="confirmPassword"
          type="password"
          placeholder="请再次输入密码"
          placeholder-class="placeholder"
          maxlength="20"
        />
      </view>

      <button class="btn-register" @click="handleRegister" :loading="loading">注 册</button>

      <view class="login-link" @click="goLogin">
        <text>已有账号？</text>
        <text class="link">去登录</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { register } from '@/utils/api.js'

const username = ref('')
const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)

async function handleRegister() {
  if (!username.value.trim()) {
    uni.showToast({ title: '请输入用户名', icon: 'none' })
    return
  }
  if (username.value.trim().length < 3) {
    uni.showToast({ title: '用户名至少3个字符', icon: 'none' })
    return
  }
  if (!password.value) {
    uni.showToast({ title: '请输入密码', icon: 'none' })
    return
  }
  if (password.value.length < 6) {
    uni.showToast({ title: '密码至少6个字符', icon: 'none' })
    return
  }
  if (password.value !== confirmPassword.value) {
    uni.showToast({ title: '两次密码输入不一致', icon: 'none' })
    return
  }

  loading.value = true
  try {
    const res = await register(username.value, password.value)
    if (res.success) {
      uni.showToast({ title: '注册成功', icon: 'success' })
      setTimeout(() => {
        uni.navigateBack()
      }, 500)
    } else {
      uni.showToast({ title: res.message || '注册失败', icon: 'none' })
    }
  } catch (e) {
    uni.showToast({ title: '网络错误，请重试', icon: 'none' })
  } finally {
    loading.value = false
  }
}

function goLogin() {
  uni.navigateBack()
}
</script>

<style lang="scss">
.register-container {
  min-height: 100vh;
  background: linear-gradient(180deg, #e0f2ff 0%, #f5f8fb 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0 60rpx;
}

.logo-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 80rpx;
}

.logo {
  width: 160rpx;
  height: 160rpx;
  margin-bottom: 30rpx;
}

.title {
  font-size: 44rpx;
  color: #1a1a1a;
  font-weight: bold;
  margin-bottom: 10rpx;
}

.subtitle {
  font-size: 28rpx;
  color: #999999;
}

.form-area {
  width: 100%;
}

.input-group {
  display: flex;
  align-items: center;
  background: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 16rpx;
  padding: 0 30rpx;
  height: 100rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
}

.input {
  flex: 1;
  margin-left: 20rpx;
  font-size: 30rpx;
  color: #333333;
}

.placeholder {
  color: #bbbbbb;
}

.btn-register {
  width: 100%;
  height: 100rpx;
  line-height: 100rpx;
  background: linear-gradient(135deg, #1976d2, #42a5f5);
  color: #ffffff;
  font-size: 34rpx;
  font-weight: bold;
  border-radius: 16rpx;
  border: none;
  margin-top: 20rpx;
}

.btn-register::after {
  border: none;
}

.login-link {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 40rpx;
  font-size: 26rpx;
  color: #999999;
}

.link {
  color: #1976d2;
  margin-left: 10rpx;
}
</style>
