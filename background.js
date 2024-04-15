// �����ͼ�걻���ʱ����
chrome.action.onClicked.addListener(function(tab) {
  // ��ǰ��ǩҳע�� content script
  chrome.scripting.executeScript({
    target: {tabId: tab.id},
    files: ['contentScript.js']
  });
});

// �������� content script ����Ϣ
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if (message.action === 'readElements') {
    // ��ָ��Ԫ�ػ�ȡ���ݲ��洢
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
    startPolling(); // ��ʼ��ѯ�洢������
  } else if (message.action === 'stopPolling') {
    stopPolling(); // ֹͣ��ѯ�洢������
  }
});

// ��ʼ����ѯ���
let pollingIntervalId;

// ��ʼ��ѯ�洢������
function startPolling() {
  const minInterval = 60; // Ĭ����С���Ϊ60��
  const maxInterval = 360; // Ĭ�������Ϊ360��

  // ��ִ��һ����ѯ����
  pollData();

  pollingIntervalId = setInterval(function() {
    pollData();
  }, 1000 * (Math.floor(Math.random() * (maxInterval - minInterval + 1)) + minInterval)); // ÿ����ѯһ�Σ�interval�Ǽ��ʱ��
}

// ֹͣ��ѯ�洢������
function stopPolling() {
  clearInterval(pollingIntervalId);
}

// �Ӵ洢�л�ȡ���ݲ���ѯ
function pollData() {
  chrome.storage.local.get('elementsData', function(data) {
    if (data.elementsData) {
      const ids = data.elementsData.split('\n');
      const firstId = ids.shift(); // �Ƴ���һ��id
      ids.push(firstId); // ����һ��id�ŵ����
      const updatedIds = ids.join('\n');
      chrome.storage.local.set({elementsData: updatedIds});

      // ������Ϣ�� content script
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {action: 'updateOutput', output: updatedIds});
      });
    }
  });
}
