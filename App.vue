<script setup>
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app'

onLaunch(() => {
  console.log('App Launch')
  // 检查登录状态
  const token = uni.getStorageSync('token')
  if (!token) {
    // 无 token，跳转登录页
    uni.reLaunch({ url: '/pages/login/index' })
    return
  }
  // 有 token 就信任它，不在此重复校验（401 由 request 统一处理）
  console.log('Token 已存在，跳过验证')
})

onShow(() => {
  console.log('App Show')
})

onHide(() => {
  console.log('App Hide')
})
</script>

<style lang="scss">
/*每个页面公共css */
@import '@/uni_modules/uni-scss/index.scss';
/* #ifndef APP-NVUE */
page {
  background-color: #f5f8fb;
  color: #333333;
  font-family: 'Microsoft YaHei', sans-serif;
}
/* #endif */
</style>
