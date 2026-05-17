"use strict";
const common_vendor = require("../common/vendor.js");
const BASE_URL = "http://10.241.172.215:8000";
function request(options) {
  return new Promise((resolve, reject) => {
    common_vendor.index.request({
      url: BASE_URL + options.url,
      method: options.method || "GET",
      data: options.data || {},
      header: {
        "Content-Type": "application/json",
        ...options.header
      },
      success: (res) => {
        if (res.statusCode === 200) {
          resolve(res.data);
        } else {
          reject(new Error(`请求失败: ${res.statusCode}`));
        }
      },
      fail: (err) => {
        reject(err);
      }
    });
  });
}
function getLiveRanking() {
  return request({ url: "/api/live_ranking" });
}
function getTopHistorySales() {
  return request({ url: "/api/top_history_sales" });
}
function getSalesByProvince() {
  return request({ url: "/api/sales_by_province" });
}
function getProvince4a5aCount() {
  return request({ url: "/api/province_4a5a_count" });
}
function getPriceDistribution() {
  return request({ url: "/api/price_distribution" });
}
function getRandomAttraction() {
  return request({ url: "/api/random_attraction" });
}
function queryAttraction(question, exportCsv = false, page = 1, pageSize = 100) {
  return request({
    url: "/api/query",
    method: "POST",
    data: { question, export: exportCsv, page, page_size: pageSize }
  });
}
exports.getLiveRanking = getLiveRanking;
exports.getPriceDistribution = getPriceDistribution;
exports.getProvince4a5aCount = getProvince4a5aCount;
exports.getRandomAttraction = getRandomAttraction;
exports.getSalesByProvince = getSalesByProvince;
exports.getTopHistorySales = getTopHistorySales;
exports.queryAttraction = queryAttraction;
//# sourceMappingURL=../../.sourcemap/mp-weixin/utils/api.js.map
