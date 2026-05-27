/**
 * API 请求封装
 *
 * 使用说明：
 * - H5 开发时：通过 vite proxy 转发到 localhost:8000，BASE_URL 留空即可
 * - App 端：需要将 BASE_URL 改为后端的公网地址
 * - 小程序端：需要配置合法域名，且必须是 HTTPS
 */

const BASE_URL = 'http://10.241.172.215:8000'

let isRedirecting = false

/**
 * 通用请求方法
 */
function request(options) {
  return new Promise((resolve, reject) => {
    const token = uni.getStorageSync('token')
    const header = {
      'Content-Type': 'application/json',
      ...options.header
    }
    if (token) {
      header['Authorization'] = `Bearer ${token}`
    }

    uni.request({
      url: BASE_URL + options.url,
      method: options.method || 'GET',
      data: options.data || {},
      header,
      success: (res) => {
        if (res.statusCode === 200) {
          resolve(res.data)
        } else if (res.statusCode === 401) {
          // token 无效，只清除 token，不主动跳转（由调用方决定）
          if (!isRedirecting) {
            isRedirecting = true
            uni.removeStorageSync('token')
            uni.removeStorageSync('user')
            uni.reLaunch({ url: '/pages/login/index' })
            setTimeout(() => { isRedirecting = false }, 2000)
          }
          reject({ code: 401, message: '认证已过期，请重新登录' })
        } else {
          reject({ code: res.statusCode, message: `请求失败: ${res.statusCode}` })
        }
      },
      fail: (err) => {
        reject({ code: -1, message: err.errMsg || '网络错误' })
      }
    })
  })
}

// ============ 用户认证接口 ============

/** 用户注册 */
export function register(username, password) {
  return request({
    url: '/api/register',
    method: 'POST',
    data: { username, password }
  })
}

/** 用户登录 */
export function login(username, password) {
  return request({
    url: '/api/login',
    method: 'POST',
    data: { username, password }
  })
}

/** 获取当前用户信息 */
export function getUserInfo() {
  return request({ url: '/api/user/info' })
}

// ============ 行程计划接口 ============

/** 获取行程计划列表 */
export function getTripPlans() {
  return request({ url: '/api/trip-plans' })
}

/** 新增行程计划 */
export function createTripPlan({ name, trip_date, time, note, status }) {
  return request({
    url: '/api/trip-plans',
    method: 'POST',
    data: { name, trip_date, time, note, status }
  })
}

/** 更新行程计划 */
export function updateTripPlan(id, data) {
  return request({
    url: `/api/trip-plans/${id}`,
    method: 'PUT',
    data
  })
}

/** 删除行程计划 */
export function deleteTripPlan(id) {
  return request({
    url: `/api/trip-plans/${id}`,
    method: 'DELETE'
  })
}

// ============ 账单接口 ============

/** 获取账单列表 */
export function getBills() {
  return request({ url: '/api/bills' })
}

/** 新增账单 */
export function createBill({ name, category, amount, bill_date, icon, color }) {
  return request({
    url: '/api/bills',
    method: 'POST',
    data: { name, category, amount, bill_date, icon, color }
  })
}

/** 删除账单 */
export function deleteBill(id) {
  return request({
    url: `/api/bills/${id}`,
    method: 'DELETE'
  })
}

// ============ 数据大屏接口 ============

/** 获取实时销量 TOP10 */
export function getLiveRanking() {
  return request({ url: '/api/live_ranking' })
}

/** 获取历史销量 TOP */
export function getTopHistorySales() {
  return request({ url: '/api/top_history_sales' })
}

/** 获取各省销量汇总（地图用） */
export function getSalesByProvince() {
  return request({ url: '/api/sales_by_province' })
}

/** 获取各省 4A/5A 景点数量 */
export function getProvince4a5aCount() {
  return request({ url: '/api/province_4a5a_count' })
}

/** 获取价格分布数据 */
export function getPriceDistribution() {
  return request({ url: '/api/price_distribution' })
}

/** 获取随机景点简介 */
export function getRandomAttraction() {
  return request({ url: '/api/random_attraction' })
}

// ============ 景点门票接口 ============

/** 获取景点列表（支持搜索、筛选、分页） */
export function getAttractions({ keyword = '', city = '', star = '', page = 1, pageSize = 10 } = {}) {
  return request({
    url: '/api/attractions',
    data: { keyword, city, star, page, page_size: pageSize }
  })
}

/** 获取所有城市列表 */
export function getCities() {
  return request({ url: '/api/cities' })
}

// ============ 智能助手接口 ============

/**
 * 自然语言查询
 * @param {string} question - 用户问题
 * @param {boolean} exportCsv - 是否导出 CSV
 */
export function queryAttraction(question, exportCsv = false, page = 1, pageSize = 100) {
  return request({
    url: '/api/query',
    method: 'POST',
    data: { question, export: exportCsv, page: page, page_size: pageSize }
  })
}

// ============ 天气接口 ============

/** 获取当前天气 */
export function getWeather(city = '上海') {
  return request({ url: '/api/weather', data: { city } })
}

/** 获取天气预报 */
export function getWeatherForecast(city = '上海', days = 3) {
  return request({ url: '/api/weather/forecast', data: { city, days } })
}
