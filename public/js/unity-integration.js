/**
 * Unity WebGL 集成脚本
 * 管理 Unity WebGL 实例的创建和与网页的交互
 */

// Unity 实例
var unityInstance = null;

// 初始化 Unity
function initUnity(buildName, containerID) {
  // 如果已经初始化，则返回
  if (unityInstance !== null) return;
  
  var buildUrl = "/unity/Build/";
  var loaderUrl = buildUrl + buildName + ".loader.js";
  var config = {
    dataUrl: buildUrl + buildName + ".data",
    frameworkUrl: buildUrl + buildName + ".framework.js",
    codeUrl: buildUrl + buildName + ".wasm",
    streamingAssetsUrl: "StreamingAssets",
    companyName: "发动机虚拟装配技术研究中心",
    productName: "发动机虚拟装配系统",
    productVersion: "1.0",
    // 显示加载进度的回调函数
    showBanner: unityShowBanner,
  };

  // 显示加载进度
  function unityShowBanner(msg, type) {
    var progressContainer = document.querySelector("#unity-progress-bar-container");
    if (!progressContainer) return;
    
    var progressBar = document.querySelector("#unity-progress-bar");
    if (type === "error") {
      progressContainer.innerHTML = `<div class="unity-error">${msg}</div>`;
      return;
    }
    
    progressBar.style.width = (100 * msg) + "%";
  }

  var container = document.querySelector("#" + containerID);
  if (!container) {
    console.error("Unity 容器元素未找到!", containerID);
    return;
  }

  // 创建脚本加载器
  var script = document.createElement("script");
  script.src = loaderUrl;
  script.onload = () => {
    createUnityInstance(container, config, unityShowBanner).then((instance) => {
      unityInstance = instance;
      // 显示连接成功消息
      console.log("Unity WebGL 连接成功!");
      
      // 隐藏加载进度条
      var progressContainer = document.querySelector("#unity-progress-bar-container");
      if (progressContainer) {
        setTimeout(() => {
          progressContainer.style.display = "none";
        }, 1500);
      }
    }).catch((error) => {
      console.error("Unity WebGL 初始化错误:", error);
    });
  };
  document.body.appendChild(script);
}

// 调用 Unity 中的方法
function sendMessageToUnity(gameObjectName, methodName, parameter) {
  if (unityInstance === null) {
    console.error("Unity 实例尚未初始化!");
    return;
  }
  
  if (parameter === undefined) {
    unityInstance.SendMessage(gameObjectName, methodName);
  } else {
    unityInstance.SendMessage(gameObjectName, methodName, parameter);
  }
}

// 切换全屏
function toggleFullscreen() {
  if (unityInstance === null) return;
  unityInstance.SetFullscreen(1);
}

// 销毁 Unity 实例
function destroyUnity() {
  if (unityInstance === null) return;
  unityInstance.Quit().then(() => {
    unityInstance = null;
    console.log("Unity 实例已销毁");
  });
}

// 暴露给全局使用
window.unityIntegration = {
  init: initUnity,
  sendMessage: sendMessageToUnity,
  toggleFullscreen: toggleFullscreen,
  destroy: destroyUnity
};