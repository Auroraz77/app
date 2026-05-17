/**
 * API 请求封装
 *
 * 使用说明：
 * - H5 开发时：通过 vite proxy 转发到 localhost:8000，BASE_URL 留空即可
 * - App 端：需要将 BASE_URL 改为后端的公网地址
 * - 小程序端：需要配置合法域名，且必须是 HTTPS
 */

const BASE_URL = 'http://10.241.172.215:8000'

/**
 * 通用请求方法
 */
function request(options) {
  return new Promise((resolve, reject) => {
    uni.request({
      url: BASE_URL + options.url,
      method: options.method || 'GET',
      data: options.data || {},
      header: {
        'Content-Type': 'application/json',
        ...options.header
      },
      success: (res) => {
        if (res.statusCode === 200) {
          resolve(res.data)
        } else {
          reject(new Error(`请求失败: ${res.statusCode}`))
        }
      },
      fail: (err) => {
        reject(err)
      }
    })
  })
}

// ============ 数据大屏接口 ============

/** 获取实时销量 TOP10 */
export function getLiveRanking() {
  return request({ url: '/api/live_ranking' })
}

/** 获取历史销量 TOP20 */
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
