'use strict';

/**
 * Constants of tab states
 * @enum {bool}
 */
let socket = null;
let TAB_STATE = {
    ACTIVE   : true,
    INACTIVE : false
};

/**
 * Constants of tab actions
 * @enum {string}
 */
let TAB_ACTION = {
    INIT : 'INIT',
    HIDE : 'HIDE',
    SHOW : 'SHOW'
};

/**
 * @enum {string}
 */
let VIEW = {
    WEB  : 'WEB',
    GRID : 'GRID',
    BACKGROUND   : 'BACKGROUND',
    NONE : undefined
};

let tabStates = {}; // tracks state of tabs with extension initiated. tabId unique in browser session across windows
let tabViews = {}; // TODO tracks view of tabs
let activeTabId; // id

/**
 * toggles tab state (ACTIVE or INACTIVE) and returns action (INIT, HIDE or SHOW)
 */
function toggleState(tabId) {
    // default tab state is undefined when extension is uninitiated
    if (typeof tabStates[tabId] === 'undefined') {
        tabStates[tabId] = TAB_STATE.ACTIVE;
        return TAB_ACTION.INIT;
    }
    else if (tabStates[tabId] == TAB_STATE.ACTIVE) {
        tabStates[tabId] = TAB_STATE.INACTIVE;
        return TAB_ACTION.HIDE;
    }
    else {
        tabStates[tabId] = TAB_STATE.ACTIVE;
        return TAB_ACTION.SHOW;
    }
}

/**
 * change browser action icon if tab switched
 */
chrome.tabs.onActivated.addListener(function (activeInfo) {
    activeTabId = activeInfo.tabId;
    updateIcon(activeInfo.tabId);
});

/**
 * sets icon of current tab based on its TAB_STATE
 */
function updateIcon(tabId) {
    if (tabId == activeTabId) {
        if (tabStates[tabId] == TAB_STATE.ACTIVE)
            chrome.browserAction.setIcon({path: "assets/logo/logo_color_16.png"});
        else
            chrome.browserAction.setIcon({path: "assets/logo/logo_grayscale_16.png"});
    }
}

/**
 * toggle widget and browserAction icon
 */
chrome.browserAction.onClicked.addListener(function(tab) {
    let tabAction = toggleState(tab.id);
    activeTabId = tab.id;
    updateIcon(tab.id);
    tabController(tab.id, tabAction);
});

/**
 * Change icon if current tab updated such as url change or reload
 */
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (tabId == activeTabId && tabStates[tabId] == TAB_STATE.ACTIVE) {
        // only if url or tab status (loading/ complete) changes
        if (typeof(changeInfo.status) !== 'undefined' || typeof(changeInfo.url) !== 'undefined') {
            tabStates[tabId] = undefined;
            updateIcon((tabId));
            tabController(tab, TAB_ACTION.HIDE);
            console.log("chrome.tabs.onUpdated: active and enabled tab " + tabId + "; status: " + changeInfo.status + "; url: " + changeInfo.url);
        }
    }
});

/**
 *
 * @param tab
 * @param tabAction
 */

function tabController(tabId, tabAction, callback) {
    // initiate controller
    if (tabAction == TAB_ACTION.INIT) {
        chrome.tabs.executeScript(null, {file: "app/contentScript/hotkeys.js"});
        chrome.tabs.insertCSS(tabId, {file: "assets/css/style.css"});

        // web view scripts

        chrome.tabs.executeScript(null, {file: "app/contentScript/webView/webViewUtilities.js"}, function() {
            chrome.tabs.executeScript(null, {file: "app/contentScript/webView/webViewMessagePassingHandler.js"}, function () {
                chrome.tabs.executeScript(null, {file: "app/contentScript/WebDataExtractionNotation/notation.js"}, function () {
                    chrome.tabs.executeScript(null, {file: "app/contentScript/WebDataExtractionNotation/query.js"}, function () {
                        chrome.tabs.executeScript(null, {file: "app/contentScript/webView/widget.js"}, function () {
                            chrome.tabs.executeScript(null, {file: "lib/popper/tooltip.js"}, function () {
                                chrome.tabs.executeScript(null, {file: "app/contentScript/webView/tooltip.js"}, function () {
                                    chrome.tabs.executeScript(null, {file: "app/contentScript/webView/webViewController.js"}, function () {
                                        chrome.tabs.executeScript(null, {file: "app/contentScript/webView/query_group.js"}, function () {
                                            chrome.tabs.executeScript(null, {file: "app/contentScript/webView/query.js"}, function () {
                                                chrome.tabs.executeScript(null, {file: "app/contentScript/webView/notification.js"}, function () {
                                                    if (chrome.runtime.lastError) {
                                                        console.error(chrome.runtime.lastError.message);
                                                    }
                                                });
                                            });
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });

        // TODO grid view scripts
        // chrome.tabs.executeScript(null, {file: "lib/jquery/jquery.dataTables.min.js"});
    }

    // resume
    if (tabAction != TAB_ACTION.HIDE) {
        // TODO show widget, re-highlight past selections, enable popover on click, enable or show grid view if tab view was Grid view
    }

    // pause
    else {
        // TODO hide widget, remove highlights, disable popovers, disable grid view but allow background ops
    }
    typeof callback === 'function' && callback();
}


/**
 * message listener and handler handle hot key
     */



chrome.commands.onCommand.addListener(function(command){
    if(command === "close_panels"){
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {greeting: "toggled"}, function(response) {
            });
        });
    }
});

function decodeUtf8(arrayBuffer) {
  var result = "";
  var i = 0;
  var c = 0;
  var c1 = 0;
  var c2 = 0;

  var data = new Uint8Array(arrayBuffer);

  // If we have a BOM skip it
  if (data.length >= 3 && data[0] === 0xef && data[1] === 0xbb && data[2] === 0xbf) {
    i = 3;
  }

  while (i < data.length) {
    c = data[i];

    if (c < 128) {
      result += String.fromCharCode(c);
      i++;
    } else if (c > 191 && c < 224) {
      if( i+1 >= data.length ) {
        throw "UTF-8 Decode failed. Two byte character was truncated.";
      }
      c2 = data[i+1];
      result += String.fromCharCode( ((c&31)<<6) | (c2&63) );
      i += 2;
    } else {
      if (i+2 >= data.length) {
        throw "UTF-8 Decode failed. Multi byte character was truncated.";
      }
      c2 = data[i+1];
      c3 = data[i+2];
      result += String.fromCharCode( ((c&15)<<12) | ((c2&63)<<6) | (c3&63) );
      i += 3;
    }
  }
  return result;
}

function decodeUTF8(bytes) {
    var s = '';
    var i = 0;
    while (i < bytes.length) {
        var c = bytes[i++];
        if (c > 127) {
            if (c > 191 && c < 224) {
                if (i >= bytes.length) throw 'UTF-8 decode: incomplete 2-byte sequence';
                c = (c & 31) << 6 | bytes[i] & 63;
            } else if (c > 223 && c < 240) {
                if (i + 1 >= bytes.length) throw 'UTF-8 decode: incomplete 3-byte sequence';
                c = (c & 15) << 12 | (bytes[i] & 63) << 6 | bytes[++i] & 63;
            } else if (c > 239 && c < 248) {
                if (i+2 >= bytes.length) throw 'UTF-8 decode: incomplete 4-byte sequence';
                c = (c & 7) << 18 | (bytes[i] & 63) << 12 | (bytes[++i] & 63) << 6 | bytes[++i] & 63;
            } else throw 'UTF-8 decode: unknown multibyte start 0x' + c.toString(16) + ' at index ' + (i - 1);
            ++i;
        }

        if (c <= 0xffff) s += String.fromCharCode(c);
        else if (c <= 0x10ffff) {
            c -= 0x10000;
            s += String.fromCharCode(c >> 10 | 0xd800)
            s += String.fromCharCode(c & 0x3FF | 0xdc00)
        } else throw 'UTF-8 decode: code point 0x' + c.toString(16) + ' exceeds UTF-16 reach';
    }
    return s;
}

chrome.runtime.onConnect.addListener(function(port) {
    socket = io.connect('http://127.0.0.1:5353/');
    // socket = io.connect('http://kite.cs.illinois.edu:5353/');
    port.onMessage.addListener(function(msg) {
        if (msg.answer == "new user"){
            // console.log(msg.data);
            socket.emit('new user', {topic_num: msg.data});
        }
        else if (msg.answer == "send message") {  // Senti Graph
            console.log("send message reached!!!");
            socket.emit('send message', {commentCount: msg.commentCount});
        }
        else if (msg.answer == "send message by desc"){  // Senti Analysis
            socket.emit('send message by desc', {commentCount: msg.commentCount});
        }
        else if (msg.answer == "leave"){ //Send Similar Comments 
            socket.emit('leave', {num_opt_scores: msg.num_opt_scores, base_comment_str: msg.base_comment_str});
        }
        else if (msg.answer == "exit"){
            // console.log(msg.topic_num);
            // socket.emit('exit', {topic_num: msg.topic_num});
        }
        else if (msg.answer == "pre check"){
            console.log("Pre check point!!!");   // Send domain to server and return stored result!
            if(socket.connected === false){
                port.postMessage({question: "no_connection"});
            }
            socket.emit('pre check', {domain_name: msg.domain_name});
        }
    });
    socket.on('get users', function(data) {   //Senti Graph
        var input = data.msg;
        var bytes = new Uint8Array(input);
        port.postMessage({question: "get users", data: String.fromCharCode.apply(null, bytes)});
    });

    socket.on('new message', function(data) {   //Senti Analysis
        console.log(data);
        port.postMessage({question: "new message", data: data});
    });

    socket.on('feedback', function(data) {
        port.postMessage({question: "feedback", data: data});
    });

    socket.on('sk_feedback', function(data) {   //Similarity Function
        var input = data.msg;
        let result = []
        for(let i = 0; i < input.length; i++){
            var bytes = new Uint8Array(input[i]);
            result.push((decodeUTF8(bytes)));
        }
        port.postMessage({question: "sk_feedback", data: result});
    });
});

chrome.runtime.onConnect.addListener(function(port) {

    port.onMessage.addListener(function(msg) {
        if (msg.answer == "table view"){
            
        }
        // else if (msg.answer == "leave"){
        //     console.log("leave reached!!!");
        //     console.log(msg.capa);
        //     socket.emit('leave', {domain_name: msg.domain_name, capa: msg.capa});
        // }
    });
});

chrome.runtime.onMessage.addListener(
    function(request,sender,senderResponse){
        if(request.msg === "socket"){
            console.log("receive from socket server: "+request.text);
        }
        if(request.msg === "xpath"){
            alert("message passed!!!");
        }

    },
    // function(request, sender, sendResponse) {
    //     let senderTabId = sender.tab.id;
    //     console.log("Message from tab " + senderTabId + " content script:" + sender.tab.url);
    //     // handle hotkeys
    //     if (request.type == "hotkey") {
    //         /**
    //          * VIPS tree not supported anymore
    //          * Comment stub below provided as an example how to handle hot keys request using message passing
    //          */
    //         /*
    //          // switch to vips tree
    //          if (request.event == "ctrl+shift+v") {
    //          if (senderTabId == activeTabId) {
    //          chrome.tabs.reload(senderTabId, {bypassCache: false}, function() {
    //          // wait for tab to finish reloading
    //          chrome.tabs.onUpdated.addListener(function reExecuteScripts (tabId , info) {
    //          if (tabId == activeTabId && info.status === 'complete') {
    //          // remove listener
    //          chrome.tabs.onUpdated.removeListener(reExecuteScripts);
    //          // re-execute scripts
    //          // CODE REMOVED
    //          }
    //          });
    //          });
    //          }
    //          else {
    //          sendResponse("Tab must be in focus to request switch to VIPS tree");
    //          }
    //          }
    //          */
    //     }
    // }
);

