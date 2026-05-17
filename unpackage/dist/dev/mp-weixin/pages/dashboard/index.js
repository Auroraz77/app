"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_api = require("../../utils/api.js");
if (!Math) {
  (AttractionCard + EchartMap + EchartBar + EchartPie + EchartScatter)();
}
const EchartBar = () => "../../components/EchartBar.js";
const EchartPie = () => "../../components/EchartPie.js";
const EchartMap = () => "../../components/EchartMap.js";
const EchartScatter = () => "../../components/EchartScatter.js";
const AttractionCard = () => "../../components/AttractionCard.js";
const _sfc_main = {
  __name: "index",
  setup(__props) {
    const salesTab = common_vendor.ref("history");
    const currentAttraction = common_vendor.ref({ name: "", city: "", description: "" });
    const historySalesOption = common_vendor.ref({});
    const province4a5aOption = common_vendor.ref({});
    const mapOption = common_vendor.ref({});
    const liveRankingOption = common_vendor.ref({});
    const priceOption = common_vendor.ref({});
    const timers = [];
    const scrollHeight = common_vendor.ref(600);
    const statusBarHeight = common_vendor.ref(0);
    common_vendor.onLoad(() => {
      const sysInfo = common_vendor.index.getSystemInfoSync();
      statusBarHeight.value = sysInfo.statusBarHeight || 20;
      const titleContentHeight = 44;
      const tabBarHeight = 50;
      scrollHeight.value = sysInfo.windowHeight - statusBarHeight.value - titleContentHeight - tabBarHeight;
      fetchHistorySales();
      fetchProvince4a5a();
      fetchMapData();
      fetchLiveRanking();
      fetchPriceDistribution();
      fetchRandomAttraction();
      timers.push(setInterval(fetchMapData, 5e3));
      timers.push(setInterval(fetchLiveRanking, 500));
      timers.push(setInterval(fetchPriceDistribution, 1e4));
      timers.push(setInterval(fetchRandomAttraction, 3e3));
    });
    common_vendor.onUnload(() => {
      timers.forEach((t) => clearInterval(t));
      timers.length = 0;
    });
    async function fetchHistorySales() {
      try {
        const result = await utils_api.getTopHistorySales();
        if (result.success && result.data.length > 0) {
          const names = [];
          const values = [];
          result.data.reverse().slice(0, 6).forEach(function(item) {
            names.push(item["名称"]);
            values.push(item["销量"]);
          });
          historySalesOption.value = {
            tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
            grid: { left: "3%", right: "18%", bottom: 20, top: 20, containLabel: true },
            xAxis: {
              type: "value",
              axisLine: { show: false },
              axisTick: { show: false },
              axisLabel: { show: false },
              splitLine: { show: false }
            },
            yAxis: {
              type: "category",
              data: names,
              axisLine: { show: false },
              axisTick: { show: false },
              axisLabel: { color: "rgba(200,220,255,0.8)", fontSize: 11 }
            },
            series: [{
              name: "销量",
              type: "bar",
              barWidth: 12,
              data: values,
              itemStyle: {
                borderRadius: [0, 6, 6, 0],
                color: {
                  type: "linear",
                  x: 0,
                  y: 0,
                  x2: 1,
                  y2: 0,
                  colorStops: [
                    { offset: 0, color: "#0039CB" },
                    { offset: 0.7, color: "#9B59B6" },
                    { offset: 1, color: "#E74C3C" }
                  ]
                }
              },
              label: { show: true, position: "right", color: "#00E5FF", fontSize: 11, fontWeight: "bold", formatter: "{c}" }
            }]
          };
        }
      } catch (err) {
        common_vendor.index.__f__("error", "at pages/dashboard/index.vue:168", "获取历史销量数据失败:", err);
      }
    }
    async function fetchProvince4a5a() {
      try {
        const result = await utils_api.getProvince4a5aCount();
        if (result.success && result.data.length > 0) {
          const sortedData = result.data.sort(function(a, b) {
            return b.value - a.value;
          });
          province4a5aOption.value = {
            tooltip: { trigger: "item", formatter: "{b}: {c}个" },
            legend: {
              type: "scroll",
              orient: "vertical",
              right: 10,
              top: "center",
              itemWidth: 10,
              itemHeight: 10,
              itemGap: 10,
              textStyle: { color: "#fff", fontSize: 10 },
              pageTextStyle: { color: "#fff" },
              pageIconColor: "#aaa",
              pageIconInactiveColor: "#333"
            },
            series: [{
              name: "4A-5A景区数量",
              type: "pie",
              radius: ["18%", "88%"],
              center: ["40%", "50%"],
              roseType: "area",
              itemStyle: { borderRadius: 4 },
              label: { show: true, color: "#fff", fontSize: 9, position: "inside", formatter: "{b}" },
              labelLine: { show: false },
              data: sortedData
            }]
          };
        }
      } catch (err) {
        common_vendor.index.__f__("error", "at pages/dashboard/index.vue:197", "获取4A/5A景区数据失败:", err);
      }
    }
    async function fetchMapData() {
      try {
        const result = await utils_api.getSalesByProvince();
        if (result.success && result.data.length > 0) {
          const maxVal = Math.max(...result.data.map(function(d) {
            return d.value || 0;
          }));
          mapOption.value = {
            tooltip: { trigger: "item", formatter: function(p) {
              return p.name + ": " + (p.value || 0);
            } },
            visualMap: {
              min: 0,
              max: maxVal,
              left: "left",
              bottom: 20,
              text: ["高", "低"],
              textStyle: { color: "white", fontSize: 11 },
              inRange: { color: ["#e0ffff", "#006edd"] },
              show: true
            },
            series: [{
              type: "map",
              map: "china",
              label: { show: true, color: "white", fontSize: 8 },
              itemStyle: { areaColor: "#eee", borderColor: "rgb(108,105,105)" },
              emphasis: { label: { color: "#fff" }, itemStyle: { areaColor: "#1591ea" } },
              data: result.data
            }]
          };
        }
      } catch (err) {
        common_vendor.index.__f__("error", "at pages/dashboard/index.vue:223", "获取地图数据失败:", err);
      }
    }
    async function fetchLiveRanking() {
      try {
        const result = await utils_api.getLiveRanking();
        if (result.success) {
          const names = [];
          const values = [];
          result.data.reverse().slice(0, 6).forEach(function(item) {
            names.push(item["名称"]);
            values.push(item.today_sales);
          });
          liveRankingOption.value = {
            color: ["#3398DB"],
            tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
            grid: { left: "3%", right: "8%", bottom: 20, top: 20, containLabel: true },
            xAxis: {
              type: "value",
              axisLabel: { show: true, color: "white", fontSize: 11, formatter: function(v) {
                return v >= 1e3 ? v / 1e3 + "k" : v;
              } },
              axisLine: { show: true, lineStyle: { color: "rgba(255,255,255,0.3)" } },
              splitLine: { lineStyle: { color: "rgba(255,255,255,0.1)" } }
            },
            yAxis: {
              type: "category",
              data: names,
              axisLabel: { color: "white", fontSize: 11 },
              axisLine: { show: false },
              axisTick: { show: false }
            },
            series: [{
              data: values,
              type: "bar",
              barWidth: "50%",
              label: { show: true, position: "right", color: "#00E5FF", fontSize: 11, fontWeight: "bold" },
              itemStyle: {
                color: {
                  type: "linear",
                  x: 0,
                  y: 0,
                  x2: 1,
                  y2: 0,
                  colorStops: [
                    { offset: 0, color: "rgba(0, 80, 160, 0.6)" },
                    { offset: 1, color: "#00E5FF" }
                  ]
                },
                borderRadius: [0, 5, 5, 0]
              }
            }]
          };
        }
      } catch (err) {
        common_vendor.index.__f__("error", "at pages/dashboard/index.vue:269", "获取排名数据失败:", err);
      }
    }
    async function fetchPriceDistribution() {
      try {
        const result = await utils_api.getPriceDistribution();
        if (result.success) {
          const data = result.data.map(function(item) {
            return [item.xAxis, item.yAxis];
          });
          priceOption.value = {
            color: ["#00E5FF"],
            tooltip: { trigger: "axis", axisPointer: { type: "shadow", label: { show: true } } },
            grid: { left: "3%", right: "4%", bottom: "3%", top: 30, containLabel: true },
            xAxis: {
              type: "value",
              axisLabel: { color: "white", fontSize: 11 },
              axisLine: { show: true, lineStyle: { color: "rgba(255,255,255,0.3)" } },
              splitLine: { lineStyle: { color: "rgba(255,255,255,0.1)" } }
            },
            yAxis: {
              type: "value",
              axisLabel: { color: "white", fontSize: 11 },
              axisLine: { show: true, lineStyle: { color: "rgba(255,255,255,0.3)" } },
              splitLine: { lineStyle: { color: "rgba(255,255,255,0.1)" } }
            },
            series: [{
              type: "scatter",
              symbolSize: function(val) {
                var size = Math.sqrt(val[1]) * 1.5;
                return size < 4 ? 4 : Math.min(size, 28);
              },
              data,
              itemStyle: {
                color: {
                  type: "linear",
                  x: 0,
                  y: 0,
                  x2: 0,
                  y2: 1,
                  colorStops: [
                    { offset: 0, color: "rgb(19, 173, 255)" },
                    { offset: 1, color: "rgb(19, 200, 255)" }
                  ]
                },
                shadowBlur: 10,
                shadowColor: "rgba(19, 173, 255, 0.5)",
                shadowOffsetY: 5
              }
            }]
          };
        }
      } catch (err) {
        common_vendor.index.__f__("error", "at pages/dashboard/index.vue:316", "获取价格分布数据失败:", err);
      }
    }
    async function fetchRandomAttraction() {
      try {
        const result = await utils_api.getRandomAttraction();
        if (result.success) {
          currentAttraction.value = result.data;
        }
      } catch (err) {
        common_vendor.index.__f__("error", "at pages/dashboard/index.vue:327", "获取景点简介失败:", err);
      }
    }
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: statusBarHeight.value + "px",
        b: common_vendor.p({
          attraction: currentAttraction.value
        }),
        c: common_vendor.p({
          title: "假期出行数据地图分布",
          option: mapOption.value
        }),
        d: salesTab.value === "history" ? 1 : "",
        e: common_vendor.o(($event) => salesTab.value = "history", "c6"),
        f: salesTab.value === "live" ? 1 : "",
        g: common_vendor.o(($event) => salesTab.value = "live", "a8"),
        h: salesTab.value === "history"
      }, salesTab.value === "history" ? {
        i: common_vendor.p({
          title: "热门景点销量数据",
          option: historySalesOption.value
        })
      } : {
        j: common_vendor.p({
          title: "今日销量 TOP6 景点",
          option: liveRankingOption.value
        })
      }, {
        k: common_vendor.p({
          title: "4A/5A 景点分布",
          option: province4a5aOption.value
        }),
        l: common_vendor.p({
          title: "价格区间分布",
          option: priceOption.value
        }),
        m: scrollHeight.value + "px"
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-a869e244"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/dashboard/index.js.map
