"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_api = require("../../utils/api.js");
const _sfc_main = {
  __name: "index",
  setup(__props) {
    const messages = common_vendor.ref([
      {
        text: "您好！我是景点智能助手，可以帮您查询景点信息，也可以帮您记录行程和账单。例如：明天上午 9 点去外滩，今天午餐花了 68 元。",
        isUser: false
      }
    ]);
    const question = common_vendor.ref("");
    const loading = common_vendor.ref(false);
    const scrollTarget = common_vendor.ref("");
    function scrollToBottom() {
      common_vendor.nextTick$1(() => {
        scrollTarget.value = "";
        common_vendor.nextTick$1(() => {
          scrollTarget.value = "msg-bottom";
        });
      });
    }
    function isRecordText(text) {
      return /添加行程|新增行程|记录行程|行程记录|记账|记一笔|账单|消费|花了|支付|付款|支出/.test(text);
    }
    function notifyProfileRefresh() {
      common_vendor.index.setStorageSync("profileNeedsRefresh", "1");
      common_vendor.index.$emit("profile-data-updated");
    }
    async function sendMessage() {
      const q = question.value.trim();
      if (!q || loading.value)
        return;
      messages.value.push({ text: q, isUser: true });
      question.value = "";
      loading.value = true;
      scrollToBottom();
      try {
        const result = await utils_api.queryAttraction(q, false);
        if (result.success) {
          if (result.type === "list" || result.type === "summary") {
            let intro = "";
            if (result.type === "summary" && result.summary) {
              intro = result.summary;
            }
            messages.value.push({
              text: intro,
              isUser: false,
              data: result.data || [],
              columns: result.columns || [],
              type: result.type,
              summary: result.type === "summary" ? "" : "",
              showAll: false
            });
          } else if (result.type === "knowledge" || result.type === "weather" || result.type === "error") {
            messages.value.push({ text: result.text || (isRecordText(q) ? "记录完成" : "处理完成"), isUser: false });
          } else if (result.type === "record") {
            notifyProfileRefresh();
            messages.value.push({ text: result.text || "记录完成，个人信息页可查看最新内容。", isUser: false });
          } else if (result.csv) {
            let text = result.result || "导出成功";
            messages.value.push({ text, isUser: false });
          } else {
            messages.value.push({ text: result.result || (isRecordText(q) ? "记录完成" : "处理完成"), isUser: false });
          }
        } else {
          messages.value.push({ text: "查询失败：" + result.error, isUser: false });
        }
      } catch (err) {
        messages.value.push({ text: "网络错误，请检查后端服务是否启动", isUser: false });
      } finally {
        loading.value = false;
        scrollToBottom();
      }
    }
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.f(messages.value, (msg, index, i0) => {
          return common_vendor.e({
            a: !msg.data
          }, !msg.data ? common_vendor.e({
            b: common_vendor.t(msg.text),
            c: msg.summary
          }, msg.summary ? {
            d: common_vendor.t(msg.summary)
          } : {}) : common_vendor.e({
            e: msg.text
          }, msg.text ? {
            f: common_vendor.t(msg.text)
          } : {}, {
            g: common_vendor.f(msg.showAll ? msg.data : msg.data.slice(0, 5), (item, i, i1) => {
              return common_vendor.e({
                a: common_vendor.t(item["名称"] || item.name || "未知景点"),
                b: item["价格"] !== void 0
              }, item["价格"] !== void 0 ? {
                c: common_vendor.t(item["价格"])
              } : {}, {
                d: item["省份"] || item["城市"]
              }, item["省份"] || item["城市"] ? {
                e: common_vendor.t(item["省份"] || ""),
                f: common_vendor.t(item["城市"] || "")
              } : {}, {
                g: item["星级"]
              }, item["星级"] ? {
                h: common_vendor.t(item["星级"])
              } : {}, {
                i: item["评分"]
              }, item["评分"] ? {
                j: common_vendor.t(item["评分"])
              } : {}, {
                k: item["销量"]
              }, item["销量"] ? {
                l: common_vendor.t(item["销量"])
              } : {}, {
                m: i
              });
            }),
            h: msg.data.length > 5
          }, msg.data.length > 5 ? {
            i: common_vendor.t(msg.showAll ? "收起" : "查看更多 (" + msg.data.length + "条)"),
            j: common_vendor.o(($event) => msg.showAll = !msg.showAll, index)
          } : {}), {
            k: index,
            l: "msg-" + index,
            m: common_vendor.n(msg.isUser ? "user-message" : "assistant-message")
          });
        }),
        b: loading.value
      }, loading.value ? {} : {}, {
        c: scrollTarget.value,
        d: loading.value,
        e: common_vendor.o(sendMessage, "7c"),
        f: question.value,
        g: common_vendor.o(($event) => question.value = $event.detail.value, "e8"),
        h: loading.value || !question.value.trim() ? 1 : "",
        i: common_vendor.o(sendMessage, "6f")
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-5a559478"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/chat/index.js.map
