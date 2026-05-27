<template>
  <view class="login-container">
    <view class="logo-area">
      <image class="logo" src="/static/logo.png" mode="aspectFit" />
      <text class="title">旅游景点助手</text>
      <text class="subtitle">登录您的账号</text>
    </view>

    <view class="form-area">
      <view class="input-group">
        <uni-icons type="person" size="20" color="#1976d2" />
        <input
          class="input"
          v-model="username"
          placeholder="请输入用户名"
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
          placeholder="请输入密码"
          placeholder-class="placeholder"
          maxlength="20"
        />
      </view>

      <button class="btn-login" @click="handleLogin" :loading="loading">登 录</button>

      <view class="register-link" @click="goRegister">
        <text>还没有账号？</text>
        <text class="link">立即注册</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { login } from '@/utils/api.js'

const username = ref('')
const password = ref('')
const loading = ref(false)

async function handleLogin() {
  if (!username.value.trim()) {
    uni.showToast({ title: '请输入用户名', icon: 'none' })
    return
  }
  if (!password.value) {
    uni.showToast({ title: '请输入密码', icon: 'none' })
    return
  }

  loading.value = true
  try {
    const res = await login(username.value, password.value)
    if (res.success) {
      uni.setStorageSync('token', res.token)
      uni.setStorageSync('user', JSON.stringify(res.user))
      uni.showToast({ title: '登录成功', icon: 'success' })
      setTimeout(() => {
        uni.switchTab({ url: '/pages/dashboard/index' })
      }, 500)
    } else {
      uni.showToast({ title: res.message || '登录失败', icon: 'none' })
    }
  } catch (e) {
    uni.showToast({ title: '网络错误，请重试', icon: 'none' })
  } finally {
    loading.value = false
  }
}

function goRegister() {
  uni.navigateTo({ url: '/pages/register/index' })
}
</script>

<style lang="scss">
.login-container {
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

.btn-login {
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

.btn-login::after {
  border: none;
}

.register-link {
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
