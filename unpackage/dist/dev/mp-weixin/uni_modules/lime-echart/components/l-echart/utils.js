"use strict";
const common_vendor = require("../../../../common/vendor.js");
function getDeviceInfo() {
  if (common_vendor.index.getDeviceInfo || common_vendor.index.canIUse("getDeviceInfo")) {
    return common_vendor.index.getDeviceInfo();
  } else {
    return common_vendor.index.getSystemInfoSync();
  }
}
function getWindowInfo() {
  if (common_vendor.index.getWindowInfo || common_vendor.index.canIUse("getWindowInfo")) {
    return common_vendor.index.getWindowInfo();
  } else {
    return common_vendor.index.getSystemInfoSync();
  }
}
function convertTouchesToArray(touches) {
  if (Array.isArray(touches)) {
    return touches;
  }
  if (typeof touches === "object" && touches !== null) {
    return Object.values(touches);
  }
  return touches;
}
function wrapTouch(event) {
  event.touches = convertTouchesToArray(event.touches);
  for (let i = 0; i < event.touches.length; ++i) {
    const touch = event.touches[i];
    touch.offsetX = touch.x;
    touch.offsetY = touch.y;
  }
  return event;
}
const devicePixelRatio = getWindowInfo().pixelRatio;
function sleep(time) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, time);
  });
}
function getRect(selector, context) {
  return new Promise((resolve, reject) => {
    const dom = common_vendor.index.createSelectorQuery().in(context).select(selector);
    const result = (rect) => {
      if (rect) {
        resolve(rect);
      } else {
        reject();
      }
    };
    dom.fields({
      node: true,
      size: true,
      rect: true
    }, result).exec();
  });
}
exports.devicePixelRatio = devicePixelRatio;
exports.getDeviceInfo = getDeviceInfo;
exports.getRect = getRect;
exports.sleep = sleep;
exports.wrapTouch = wrapTouch;
//# sourceMappingURL=../../../../../.sourcemap/mp-weixin/uni_modules/lime-echart/components/l-echart/utils.js.map
