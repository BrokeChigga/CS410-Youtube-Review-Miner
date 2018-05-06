/**
 * Created by Herbert on 11/3/2017.
 */
/*
 // html for popover buttons
 let popover_html = '<i class="fa fa-tag fa-fw-lg" id="web-view-assign-label"></i>' +
 '<i class="fa fa-object-group fa-fw-lg" id="web-view-select-similar"></i>' +
 '<i class="fa fa-link fa-fw-lg" id="web-view-merge"></i>' +
 '<i class="fa fa-trash-o fa-fw-lg" id="web-view-remove"></i>';
 // set popover attributes
 for (let i = 0; i < globalBlocks.length; i++) {
 let box = globalBlocks[i]['-att-box'];
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

let web_data_view_query = document.createElement('div');
web_data_view_query.id = 'webdataview-floating-query';
document.body.appendChild(web_data_view_query);
// let port = chrome.runtime.connect({name: "query"});

let cfq = new ContentFrame({
    'id':'webview-query',
    // 'appendTo': '#webdataview-floating-widget',
    'css': ['lib/font-awesome/css/font-awesome.css'],
    'inlineCss': {"width": "25%", "height": "200px", "position": "fixed", "right": "0px", "top": "0px", "z-index": 2147483647, "border-style": "none", "border-radius": 0, "background": "transparent", "display": "display"}
}, function(){
    // alert('callback called immediately after ContentFrame created');
    console.log("cf created successfully!");
});
let show_me_flag = false;
let cfq_iframe = cfq.body;
let target_query = [];
let query_dom_element = null;
let port = chrome.runtime.connect({name: "knockknock"});

// let note_html = $.parseHTML('<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css">' +
//     '<div class="webdataview" id="iframe-fullsize-container">' +
//     ' <div class="widget" id="web-view-widget">' +
//     '<div class="widget-buttons widget-float-left" style="height: 30px;">' +
//     '<p><b>Hi Het,</b>  </p> <p><b>Would you like to get notification next time? </b></p>' +
//     ' <button type="button" class="btn btn-success" id="note_accept">Yes, Please</button>&nbsp;&nbsp;&nbsp; ' +
//     '<button type="button" class="btn btn-info" id="note_reject">Maybe Later</button>' +
//     '</div></div> </div>');
// cfq.body.append(note_html);

ContentFrame.findElementInContentFrame('#note_accept', '#webview-query').click(function() {

});
// reject notification
ContentFrame.findElementInContentFrame('#note_reject', '#webview-query').click(function() {

});
$(document).ready(function() {
    $('#webdataview-floating-query').draggable({
        containment: 'window',
        scroll: false,
        stop: function() {
            $(this).css("left", parseFloat($(this).css("left")) / ($(window).width() / 100)+"%");
            $(this).css("top", parseFloat($(this).css("top")) / ($(window).height() / 100)+"%");
        }
    }).resizable({
        handles: 'e,w',
        minWidth: 150,
        stop: function() {
            $(this).css("left", parseFloat($(this).css("left")) / ($(window).width() / 100)+"%");
            $(this).css("width", parseFloat($(this).css("width")) / ($(window).width() / 100)+"%");
        }
    });

    cfq.loadJS('lib/jquery/jquery-3.1.1.min.js', function() {
        cfq.loadJS('lib/socket.io', function() {
            cfq.loadCSS('lib/font-awesome/css/font-awesome.css', function() {
                cfq.loadCSS('lib/bootstrap/css/bootstrap.min.css', function() {
                    cfq.loadCSS('assets/css/content-frame-internal.css', function() {
                        cfq.body.load(chrome.extension.getURL("app/contentScript/webView/index.html"), function () {
                            cfq_iframe.ready(function() {

                                let $messageForm = $('#messageForm');
                                let $messageFormDesc = $('#messageFormDesc');
                                let $message;
                                let $messageDesc;
                                let $messageName;
                                let $domain = $('#domain');
                                let $currentdomain = $('#currentdomain');
                                let $domainForm = $('#domainForm');
                                let $newdomain = $('#newdomain');
                                let $chat;
                                let $userForm = $('#userForm');
                                let $userFormArea = $('#userFormArea');
                                let $messageArea = $('#messageArea');
                                let $users;
                                let $username;
                                let $feedback = $('#domain-feedback');
                                let login = false;
                                let $visib = ContentFrame.findElementInContentFrame('#visib_button','#webview-query');
                                let $visual_option = 0;
                                let old_web_noti = [];
                                let old_label = [];

                                let current_domain = location.hostname;
                                let domain_html = '<h5 id="currentdomain" style="font-weight: 700">Your Current Domain Name: <br><p style="color: blue; font-weight: 300;">&#9755 &nbsp;'+current_domain+'</p></h5>';

                                function getVal (val) {
                                  multiplier = val.substr(-1).toLowerCase();

                                  if (multiplier == "k")
                                    return parseFloat(val) * 1000;
                                  else if (multiplier == "m")
                                    return parseFloat(val) * 1000000;
                                  else
                                    return val;
                                }
                                let vote = $("*").find("#vote-count-middle");
                                let comments = $("*").find("#content-text");
                                let lowerbound = 0; let current_vote;
                                let best_comment = '';

                                for(i = 0; i < vote.length; i++){
                                    current_vote = getVal(vote[i].innerHTML.replace(/\s/g, ''));
                                    if(current_vote >= lowerbound){
                                        best_comment = comments[i].innerText;
                                        lowerbound = current_vote;
                                    }
                                }
                                if(best_comment !== ''){
                                    let comment_html = $.parseHTML('<span id="popular" style="color: blue">' + best_comment + '</span>');
                                    ContentFrame.findElementInContentFrame('#popular','#webview-query').replaceWith(comment_html);
                                    
                                    let vote_html = $.parseHTML('<span  id="vote" style="color: red">' + lowerbound +  ' Likes</span>');
                                    ContentFrame.findElementInContentFrame('#vote','#webview-query').replaceWith(vote_html);
                                }

                                
                                ContentFrame.findElementInContentFrame('#show_graph','#webview-query').click(function(e){
                                    if(ContentFrame.findElementInContentFrame('#imgElem','#webview-query').css('display') === 'block'){
                                        $('#webview-query').css('height','200px');
                                        $('#webview-query').css('width','25%');
                                        ContentFrame.findElementInContentFrame('#imgElem','#webview-query').css('display', 'none');
                                        ContentFrame.findElementInContentFrame('#show_graph','#webview-query').html("Show Graph");
                                    }
                                    else{
                                        $('#webview-query').css('height','545px');
                                        $('#webview-query').css('width','35%');
                                        ContentFrame.findElementInContentFrame('#imgElem','#webview-query').css('display', 'block');
                                        ContentFrame.findElementInContentFrame('#show_graph','#webview-query').html("Hide Graph");
                                    }
                                
                                });


                                port.onMessage.addListener(function(msg) {
                                    if (msg.question === "get users"){
                                        let data = msg.data;
                                        ContentFrame.findElementInContentFrame('#senti_graph','#webview-query').css('display','none');
                                        ContentFrame.findElementInContentFrame('#show_graph','#webview-query').css('display','block');
                                        let img_dom = ContentFrame.findElementInContentFrame('#imgElem','#webview-query')[0];
                                        img_dom.setAttribute('src', "data:image/jpg;base64," + data);
                    
                                    }
                                    else if (msg.question === "feedback"){
                                        
                                    }
                                    else if(msg.question === "no_connection"){
                                        let noti_question = ContentFrame.findElementInContentFrame('#initial_p','#webview-query');
                                        let question_html = $.parseHTML('<p id="initial_p" style="font-size: large; color: red;"><b>There is NO connection to server...</b></p><p style="font-size: large; color: red;"><b>PLease Try Again!<b></p>');
                                        noti_question.replaceWith(question_html);
                                        ContentFrame.findElementInContentFrame('#initial_show','#webview-query').css('display','block');
                                        $('#webview-query').css('height','155px');
                                    }
                                    else if (msg.question === "new message") {
                                            let data = msg.data;
                                            let result = '';
                                            for(i = 0; i < data.msg.length; i++){
                                                result += data.msg[i];
                                                result += '%'
                                                result += '\n'
                                            }
                                            console.log(result)
                                            if(result !== ''){
                                                ContentFrame.findElementInContentFrame('#messageDesc','#webview-query').css('display','block');
                                                ContentFrame.findElementInContentFrame('#messageDesc','#webview-query').val(result);
                                            }       
                                    }
                                });

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

                                ContentFrame.findElementInContentFrame('#userForm','#webview-query').submit(function(e){
                                    e.preventDefault();
                                    $username = ContentFrame.findElementInContentFrame('#username','#webview-query').val();
                                    let login_html;
                                    if($username === ''){
                                        login_html = $.parseHTML('<input style="width: 235px; font-weight: 600; overflow: hidden;  display: inline-block; background-color: #ff0000" class="form-control" id="username" value=""/>');
                                        ContentFrame.findElementInContentFrame('#username','#webview-query').replaceWith(login_html);
                                    }
                                    else if(login === false){
                                        // socket.emit('new user', {username: $username, domain_name: location.hostname});
                                        port.postMessage({answer: "new user", username: $username, domain_name: location.href});
                                        // ContentFrame.findElementInContentFrame('#username','#webview-query').val('');
                                        login_html = $.parseHTML('<input style="width: 150px; font-weight: 600; overflow: hidden;  display: inline-block; background-color: #0bbd27" class="form-control" id="username" value="Logged In as: '+$username+'"/>');
                                        ContentFrame.findElementInContentFrame('#username','#webview-query').replaceWith(login_html);
                                        login = true;
                                    }
                                });

                                ContentFrame.findElementInContentFrame('#messageFormDesc','#webview-query').submit(function(e){
                                    e.preventDefault();
                                    commentCount = ContentFrame.findElementInContentFrame('#messageName', '#webview-query').val();
                                    if(commentCount === ''){
                                        let temp_html = $.parseHTML('<input style="height: 30px; width: 140px; background-color: #f442bc"; font-weight: 600; display: inline-block; float: left; bottom: 2px;" id="messageName" placeholder="Comment Number" value=""></input>');
                                        ContentFrame.findElementInContentFrame('#messageName','#webview-query').replaceWith(temp_html);
                                        return;
                                    }
                                    port.postMessage({answer: "send message by desc", commentCount: commentCount});  
                                });
                                ContentFrame.findElementInContentFrame('#senti_graph','#webview-query').click(function(e){
                                    e.preventDefault();
                                    commentCount = ContentFrame.findElementInContentFrame('#messageName', '#webview-query').val();
                                    if(commentCount !== ''){
                                        port.postMessage({answer: "send message", commentCount: commentCount});  
                                    }
                                    else{
                                        port.postMessage({answer: "send message", commentCount: 0});  
                                    }
                                });
                                

                                // ContentFrame.findElementInContentFrame('#domainForm','#webview-query').submit(function(e){
                                //     e.preventDefault();
                                //     socket.emit('change domain', {username: $username.val(), domain_name: $newdomain.val()});
                                // });
                                //
                                // socket.on('new domain', function(data){
                                //     let html = '<strong  style="color: green">'+'Domain Changed Successfully!!!'+'</strong>';
                                //     $feedback.html(html);
                                //     let newdomain = '<li class="list-group-item" style="color: blue">'+data+'</li>';
                                //     $currentdomain.html(newdomain);
                                // });
                                //
                                // socket.on('get domains', function(data){
                                //     let html = '<li class="list-group-item" style="color: blue">'+data+'</li>';
                                //     $currentdomain.html(html);
                                // });

                                function rgb2hex(rgb){
                                    rgb = rgb.match(/^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i);
                                    return (rgb && rgb.length === 4) ? "#" +
                                        ("0" + parseInt(rgb[1],10).toString(16)).slice(-2) +
                                        ("0" + parseInt(rgb[2],10).toString(16)).slice(-2) +
                                        ("0" + parseInt(rgb[3],10).toString(16)).slice(-2) : '';
                                }

                            });
                        });
                    });
                });
            });
        });
    });
});

