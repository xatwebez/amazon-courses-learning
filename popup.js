document.addEventListener('DOMContentLoaded', function () {
  const readButton = document.getElementById('readButton');
  const executeButton = document.getElementById('executeButton');
  const stopButton = document.getElementById('stopButton');
  const elementsList = document.getElementById('elementsList');

  let elementsQueue = [];
  let popupWindowId; // 保存弹出窗口的 ID

  // Read stored elements queue
  chrome.storage.local.get(['elementsQueue'], function(result) {
    elementsQueue = result.elementsQueue || [];
    displayElements(); // Display stored elements queue
  });

  // Read button click event
  readButton.addEventListener('click', function () {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        function: function () {
          const elements = Array.from(document.querySelectorAll('.moduleBox')); // Get elements with .moduleBox class
          const ids = elements.map(element => element.id).filter(id => id); // Get ids of each element and filter out empty ids
          return ids;
        }
      }, function (results) {
        const ids = results[0].result;
        elementsQueue = ids;
        displayElements();
        // Store updated elements queue
        chrome.storage.local.set({ elementsQueue });
      });
    });
  });

  // Execute button click event
  executeButton.addEventListener('click', function () {
    if (elementsQueue.length > 0) {
      executeElements();
    } else {
      alert('No elements to execute!');
    }
  });

  // Stop button click event
  stopButton.addEventListener('click', function () {
    clearTimeout(timer);
    alert('Execution stopped!');
  });

  let timer;

// Execute elements
function executeElements() {
  const id = elementsQueue.shift(); // Remove and return the first element's id
  elementsQueue.push(id); // Push the id back to the end of the queue
  displayElements();
  // Store updated elements queue
  chrome.storage.local.set({ elementsQueue });
  
  // Close previous popup window if it exists
  if (popupWindowId) {
    chrome.windows.remove(popupWindowId);
  }
  
  // Open new popup window
  chrome.windows.create({ url: 'https://sellercentral.amazon.com/learn/courses?moduleId=' + encodeURIComponent(id), type: 'popup' }, function(window) {
    popupWindowId = window.id; // Save the ID of the new popup window

    // Simulate click event to play video
    chrome.scripting.executeScript({
      target: { windowId: popupWindowId },
      function: function() {
        // Find and play videos
        const videos = document.querySelectorAll('YourVideoElementSelector');
        videos.forEach(video => {
          video.dispatchEvent(new Event('click'));
        });
      }
    });
  });

  timer = setTimeout(executeElements, 15000); // Execute again after 15 seconds
}

  // Display elements list
  function displayElements() {
    elementsList.innerHTML = '';
    elementsQueue.forEach(function (id) {
      const item = document.createElement('div');
      item.textContent = id;
      elementsList.appendChild(item);
    });
  }
});
