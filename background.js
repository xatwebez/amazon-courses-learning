// 当插件图标被点击时触发
chrome.action.onClicked.addListener(function(tab) {
  // 向当前标签页注入 content script
  chrome.scripting.executeScript({
    target: {tabId: tab.id},
    files: ['contentScript.js']
  });
});

// 监听来自 content script 的消息
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if (message.action === 'readElements') {
    // 从指定元素获取数据并存储
    chrome.scripting.executeScript({
      target: {tabId: sender.tab.id},
      function: () => {
        const elements = document.querySelectorAll('.moduleBox');
        let outputText = '';
        
        elements.forEach(function(element) {
          outputText += element.id + '\n';
        });
        
        chrome.runtime.sendMessage({output: outputText});
      }
    });
  } else if (message.action === 'startPolling') {
    startPolling(); // 开始轮询存储的数据
  } else if (message.action === 'stopPolling') {
    stopPolling(); // 停止轮询存储的数据
  }
});

// 初始化轮询间隔
let pollingIntervalId;

// 开始轮询存储的数据
function startPolling() {
  const minInterval = 60; // 默认最小间隔为60秒
  const maxInterval = 360; // 默认最大间隔为360秒

  // 先执行一次轮询操作
  pollData();

  pollingIntervalId = setInterval(function() {
    pollData();
  }, 1000 * (Math.floor(Math.random() * (maxInterval - minInterval + 1)) + minInterval)); // 每秒轮询一次，interval是间隔时间
}

// 停止轮询存储的数据
function stopPolling() {
  clearInterval(pollingIntervalId);
}

// 从存储中获取数据并轮询
function pollData() {
  chrome.storage.local.get('elementsData', function(data) {
    if (data.elementsData) {
      const ids = data.elementsData.split('\n');
      const firstId = ids.shift(); // 移除第一个id
      ids.push(firstId); // 将第一个id放到最后
      const updatedIds = ids.join('\n');
      chrome.storage.local.set({elementsData: updatedIds});

      // 发送消息给 content script
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {action: 'updateOutput', output: updatedIds});
      });
    }
  });
}
