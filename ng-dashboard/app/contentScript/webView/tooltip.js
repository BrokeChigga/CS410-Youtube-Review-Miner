/*
 // html for popover buttons
 var popover_html = '<i class="fa fa-tag fa-fw-lg" id="web-view-assign-label"></i>' +
 '<i class="fa fa-object-group fa-fw-lg" id="web-view-select-similar"></i>' +
 '<i class="fa fa-link fa-fw-lg" id="web-view-merge"></i>' +
 '<i class="fa fa-trash-o fa-fw-lg" id="web-view-remove"></i>';
 // set popover attributes
 for (var i = 0; i < globalBlocks.length; i++) {
 var box = globalBlocks[i]['-att-box'];
 if (box.nodeType == 1) { // check node is DOM element, not text
 box.setAttribute("data-toggle", "popover");
 box.setAttribute("data-content", popover_html);
 box.setAttribute("data-html", true);
 box.setAttribute("data-placement", "top");
 box.setAttribute("data-trigger", "focus");
 box.setAttribute("data-animation", true);
 box.setAttribute("block-index", i);
 }
 }
 */

let COLORS = ["(2,63,165)","(125,135,185)","(190,193,212)","(214,188,192)","(187,119,132)","(142,6,59)","(74,111,227)","(133,149,225)","(181,187,227)","(230,175,185)","(224,123,145)","(211,63,106)","(17,198,56)","(141,213,147)","(198,222,199)","(234,211,198)","(240,185,141)","(239,151,8)","(15,207,192)","(156,222,214)","(213,234,231)","(243,225,235)","(246,196,225)","(247,156,212)"];
shuffle(COLORS);
let collected_data = [];
let fieldname_color = {};
let field_label =  null;
labels_list = [];
let parent_collected = [];
let cap_counter = 0;
let mySet = new Set();
let tooltip_color =  null;
let cccccc =  null;
let cur_query = new Query({});
let cur_web_noti = null;
let apply_array = [];
let click_flag = false;
let port_tb = chrome.runtime.connect({name: "tbtb"});
// port.postMessage({answer: "pre check", domain_name: location.href});
setTimeout(function(){port.postMessage({answer: "pre check", domain_name: location.href});}, 1000);
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.greeting == "toggled"){
            $('#webview-query').toggle();
            $('#webdataview-floating-widget').toggle();
        }
    });

class TestTooltip {
    constructor(referenceElement, color) {
        self.instance = new Tooltip(referenceElement, {
            title: '<div id="webview-popper-container"></div>',
            trigger: "click",
            placement: "auto-top",
            html: true,
            container: 'body',
        });
        self.instance.show();
        let cf = new ContentFrame({
            'id':'webview-tooltip',
            'appendTo': '#webview-popper-container',
            'css': ['lib/font-awesome/css/font-awesome.css', 'lib/bootstrap/css/bootstrap.3.3.7.min.css'],
            'js': ['app/contentScript/webView/tooltipHandler.js'],
            'inlineCss':  {"width": "290px", "height": "30px", "z-index": 2147483640, "border": "none", "border-radius": 6, "overflow": "visible"}
    });
        let tooltip_html = $.parseHTML('<div class="webdataview" id="webdataview_id" style="background-color: ' + color + '; width: 100%; height: auto; overflow: visible; z-index: 2147483647 !important; ">' +
            '<input type="checkbox" id="filter_prefix" name="subscribe" value="0">'+
            '<label for="subscribeNews">Find Top Similar Comments: </label> <select id="filter_prefix_num" value="1"><option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option><option value="1">5</option></select>' +
            '</div>');
        cf.body.append(tooltip_html);

        window.onbeforeunload = function(e) {
            e.preventDefault();
            // if($username !== undefined) {
            //     port.postMessage({answer: "leave", username: $username, domain_name: location.hostname});
            // }
            port.postMessage({answer: "exit", domain_name: location.href});
            // chrome.storage.sync.get("value", function(items) {
            //     if (!chrome.runtime.error) {
            //         let array = items["value"];
            //         port.postMessage({answer: "leave", domain_name: location.href, capa: array});
            //     }
            // });
        };

        port.onMessage.addListener(function(msg) {
            if (msg.question === "feedback"){
               
            }
            else if(msg.question === "no_connection"){
               
            }
        });

       
        ContentFrame.findElementInContentFrame('#filter_prefix', '#webview-tooltip').click(function(e) {
           let num_opt_scores = ContentFrame.findElementInContentFrame('#filter_prefix_num', '#webview-tooltip').val();
           port_tb.postMessage({answer: "leave", num_opt_scores: num_opt_scores, base_comment_str: referenceElement.innerText});
        });
    }

    show() {
        self.instance.show();
    }

    hide() {
        self.instance.hide();
    }
}

// list of selected VIPS blocks
let selected_nodes = [];
let tooltip_node = undefined;
let alignSelectionWithClusterClassFlag = false;
let used_col_idx = 0;
let class_to_color_idx = {};

// let TOOLTIP_IDS_ARRAY = ["web-view-select-similar", "web-view-remove"];
let TOOLTIP_IDS_ARRAY = ["web-view-remove"];
let prev;
document.addEventListener("click", selectionHandler, true);

let css_title = null;
let css_store = null;


function doWhenEnterDOM(node, count) {
    if (node.data('wdv_original')===undefined) {
        removeAllSelections(); //pretty expensive, use the method above to reduce cost
        node.data('wdv_original',{title:node.prop('title'),border:node.css('border')});
        node.css('border', '1px dotted black');
    }
}

function doWhenExitDOM(node, count) {
    if (node.data('wdv_original')!==undefined) {
        node.prop('title', node.data('wdv_original')['title']);
        node.css('border', node.data('wdv_original')['border']);
        node.removeData('wdv_original');
    }
    // else if (count < 10) {
    //     setTimeout(doWhenExitDOM(node,count+1),250);
    // }
}

function removeAllSelections() {
    var elements = $('*').filter(function(){return $(this).data('wdv_original') !== undefined;});
    for (i = 0; i < elements.length; i++) {
        doWhenExitDOM($(elements[i]),0)
    }
}

$('*').hover(
    function(e){
        // The condition is to prevent the case when moving the mouse too fast
        // that it re-enters the element before finishing the previous entering
        doWhenEnterDOM($(this),0);
        e.preventDefault();
        e.stopPropagation();
        return false;
    },function(e){
        // console.log($(this).css('border'));
        // console.log($(this).data('wdv_original'));
        // css_title = $(this).data('wdv_original_title');
        // css_store = $(this).data('wdv_original_css');
        // The condition is to prevent the case when moving the mouse too fast
        // that it goes out of the element before finishing the previous going out
        doWhenExitDOM($(this),0);
        e.preventDefault();
        e.stopPropagation();
        return false;
    }
);

function selectionHandler(event) {
    event.preventDefault();
    event.stopPropagation();
    mySet.clear();
    let event_target = event.target;
    apply_array.push(event_target);
    if (TOOLTIP_IDS_ARRAY.indexOf(event.target.id ) != -1) {
        // console.log(event.target.id);
        tooltipHandler(event.target.id);
        return;
    }
    
    $('#webview-popper-container').remove();

    let tooltip_color = "rgb" + COLORS[used_col_idx];
    used_col_idx += 1;
    if(cccccc !== null){
        cccccc.style.outline = 0;
    }
   
    
    let tip = new TestTooltip(event.target, tooltip_color);

    if (!tooltip_node || event.target.className != tooltip_node.className) {
        for (let i = 0; i < selected_nodes.length; i++) {
            selected_nodes[i].style.outline = "none";
        }
        selected_nodes = [];
    }
    if(event.target.id === "content-text"){
        event.target.style.outline = '5px solid ' + tooltip_color;
        cccccc = event.target;
    }
}

function updateTooltip(idx, color) {
    if(tooltipBoxIdx)
        destroyTooltip();
    tooltipBoxIdx = idx;
    let box = globalBlocks[idx]['-att-box'];
    $(box).popover("show");
    $('.popover').css('background-color', color);
    //$('.popover.top .arrow').css('border-top-color', color);
}

function destroyTooltip() {
    let box = globalBlocks[tooltipBoxIdx]['-att-box'];
    $(box).popover("hide");
    tooltipBoxIdx = undefined;
}

function isEmptyArray(arr) {
    if (arr && arr.length==0)
        return true;
    return false;
}

function deselectVipsBlock(idx) {
    let idxClusterColor = getClusterColorFromIndex(idx);
    let box = globalBlocks[idx]['-att-box'];

    // reset border
    box.style.border = "2px solid rgba(0,0,0,0)";
    box.style.borderLeft = "2.5px solid " + idxClusterColor;

    // remove from selectedBlockIndices
    selectedBlockIndices.splice(selectedBlockIndices.indexOf(idx), 1);

    // hide tooltip
    $(box).popover("hide");
}

function deselectVipsBlockArray(arrayIndices) {
    for (let i = 0; i < arrayIndices.length; i++) {
        deselectVipsBlock(arrayIndices[i]);
    }
}

/*
 * returns color corresponding to cluster of block 'idx' from CSS_COLOR_NAMES in wdvKMeans.js
 */
function getClusterColorFromIndex(idx) {
    return CSS_COLOR_NAMES[id2cluster[idx]];
}

/*
 * returns vips globalBlocks Index for box id if validation succeeds
 */
function getVipsIndexFromBoxId(strIdx) {
    // validate vips block
    let vipsBoxIdPattern =  /vips(\d+)$/i;
    let regMatch = strIdx.match(vipsBoxIdPattern);
    if(regMatch) {
        // parse index
        let idx = parseInt(regMatch[1]);
        return idx;
    }
    // false for error checking
    return false;
}

function assignLabel() {
    for (let i = 0; i < selectedBlockIndices.length; i++) {
        let idx = selectedBlockIndices[i];
        labels[idx] = label;
        // change colors & cluster & id2cluster
    }
}

function deleteSubtreeOfSelectedBlocks() {
    destroyTooltip();
    for(let i = 0; i < selectedBlockIndices.length; i++) {
        let idx = selectedBlockIndices[i];
        let box = globalBlocks[idx]['-att-box'];
        box.style.visibility = "hidden";
    }
    selectedBlockIndices = [];
}

function removeFromClusterClass() {
    destroyTooltip();
    for(let i = 0; i < selectedBlockIndices.length; i++) {
        let idx = selectedBlockIndices[i];
        let box = globalBlocks[idx]['-att-box'];
        box.style.border = "none";
        let clusterid = id2cluster[idx];
        if (clusters[clusterid].indexOf(idx) > -1)
            clusters[clusterid].splice(idx, 1);
        id2cluster[idx] = undefined;
    }
    selectedBlockIndices = [];
}

function selectCluster() {
    let clusterid = id2cluster[tooltipBoxIdx];
    let clusterColor = getClusterColorFromIndex(tooltipBoxIdx);
    if(clusterid){
        for (let i = 0; i < clusters[clusterid].length; i++) {
            let idx = clusters[clusterid][i];
            if(selectedBlockIndices.indexOf(idx) < 0)
                selectedBlockIndices.push(idx);
            let box = globalBlocks[idx]['-att-box'];
            box.style.border = "2px solid " + clusterColor;
        }
    }
}

function alignSelectionWithClusterClass() {
    for(let i = 0; i < selectedBlockIndices.length; i++) {
        let idx = selectedBlockIndices[i];
        let box = globalBlocks[idx]['-att-box'];
        box.style.borderStyle = "dotted";
    }

    destroyTooltip();
    alignSelectionWithClusterClassFlag = true;
}

function alignWithSelectedBlockCluster(idx, clusterColor) {
    let clusterId = id2cluster[idx];

    for(let i = 0; i < selectedBlockIndices.length; i++) {
        let idx = selectedBlockIndices[i];
        let currentClusterId = id2cluster[idx];
        if (clusters[currentClusterId].indexOf(idx) > -1)
            clusters[currentClusterId].splice(idx, 1);
        clusters[clusterId].push(idx);
        id2cluster[idx] = clusterId;
    }
    deselectVipsBlockArray(selectedBlockIndices);
    alignSelectionWithClusterClassFlag = false;
}

// function to convert hex format to a rgb color
function rgb2hex(rgb){
    rgb = rgb.match(/^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i);
    return (rgb && rgb.length === 4) ? "#" +
        ("0" + parseInt(rgb[1],10).toString(16)).slice(-2) +
        ("0" + parseInt(rgb[2],10).toString(16)).slice(-2) +
        ("0" + parseInt(rgb[3],10).toString(16)).slice(-2) : '';
}

let appendbox = [];
 appendLabel2Widget = function(labelName, labelColor) {
    labels_list.push(labelName);
    let labelId = labelColor.substring(4, labelColor.length - 1).replace(',','-').replace(',','-');
    ContentFrame.findElementInContentFrame('.widget-labels', '#webdataview-widget-iframe').find('ul').append('' +
        '<li class="widget-labels-li" id = '+ labelId +'> ' +
        '<svg class="widget-label-circle-svg" height="10" width="10"> ' +
        '<circle cx="5" cy="5" r="4" stroke= '+ labelColor +' stroke-width="1.5" fill="white" />' +
        ' </svg>'+ labelName +'</li>');

    ContentFrame.findElementInContentFrame('.widget-labels', '#webdataview-widget-iframe').find('ul').find('li#'+labelId).click(function(e) {
        // $(e.target).hide();

        let current = e;
        let label_name = current.target.innerText;
        // console.log(ContentFrame.findElementInContentFrame('#delete_label_id', '#webdataview-floating-widget').length);
        for(i = 0; i < appendbox.length; i++){
            $('#'+appendbox[i]).remove();
        }
        appendbox = [];
        appendbox.push(labelId);

        let widget_delete_label = new ContentFrame({
            'id': labelId,
            'class':'delete_label_class',
            'appendTo': '#webdataview-floating-widget',
            'css': ['lib/font-awesome/css/font-awesome.css'],
            'js': ['app/contentScript/webView/label_delete.js'],
            'inlineCss': {"width": "200px", "height": "165px", "border": "none", "border-radius": 6,
                "margin-top": "60px", "background-color": "black",  "position": "fixed", "z-index": 2147483647, "overflow-y": "hidden"}
        });
        let tooltip_html = $.parseHTML('<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css">' +
            '<div>' +
            '<input type="text" name="searchTxt" id="searchTxt" maxlength="10" value="' + label_name + '" />' +
            '<label for="text"> Change label name here:</label> ' +
            '<div>'+
            '<button style="display: inline-block" type="button" class="btn btn-warning" id="label_delete">Delete</button>'+
            '<button style="display: inline-block" type="button" class="btn btn-info" id="label_change">Change</button><br>' +
            '<button style="display: inline-block" type="button" class="btn btn-danger" id="label_close">Closed</i></button>' +
            '<button style="display: inline-block" type="button" class="btn btn-success" id="label_records">Records</i></button>' +
            '</div>'+
            '</div>');

        widget_delete_label.body.append(tooltip_html);

    });
};

/**
 * Shuffles array in place. ES6 version
 * @param {Array} a items The array containing the items.
 */
function shuffle(a) {
    for (let i = a.length; i; i--) {
        let j = Math.floor(Math.random() * i);
        [a[i - 1], a[j]] = [a[j], a[i - 1]];
    }
}
