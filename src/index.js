const backgroundPort = browser.runtime.connect({name:"port-from-cs"});
//myPort.postMessage({greeting: "hello from content script"});

backgroundPort.onMessage.addListener(message => {
  console.log(message);

  if (message.type == 'RESULTS') {
    let resultsWindow = document.createElement('div');
    resultsWindow.className = 'capture-form-popup';
    resultsWindow.innerHTML = `
  <div class="capture-addon capture-form-container">
    <button type="button" class="btn cancel" onclick="for (e of document.getElementsByClassName('capture-form-popup')) { e.remove(); }; return false;">Close</button>

    <div class="header">
      <strong>
        <img src="${message.logo}" width="16" />
        Results for &quot;${message.query}&quot;
      </strong>
    </div>

    <div class="results">
      <div class="result-abstract">
        <div class="abstract">
          ${message.data.Abstract}
        </div>
        <div class="abstract-source">
        From <a target="_blank" href="${message.data.AbstractURL}">${message.data.AbstractSource}</a>
        </div>
      </div>
    </div>

    <div class="attribution">
      Results powered by <a href="https://duckduckgo.com" target="_blank">DuckDuckGo</a>
    </div>
  </div>
    `;

    const coords = getSelectionCoords();
    const sel = window.getSelection();
    // Using the parent height to try to get the box below the selection
    const parentHeight = sel.anchorNode.parentNode.clientHeight;

    resultsWindow.style.top = `${coords.y + parentHeight}px`;
    resultsWindow.style.left = `${coords.x}px`;

    document.body.appendChild(resultsWindow);

    for (e of document.getElementsByClassName('capture-form-popup')) {
      e.style.display = 'block';
    }
  }
});

/**
 * https://stackoverflow.com/a/6847328
 */
function getSelectionCoords(win) {
    win = win || window;
    var doc = win.document;
    var sel = doc.selection, range, rects, rect;
    var x = 0, y = 0;
    if (sel) {
        if (sel.type != "Control") {
            range = sel.createRange();
            range.collapse(true);
            x = range.boundingLeft;
            y = range.boundingTop;
        }
    } else if (win.getSelection) {
        sel = win.getSelection();
        if (sel.rangeCount) {
            range = sel.getRangeAt(0).cloneRange();
            if (range.getClientRects) {
                range.collapse(true);
                rects = range.getClientRects();
                if (rects.length > 0) {
                    rect = rects[0];
                }
                x = rect.left;
                y = rect.top;
            }
            // Fall back to inserting a temporary element
            if (x == 0 && y == 0) {
                var span = doc.createElement("span");
                if (span.getClientRects) {
                    // Ensure span has dimensions and position by
                    // adding a zero-width space character
                    span.appendChild( doc.createTextNode("\u200b") );
                    range.insertNode(span);
                    rect = span.getClientRects()[0];
                    x = rect.left;
                    y = rect.top;
                    var spanParent = span.parentNode;
                    spanParent.removeChild(span);

                    // Glue any broken text nodes back together
                    spanParent.normalize();
                }
            }
        }
    }
    return { x: x, y: y };
}

document.body.addEventListener("click", function() {
  console.log("Page clicked");
});


const styles = document.createElement('style');
styles.type = 'text/css';
styles.innerHTML = `
 {box-sizing: border-box;}

.capture-form-popup {
  font-family: Inter,X-LocaleSpecific,sans-serif !important;
  display: none;
  position: fixed;
  border: 2px solid lightgrey;
  z-index: 9;
  background-color: white;
  font-size: 10pt;
  line-height: 1.5;
}

.capture-addon > .header {
  padding: 3px;
}

.capture-addon > .results {
  padding: 3px;
}

/* Add styles to the form container */
.capture-form-container {
  max-width: 300px;
  background-color: white;
}

/* Add a red background color to the cancel button */
.capture-form-container .cancel {
  background-color: red;
  padding: 5px;
  width: auto;
  font-size: smaller;
  color: white;
  float: right;
}

/* Add some hover effects to buttons */
.capture-form-container .btn:hover, .open-button:hover {
  opacity: 1;
}

.capture-addon > .attribution {
  font-size: small;
  background-color: lightgrey;
  padding: 2px;
}

.result-abstract > .abstract-source {
  font-size: small;
  font-weight: bold;
  padding: 2px;
  text-align: right;
}
`;
document.getElementsByTagName('head')[0].appendChild(styles);
