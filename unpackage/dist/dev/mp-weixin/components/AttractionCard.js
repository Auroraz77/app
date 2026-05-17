"use strict";
const common_vendor = require("../common/vendor.js");
const _sfc_main = {
  __name: "AttractionCard",
  props: {
    attraction: {
      type: Object,
      default: () => ({
        name: "",
        city: "",
        description: ""
      })
    }
  },
  setup(__props) {
    return (_ctx, _cache) => {
      return {
        a: common_vendor.t(__props.attraction.city || "--"),
        b: common_vendor.t(__props.attraction.name || "加载中..."),
        c: common_vendor.t(__props.attraction.description || "暂无简介")
      };
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-58bb8176"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../.sourcemap/mp-weixin/components/AttractionCard.js.map
