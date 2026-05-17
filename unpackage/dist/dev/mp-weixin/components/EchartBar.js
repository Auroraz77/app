"use strict";
const common_vendor = require("../common/vendor.js");
if (!Array) {
  const _easycom_l_echart2 = common_vendor.resolveComponent("l-echart");
  _easycom_l_echart2();
}
const _easycom_l_echart = () => "../uni_modules/lime-echart/components/l-echart/l-echart.js";
if (!Math) {
  _easycom_l_echart();
}
const _sfc_main = {
  __name: "EchartBar",
  props: {
    title: {
      type: String,
      default: ""
    },
    option: {
      type: Object,
      default: () => ({})
    }
  },
  setup(__props) {
    const props = __props;
    const chartRef = common_vendor.ref(null);
    let chartInstance = null;
    const chartStyle = { width: "100%", height: "100%", flex: "1" };
    function onChartReady() {
      chartRef.value.init(common_vendor.echarts, (chart) => {
        chartInstance = chart;
        if (props.option && Object.keys(props.option).length > 0) {
          chart.setOption(props.option);
        }
      });
    }
    common_vendor.watch(
      () => props.option,
      (newOption) => {
        if (chartInstance && newOption) {
          chartInstance.setOption(newOption);
        }
      },
      { deep: true }
    );
    common_vendor.onBeforeUnmount(() => {
      if (chartInstance) {
        chartInstance.dispose();
        chartInstance = null;
      }
    });
    return (_ctx, _cache) => {
      return {
        a: common_vendor.t(__props.title),
        b: common_vendor.sr(chartRef, "ff2dcc0a-0", {
          "k": "chartRef"
        }),
        c: common_vendor.o(onChartReady, "18"),
        d: common_vendor.p({
          ["custom-style"]: chartStyle
        })
      };
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-ff2dcc0a"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../.sourcemap/mp-weixin/components/EchartBar.js.map
