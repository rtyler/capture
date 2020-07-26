console.log("Loading Capture...");

const LOGO_URL = browser.runtime.getURL("icons/capture_48.png");
let contentScriptPort = null;

function portConnected(port) {
  contentScriptPort = port;
  /*
  portFromCS.postMessage({greeting: "hi there content script!"});
  portFromCS.onMessage.addListener(function(m) {
    console.log("In background script, received message from content script")
    console.log(m.greeting);
  });
  */
}

browser.runtime.onConnect.addListener(portConnected);

/**
 * Execute an actual search against the instant answers API
 */
function initiateCapture(text) {
  const url = "https://api.duckduckgo.com/?t=capture-addon&format=json";
  const queryUrl = `${url}&q=${encodeURI(text)}`;
  console.log(`Sending request to: ${queryUrl}`);

  fetch(queryUrl)
    .then(response => {
      return response.json();
    })
    .then(json => {
      console.log(json);

      if (contentScriptPort) {
        const payload = {
          type: 'RESULTS',
          query: text,
          logo: LOGO_URL,
          data: json
        };

        contentScriptPort.postMessage(payload);
      }
    });
}

function onCreated() {
  if (browser.runtime.lastError) {
    console.log(`Error: ${browser.runtime.lastError}`);
  } else {
    console.log("Item created successfully");
  }
}

browser.menus.create({
  id: "log-selection",
  title: browser.i18n.getMessage("menuItemSelectionLogger"),
  contexts: ["selection"]
}, onCreated);



browser.contextMenus.onClicked.addListener(function(info, tab) {
  switch (info.menuItemId) {
    case "log-selection":
      console.log(info.selectionText);
      initiateCapture(info.selectionText);
      break;
  }
});
