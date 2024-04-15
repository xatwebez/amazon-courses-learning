	console.log('Content script loaded.');
// 监听来自 background 页面的消息
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if (message.action === 'readElements') {
    // 从指定元素获取数据
    const elements = document.querySelectorAll('.moduleBox');
    let outputText = '';

    elements.forEach(function(element) {
      outputText += element.id + '\n';
    });


    // 发送消息给 background 页面
    chrome.runtime.sendMessage({action: 'readElements', output: outputText});
  } else if (message.action === 'startPolling') {
    // 开始轮询存储的数据
    startPolling();
  } else if (message.action === 'stopPolling') {
    // 停止轮询存储的数据
    stopPolling();
  } else if (message.action === 'updateOutput') {
    // 更新界面上的输出
    document.getElementById('output').value = message.output;
  }
});

// 初始化开始轮询按钮
document.getElementById('startPolling').addEventListener('click', function() {
  // 发送消息给 background 页面
  chrome.runtime.sendMessage({action: 'startPolling'});
});

// 初始化停止轮询按钮
document.getElementById('stopPolling').addEventListener('click', function() {
  // 发送消息给 background 页面
  chrome.runtime.sendMessage({action: 'stopPolling'});
});
