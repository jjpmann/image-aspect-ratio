
var button = {
  'active': false,
  'status': null,
  'hits':   null
};


chrome.webRequest.onHeadersReceived.addListener(function (details) {
  if (details.type === 'main_frame') {

    button.active = false;
    button.status = null;
    button.hits = null;

    var headers = details.responseHeaders;
    var cacheHeaders = [
      'x-cache',
      'x-fastcgi-cache'
    ];

    var partialCacheHeaders = [
      'x-drupal-cache',
      'x-ee-cache'
    ];

    for (var i = 0; i < headers.length; i++) {
      var header = headers[i];

      if (cacheHeaders.indexOf(header.name.toLowerCase()) !== -1) {
          button.active = true;
          
          if (header.value.indexOf('HIT') !== -1) {
              button.status = 'hit';
          } else if (header.value.indexOf('MISS') !== -1) {
              button.status = 'miss';
          }  
      }
      
      button.hits = (header.name === 'X-Cache-Hits') ? parseInt(header.value, 10) : null;
    }
    if (button.status != 'hit') {
      for (var i = 0; i < headers.length; i++) {
        var header = headers[i];
        if (partialCacheHeaders.indexOf(header.name.toLowerCase()) !== -1) {
          button.active = true;
          if (header.value.indexOf('HIT') !== -1) {
              button.status = 'partial';
          }
        }
      }
    }
  }
}, {
  urls: [
    "http://*/*",
    "https://*/*"
  ]
}, [ 'responseHeaders' ]);

chrome.webNavigation.onCompleted.addListener(function(details) {
  if (details.frameId === 0) {

    console.log( button );

    var color = (button.active) ? 'blue' : 'gray';
    switch (button.status) {
      case 'hit':
        color = 'green';
        chrome.browserAction.setBadgeBackgroundColor({
          color: [0, 160, 0, 200],
          tabId: details.tabId
        });
        chrome.browserAction.setBadgeText({
          text: 'HIT',
          tabId: details.tabId
        });
        break;
      case 'partial':
        color = 'gray';
        chrome.browserAction.setBadgeBackgroundColor({
          color: [0, 160, 0, 200],
          tabId: details.tabId
        });
        chrome.browserAction.setBadgeText({
          text: 'CMS',
          tabId: details.tabId
        });
        break;
      case 'miss':
        color = 'red';
        chrome.browserAction.setBadgeText({
          text: 'MISS',
          tabId: details.tabId
        });
        break;
    }
    chrome.browserAction.setIcon({
      path: 'icon-' + color + '128.png',
      tabId: details.tabId
    });
    
  }
});