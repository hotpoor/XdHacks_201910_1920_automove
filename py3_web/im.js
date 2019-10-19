document.title="MMPLUS | 夏力维の留言板"
/**
 * 设备识别
 */

var device_now = "device_pc"

if (navigator.userAgent.indexOf('iPhone') !== -1) {
    device_now = "device_iphone"
}else if (navigator.userAgent.indexOf('iPad') !== -1) {
    device_now = "device_iphone"
} else if (navigator.userAgent.indexOf('Android') !== -1) {
    device_now = "device_android"

} else if (navigator.userAgent.indexOf('Macintosh') !== -1) {
    device_now = "device_mac"
}

var is_weixin = navigator.userAgent.indexOf('MicroMessenger') !== -1 || navigator.userAgent.indexOf('TBS')!== -1 || navigator.userAgent.indexOf('MQQBrowser')!== -1

var timeout_rooms_show_plus = (device_now === 'device_iphone') ? 200 : 100 // rooms 显示动画的时间

var members_json = {}
members_json[USER_ID] = {"headimgurl":USER_HEADIMGURL,"nickname":USER_NAME,"tel": ""}
var rooms_info = {}

var initialRoomId = '0cd8429c1da249b6935d7eef72d7fc0b'
var initialRoomImg = "http://image.hotpoor.org/2dd2c53e7c654c66b398e574848d4c34_08aed20957caca43b0df23442de17f6f?imageView2/2/w/200"
var initialRoomName = '夏力维和他的朋友们'

/*
 * 初始化
 */
var w = window.innerWidth
var h = window.innerHeight
var r = 30
var minX = r - 5
var maxX = w - minX
var minY = r + 5
var maxY = h - minY
var x = maxX
var y = minY + 80
var baseZIndex = 11000
var MAXOFFSET = 30    // 触摸偏移的最大值 px
var MAXPERIOD = 150  // 触摸时间的最大值 ms

var touchId
var _clientX
var _clientY
var isStarted = false
var isMoved = false
var isExpanded = false

var _startX
var _startY
var _maxOffset = 0
var _time

var latestRoomIds = []
var targetRoomId = null
var MAXROOMS = 4


var $body = $(document.body)


var html =
    '<div class="im_chat_heads"></div>' +
    '<div class="im_logo transition" style="visibility:hidden;z-index:10000;background-image:url(http://www.hotpoor.org/static/img/mmplus_logo.png)"></div>' +
    '<div class="im_room_icon_arrow"></div>' +
    '<div class="im_menu ' + device_now + '" style="display:none;">' +
        '<div class="im_menu_toolbar clearfix">' +
          '<div class="im_menu_resize"></div>' +
          '<div class="im_menu_tabs_wrap">' +
            '<div class="im_menu_border" style="left:0%;"></div>' +
            '<div class="im_menu_tabs">' +
                '<div class="im_menu_tab im_menu_tab_home active" data-tab="home" data-offset="0"></div>' +
                '<div class="im_menu_tab im_menu_tab_order hide" data-tab="order" data-offset="1"></div>' +
                '<div class="im_menu_tab im_menu_tab_discover hide" data-tab="discover" data-offset="2"></div>' +
                '<div class="im_menu_tab im_menu_tab_me hide" data-tab="me" data-offset="3"></div>' +
            '</div>' +
           '</div>' +
         '</div>' +
        '<div class="im_menu_container">' +
            '<div class="im_menu_content" data-tab="home"></div>' +
            '<div class="im_menu_content" data-tab="order">order</div>' +
            '<div class="im_menu_content" data-tab="discover">discover</div>' +
            '<div class="im_menu_content" data-tab="me">me</div>' +
        '</div>' +
    '</div>' +
    '<div class="im_box ' + device_now + '" style="display:none;">' +
        '<div class="im_title">' +
            '<span class="im_chat_name"></span>' +
            '<span class="im_chat_icon_resize"></span>' +
        '</div>' +
        '<div class="im_rooms">' +
            '<div class="im_room_load_tip" style="display:none;">消息加载中...</div>' +
        '</div>' +
        '<div class="im_edit_base">' +
            '<div class="im_edit_icon_plus"></div>' +
            '<div class="im_edit_input_text">' +
                '<textarea class="im_edit_content" placeholder="发消息..."></textarea>' +
            '</div>' +
            '<div class="im_edit_icon_send"></div>' +
        '</div>' +
        '<div class="im_edit_plus">' +
            '<div class="im_edit_toolbar">' +
                '<div class="im_edit_icon im_edit_icon_text" data-tool="text"></div>' +
                '<div class="im_edit_icon im_edit_icon_face" data-tool="face"></div>' +
                '<div class="im_edit_icon im_edit_icon_image" data-tool="image"></div>' +
                '<div class="im_edit_icon im_edit_icon_voice ' + (is_weixin ? 'device_wechat' : '') + '" data-tool="voice"></div>' +
                '<div class="im_edit_icon im_edit_icon_setting" data-tool="setting"></div>' +
            '</div>' +
            '<div class="im_edit_tool_container">' +
                '<div class="im_edit_tool im_edit_tool_intro" data-tool="intro">简介' +
                '</div>' +
                '<div class="im_edit_tool im_edit_tool_face" data-tool="face">' +
                    '<div class="tool_face_packs_wrap">' +
                        '<div class="tool_face_packs">' +
                            '<div class="tool_face_pack active" data-face-pack="facebook" style="background-image:url(http://img.plancats.com/face_fb_1.png?imageView2/1/w/100/h/100)"></div>' +
                            '<div class="tool_face_pack" data-face-pack="telegram" style="background-image:url(http://img.plancats.com/face_tg_1.png?imageView2/2/h/100)"></div>' +
                        '</div>' +
                        '<div class="tool_face_packs_border"></div>' +
                    '</div>' +
                    '<div class="tool_face_wrap">'

var html_face_items = '<div class="tool_face clearfix" data-face-pack="facebook" style="display: block;">'
for (var i = 1; i <= 32; i++) {
    var face_url = 'http://img.plancats.com/face_fb_' + i + '.png?imageView2/1/w/100/h/100'
    var face_id = 'face_fb_' + i
    html_face_items +=
        '<div class="tool_face_item" data-face-id="' + face_id + '" ' + 'data-face-url="' + face_url+ '" style="background-image:url(' + face_url + ')"></div>'
}
html_face_items += '</div>'
html += html_face_items

var html_face_items = '<div class="tool_face clearfix" data-face-pack="telegram">'
for (var i = 1; i <= 32; i++) {
    var face_url = 'http://img.plancats.com/face_tg_' + i + '.png?imageView2/2/h/100'
    var face_id = 'face_tg_' + i
    html_face_items +=
        '<div class="tool_face_item" data-face-id="' + face_id + '" ' + 'data-face-url="' + face_url  + '" style="background-image:url(' + face_url + ')"></div>'
}
html_face_items += '</div>'
html += html_face_items


html +=             '</div>' +
                '</div>' +
                '<div class="im_edit_tool im_edit_tool_image" data-tool="image" style="display: none;">' +
                    '<div class="tool_image_btns clearfix">' +
                        '<div class="tool_image_btn_wrap">' +
                            '<div class="tool_image_btn" data-name="image" style="background-image:url(http://img.plancats.com/camera_gray.svg);"></div>' +
                            '<div class="tool_image_btn_text">照片</div>' +
                        '</div>' +
                        '<div class="tool_image_btn_wrap">' +
                            '<div class="tool_image_btn" data-name="panorama" style="background-image:url(http://img.plancats.com/panorama_gray.svg);"></div>' +
                            '<div class="tool_image_btn_text">全景</div>' +
                        '</div>' +
                        '<div class="tool_image_btn_wrap">' +
                            '<div class="tool_image_btn" data-name="short_video" style="background-image:url(' + ((HOME_FILE_APPS.indexOf('short_video') !== -1) ? 'http://img.plancats.com/video_30s_action.svg' : 'http://img.plancats.com/video_30s_ready.svg') + ');background-position: center center;background-size: auto 32px;"></div>' +
                            '<div class="tool_image_btn_text">小视频</div>' +
                        '</div>' +
                        '<div class="tool_image_btn_wrap">' +
                            '<div class="tool_image_btn" data-name="video" style="background-image:url(' + ((HOME_FILE_APPS.indexOf('video') !== -1) ? 'http://img.plancats.com/video_action.svg' : 'http://img.plancats.com/video_ready.svg') + ');"></div>' +
                            '<div class="tool_image_btn_text">视频</div>' +
                        '</div>' +
                    '</div>' +
                    '<div class="tool_image_upload" style="display: none;">' +
                        '<div class="upload_image_items">' +
                            //<div class="upload_image_item" data-index="1"><div class="upload_image_index">1/5</div><div class="upload_image_progress"><span class="upload_image_progress_circle">78%</span></div><div class="upload_image_cancel"></div></div class="upload_image_success"></div></div>
                        '</div>' +
                    '</div>' +
                '</div>' +
                '<div class="im_edit_tool im_edit_tool_voice ' + (is_weixin ? 'device_wechat' : '') + '" data-tool="voice">' +
                    '<button class="wx_record_mode_btn ' + device_now + ' active" id="wx_record_mode_single" style="left: 12px;bottom: 30px;">单次</button>' +
                    '<button class="wx_record_mode_btn ' + device_now + '" id="wx_record_mode_continue" style="left: 66px;bottom: 30px;">连续</button>' +
                    '<button class="wx_record_mode_btn ' + device_now + ' active" id="wx_record_mode_lan_zh" style="left: 12px;bottom: 3px;">中文</button>' +
                    '<button class="wx_record_mode_btn ' + device_now + '" id="wx_record_mode_lan_en" style="left: 66px;bottom: 3px;">EN</button>' +
                    '<div class="wx_record_timer">60s</div>' +
                    '<div class="wx_record_control">' +
                        '<div class="wx_record_ring"></div>' +
                        '<div class="wx_record_start" id="wx_record_start" style="display:block;"></div>' +
                        '<div class="wx_record_stop" id="wx_record_stop"></div>' +
                        '<div class="wx_record_upload" id="wx_record_upload"></div>' +
                    '</div>' +
                    '<div class="wx_record_cancel_wrap">' +
                        '<span class="wx_record_cancel" id="wx_record_cancel"></span>' +
                        '<br><span class="wx_record_cancel_info">取消</span>'+
                    '</div>' +
                    '<div class="wx_record_info">开始录音</div>'+
                '</div>' +
                '<div class="im_edit_tool im_edit_tool_setting" data-tool="setting">' +
                    '<div class="tool_setting_volume">' +
                        '<div class="tool_setting_volume_icon"></div>' +
                        '<div class="tool_setting_volume_control">' +
                            '<div class="tool_setting_volume_bar">' +
                                '<div class="tool_setting_volume_progress" style="width: 100%;"></div>' +
                                '<div class="tool_setting_volume_dot" style="left: 100%;"></div>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
            '</div>' +
        '</div>' +
    '</div>' +
    '<div class="pop_card_cover">' +
        '<div class="pop_card_wrap">' +
            '<div class="pop_card"></div>' +
        '</div>' +
    '</div>'+
    '<div class="pop_card_cancel"></div>'+
    '<div style="display:none">'+
        '<input type="file" id="img_add_upload"   accept="image/*" multiple>'+
        '<input type="file" id="video_add_upload" accept="video/*" >'+
        '<input type="file" id="videos_add_upload" accept="video/*" capture="camcorder">'+
        '<video id="" poster="" controls="controls" class="video_tool_base" preload="metadata" x-webkit-airplay="true" x5-video-player-type="h5" webkit-playsinline playsinline x5-video-player-fullscreen="true" src="" style="width:100%;height:100%;">'+
        '<img src="/static/img/tools/error_img_0.png">' +
        '<img src="/static/img/tools/error_img_1.png">' +
    '</div>'

$body.append(html)

$("body").on("click",".im_title",function(e){
    var roomId = targetRoomId;
    var scrollTop_now = $('.room[data-room-id=' + roomId + ']>.im_room_scroll').scrollTop()
    if (scrollTop_now){
        scrollTop_aim = scrollTop_now - 1000;
        if (scrollTop_aim<=0){
            scrollTop_aim = 0
        }
        $('.room[data-room-id=' + roomId + ']>.im_room_scroll').stop().animate({"scrollTop":scrollTop_aim})
    }
});

var $chatHeads = $('.im_chat_heads')
var $logo = $('.im_logo')
var $imBox = $('.im_box')
var $baseInput = $('.im_edit_base')
var $cover = $('.cover')
var $rooms = $('.im_rooms')
var $baseInputEdit = $('.im_edit_input_text')
var $msgContent = $('.im_edit_content')
var $sendMsg = $('.im_edit_icon_send')
var $chatName = $('.im_chat_name')
var $chatResize = $('.im_chat_icon_resize')
var $roomArrow = $('.im_room_icon_arrow')

$rooms.on("touchstart",".room>.im_room_scroll",function(e){
    var el_now = this
    var scrollTop = el_now.scrollTop;
    if(scrollTop==0){
        el_now.scrollTop = 1;
    }
    if(el_now.scrollTop+el_now.offsetHeight==el_now.scrollHeight){
        el_now.scrollTop = (parseInt(el_now.scrollHeight)-parseInt(el_now.offsetHeight)-1);
    }
})


if (device_now === 'device_iphone') {
    $imBox.css({'height': (h - 80) + 'px'})
    $(".im_menu").css({'height': (h - 80) + 'px'})
    $(".style_help").remove()
    $("body").append('<div class="style_help"><style>.im_chat_head,.im_logo {top: initial;bottom: ' + (h - 30) + 'px;}</style></div>')
}


// 预设的一些置顶
if (USER_ID=="f0d75199ce334fdaa2091df00a9e087b"||USER_ID=="0cd8429c1da249b6935d7eef72d7fc0b"){
var base_room_ids = [
    [initialRoomId,initialRoomImg,initialRoomName],
    ['4e0cba4bd4cc4c3298ecf428c1e73519', 'http://wx.qlogo.cn/mmopen/viasnlibZqap4GwK7ua20icUVLcTas3GFia5lLleaYmTsgnO1Aj3icibMwY9UlSoeD1Smur9yUIPNSTbOWfuUYQvjm8TuXzgY7Wia54/0', 'Helen小布熊の留言板'],
['f0d75199ce334fdaa2091df00a9e087b','http://wx.qlogo.cn/mmopen/4VDPBNIayEP90PhUgfC4rHjluUAF2s9OJibOOEblfAAbppueKldkE4bicfqyZ9zTibGE10GUA1nmxsfOSSZx2jDqbvOS4Cnj9cB/0','庆岩の备忘录'],
]
}else{
var base_room_ids = [
    [initialRoomId,initialRoomImg,initialRoomName],
    ['4e0cba4bd4cc4c3298ecf428c1e73519', 'http://wx.qlogo.cn/mmopen/viasnlibZqap4GwK7ua20icUVLcTas3GFia5lLleaYmTsgnO1Aj3icibMwY9UlSoeD1Smur9yUIPNSTbOWfuUYQvjm8TuXzgY7Wia54/0', 'Helen小布熊の留言板'],
]
}
var base_room_ids_top =[initialRoomId];

function base_line_div_create (){
    var base_line, _i, _len;
    base_line_div = document.createElement("div");
    base_line_div.className = "im_room_items_top";
    for (_i = 0, _len = base_room_ids.length; _i < _len; _i++) {
      base_line = base_room_ids[_i];
      $(base_line_div).append(
        "<div class=\"im_room_item\" data-room-id=\"" + base_line[0] + "\" data-time=\"" + 0 + "\">" +
            "<div class=\"im_room_item_headimg\" data-image=\""+base_line[1]+"\" style=\"background-image:url(" + base_line[1] + ")\"></div>" +
            "<div class=\"im_room_item_nickname\">" + base_line[2] + "</div>" +
            "<div class=\"im_room_item_latest_msg\">最近木有啥消息嘿</div>" +
            "<div class=\"im_room_item_latest_time\">刚刚</div>" +
        "</div>");
    }
    $(".im_menu_content[data-tab='home']").append("<div class=\"im_menu_line_title\"><span>置顶</span></div>")
    $(".im_menu_content[data-tab='home']").append(base_line_div);
}


function chat_all_load(){
    $(".im_room_items_all").remove()
    chat_all_list_div = document.createElement("div");
    chat_all_list_div.className = "im_room_items_all";
    $.ajax({
        url: '/api/chat/chat_all_list',
        type: 'POST',
        dataType: 'json',
        data: {
          "app": WX_APP,
        },
        success: function(data) {
            members_json_now = members_json
            members_json_new = data.members
            members_json = $.extend({}, members_json_now,members_json_new)
            var chat_line, _i, _len;
            var chats = data.chats
            for (_i = 0, _len = chats.length; _i < _len; _i++) {
                chat_line = chats[_len - _i -1];
                console.log("====== 开始一次对话加载 =====")
                console.log(chat_line)
                data_image_user_id = USER_ID
                if(chat_line[1]["type"]=="chat"){
                    var editors = chat_line[1]["editors"];
                    editors.pop(USER_ID);
                    if (editors.length==1){
                        data_image_user_id = editors[0]
                    }
                }
                if(chat_line[1]["type"]=="chat"){
                    var members = chat_line[1]["comment_members"];
                    if (members.length == 1){
                        data_image_user_id = members[0]
                    }else if (members.length == 2){
                        if(members[0]==USER_ID){
                            data_image_user_id = members[1]
                        }else{
                            data_image_user_id = members[0]
                        }
                    }
                }
                console.log(members)
                console.log(editors)
                console.log(data_image_user_id)
                data_image = members_json[data_image_user_id]["headimgurl"]
                nickname = members_json[data_image_user_id]["nickname"]

                var roomId = chat_line[0]
                var imgUrl = members_json[data_image_user_id]["headimgurl"]
                var roomName = members_json[data_image_user_id]["nickname"]
                var time_now = ((new Date()).getTime()/1000)
                if (base_room_ids_top.indexOf(roomId)>=0){
                    continue;
                }
                rooms_info[roomId] = {
                    "imgUrl": imgUrl,
                    "roomName": roomName,
                    "createtime": time_now,
                    "finishtime": 0,
                    "room_time_flag": time_now,
                    "createuser":"",
                    "finishuser":"",
                    "createcommentsequence":"",
                    "finishcommentsequence":"",
                    "latestComment": "",
                    "last_comment_id": "",
                    "roomNewMsgCount": 0,
                }

                $(chat_all_list_div).prepend(
                "<div class=\"im_room_item\" data-room-id=\"" + roomId + "\" data-time=\"" + 0 + "\">" +
                    "<div class=\"im_room_item_headimg\" data-image=\""+imgUrl+"\" style=\"background-image:url(" + imgUrl + ")\"></div>" +
                    "<div class=\"im_room_item_nickname\">" + roomName + "</div>" +
                    "<div class=\"im_room_item_latest_msg\">最近木有啥消息嘿</div>" +
                    "<div class=\"im_room_item_latest_time\">刚刚</div>" +
                "</div>");
                console.log("====== 结束一次对话加载 =====")
                // createConversation(roomId)
                // // 选择 room
                // $('.room').hide()
                // $('.room[data-room-id=' + targetRoomId + ']').show()
            }
            $(".im_menu_content[data-tab='home']").append(chat_all_list_div);
        },
        error: function(error) {
            $(".im_menu_content[data-tab='home']").append(chat_all_list_div);
        }
      });
}
function chat_notify_load(){
    $(".im_room_items_all").remove()
    chat_notify_list_div = document.createElement("div");
    chat_notify_list_div.className = "im_room_items_notify";
    $.ajax({
        url: '/api/chat/chat_notify_list',
        type: 'POST',
        dataType: 'json',
        data: {
          "app": WX_APP,
        },
        success: function(data) {
            members_json_now = members_json
            members_json_new = data.members
            members_json = $.extend({}, members_json_now,members_json_new)
            console.log(members_json)
            var chat_line, _i, _len;
            var chats = data.chats
            for (_i = 0, _len = chats.length; _i < _len; _i++) {
                chat_line = chats[_len - _i -1];
                console.log(chat_line)
                data_image_user_id = USER_ID
                if(chat_line[1]["type"]=="chat"){
                    var editors = chat_line[1]["editors"];
                    editors.pop(USER_ID);
                    if (editors.length==1){
                        data_image_user_id = editors[0]
                    }
                }
                console.log(editors)
                console.log(data_image_user_id)
                data_image = members_json[data_image_user_id]["headimgurl"]
                nickname = members_json[data_image_user_id]["nickname"]

                var roomId = chat_line[0]
                var imgUrl = members_json[data_image_user_id]["headimgurl"]
                var roomName = members_json[data_image_user_id]["nickname"]
                var time_now = ((new Date()).getTime()/1000)
                rooms_info[roomId] = {
                    "imgUrl": imgUrl,
                    "roomName": roomName,
                    "createtime": time_now,
                    "finishtime": 0,
                    "room_time_flag": time_now,
                    "createuser":"",
                    "finishuser":"",
                    "createcommentsequence":"",
                    "finishcommentsequence":"",
                    "latestComment": "",
                    "last_comment_id": "",
                    "roomNewMsgCount": 0,
                }

                $(chat_notify_list_div).prepend(
                "<div class=\"im_room_item\" data-room-id=\"" + roomId + "\" data-time=\"" + 0 + "\">" +
                    "<div class=\"im_room_item_headimg\" data-image=\""+imgUrl+"\" style=\"background-image:url(" + imgUrl + ")\"></div>" +
                    "<div class=\"im_room_item_nickname\">" + roomName + "</div>" +
                    "<div class=\"im_room_item_latest_msg\">最近木有啥消息嘿</div>" +
                    "<div class=\"im_room_item_latest_time\">刚刚</div>" +
                "</div>");
                // createConversation(roomId)
                // // 选择 room
                // $('.room').hide()
                // $('.room[data-room-id=' + targetRoomId + ']').show()
            }
            $(".im_menu_content[data-tab='home']").append("<div class=\"im_menu_line_title\"><span>通知</span></div>")
            $(".im_menu_content[data-tab='home']").append(chat_notify_list_div);
        },
        error: function(error) {
            $(".im_menu_content[data-tab='home']").append("<div class=\"im_menu_line_title\"><span>通知</span></div>")
            $(".im_menu_content[data-tab='home']").append(chat_notify_list_div);
        }
      });
}

/*
 * 初始化 ws 连接
 */
var ws = null
ws_type_noactions = ["LEAVE","RELOAD","VVPLAY"]
var ws_aim_id_base = initialRoomId
function ws_run(){
    if(window.location.protocol === "https:"){
        ws = new WebSocket('wss://www.hotpoor.org/ws?aim_id='+ws_aim_id_base)
    }else{
    // ws = new WebSocket('ws://www.hotpoor.org:8026/ws?aim_id=' + initialRoomId)
        ws = new WebSocket('ws://www.hotpoor.org:8026/ws?aim_id='+ws_aim_id_base)
    }
    ws.onopen = function (e) {
        for (index in base_room_ids) {
            console.log(index)
            var base_room = base_room_ids[index]
            var roomId = base_room[0]
            var imgUrl = base_room[1]
            var roomName = base_room[2]
            targetRoomId = roomId
            var time_now = ((new Date()).getTime()/1000)
            rooms_info[roomId] = {
                "imgUrl": imgUrl,
                "roomName": roomName,
                "createtime": time_now,
                "finishtime": 0,
                "room_time_flag": time_now,
                "createuser":"",
                "finishuser":"",
                "createcommentsequence":"",
                "finishcommentsequence":"",
                "latestComment": "",
                "last_comment_id": "",
                "roomNewMsgCount": 0,
            }
            createConversation(roomId)
            // 选择 room
            $('.room').hide()
            $('.room[data-room-id=' + targetRoomId + ']').show()
        }

        $chatName.text(rooms_info[targetRoomId].roomName)
        var index = latestRoomIds.indexOf(targetRoomId)
        var offset = r * (2 * index + 1) + 5 * (index + 1)
        $roomArrow.css({ 'right': offset + 'px' })
        //secretSubmitComment("HVVPLAY//VVPLAY","0cd8429c1da249b6935d7eef72d7fc0b");
    }
    ws.onmessage = function (e) {
        var msg = JSON.parse(e.data)
        if (ws_type_noactions.indexOf(msg[0]) == -1) {
            if(typeof(ADDMESSAGE_PLUS) == "undefined"){
                addMessage(msg)
            }else{
                ADDMESSAGE_PLUS_ACTION(msg)
            }
        }else{
            if(msg[0]=="RELOAD"){
                window.location.href= window.location.href+"&time="+(Math.random()*100)
            }
        }
    }
    ws.onclose = function (e) {
        console.log('ws close')
        ws_run()
    }
    ws.onerror = function (e) {
        console.log('ws error')
    }
}
// ws_run()
chat_user_check_ids = ["0cd8429c1da249b6935d7eef72d7fc0b"]
function chat_user_check_id (_chat_user_check_id){
    $.ajax({
        url: '/api/chat/chat_user_check',
        type: 'POST',
        dataType: 'json',
        data: {
          "aim_id": _chat_user_check_id,
          "aim_type": "user",
          "app": "hotpoor"
        },
        success: function(data) {
            if (data.info == "ok"){
                var _arr = [data.chat_id, 'http://wx.qlogo.cn/mmopen/srPhFAq751Ih4TJNFR6af7w8BYEtSqqzqeMY7iaxtOAPgZGibt0Wpq5J5nrKqUEF05w4HibmT2UmGMR83UCSWXeHKX2F67zibhicN/0', '金牌客服·夏力维']
                base_room_ids.push(_arr);
                base_room_ids_top.push(data.chat_id);
                base_line_div_create()
                chat_all_load()
                //chat_notify_load()
                ws_run()
            }       
        },
        error: function(error) {
            
        }
    });
}
chat_user_check_id(chat_user_check_ids[0])

$("body").on("click",".im_room_item",function(e){
    isLogo = false
    $imMenu.hide()
    $imBox.show()
    var roomId = $(this).attr("data-room-id")
    if (latestRoomIds.indexOf(roomId) !== -1) {
        onClickSwitch(roomId)
    } else {
        targetRoomId = roomId
        // createConversation($(this).attr("data-room-id"),$(this).children(".im_room_item_headimg").attr("data-image"),$(this).children(".im_room_item_nickname").text())
        console.info(rooms_info[$(this).attr("data-room-id")])
        createConversation($(this).attr("data-room-id"))
        // 选择 room
        $('.room').hide()
        $('.room[data-room-id=' + targetRoomId + ']').show()

        $chatName.text(rooms_info[targetRoomId].roomName)
        var index = latestRoomIds.indexOf(targetRoomId)
        var offset = r * (2 * index + 1) + 5 * (index + 1)
        $roomArrow.css({ 'right': offset + 'px' })
    }

    setTimeout(function () {
        roomScrollToBottom(roomId)
    }, timeout_rooms_show_plus)
})

function joinMoreRooms (roomIds) {
    var msg = ['JOINMOREROOMS', {}, ws_aim_id_base, roomIds]
    ws.send(JSON.stringify(msg))
}

function addMessage (msg) {
    var msgType = msg[0]
    var roomId = msg[2]
    var content = msg[1].content
    content = escapeHTML(content)
    content = content.replace(/\n/g, '<br>')

    var destination = msg[1].destination
    if (destination == undefined){

    }else{
        destination = escapeHTML(destination)
        destination = destination.replace(/\n/g, '<br>')
    }
    var headimg = msg[1].headimgurl
    var nickname = msg[1].nickname
    var timer = msg[1].time
    var time = formatDate(timer)
    var user_id = msg[1].user_id
    var tel = msg[1].tel
    var comment_id = msg[1].comment_id
    var comment_sequence = msg[1].sequence

    var content_type = content.split("//")[0]
    var content_values = content.split("//")[1]

    var msg_owner = (user_id === USER_ID) ? 'msg_self' : 'msg_other'

    var msg_headimg_hide = ""
    var msg_nickname_hide = ""
    if (rooms_info[roomId] == undefined){
        rooms_info[roomId] = {
            "imgUrl": "",
            "roomName": "",
            "createtime": timer,
            "finishtime": 0,
            "room_time_flag": timer,
            "createuser":"",
            "finishuser":"",
            "createcommentsequence":"",
            "finishcommentsequence":"",
            "roomNewMsgCount": 0,
        }
    }
    if(timer - rooms_info[roomId].finishtime <= 300){
        var msg_time_hide = "msg_time_hide"
        if (rooms_info[roomId].finishcard){
            console.log("上一张是卡片")
        }else{
            if (rooms_info[roomId].finishuser == user_id) {
                msg_headimg_hide = "msg_headimg_hide"
                msg_nickname_hide = "msg_nickname_hide"
            }
        }
    }else{
        var msg_time_hide = ""
    }
    var msg_weixin = ""
    if (msgType === 'COMMENT' && content_type === 'HWEIXINTEXT') {
        msg_headimg_hide = "msg_headimg_hide"
        msg_nickname_hide = "msg_nickname_hide"
        msg_weixin = "msg_weixin"
    }
    var msg_cards_place = ["msg_weixin"]
    rooms_info[roomId].finishtime = timer
    rooms_info[roomId].finishuser = user_id
    rooms_info[roomId].finishcommentsequence = comment_id+"_"+comment_sequence
    rooms_info[roomId].finishcard = false
    if (msg_weixin.indexOf(msg_cards_place)>=0){
        rooms_info[roomId].finishcard = true
        rooms_info[roomId].finishuser = "card_place"
    }
    var msg_html =
        '<div class="msg_time '+msg_time_hide+'" data-time="'+timer+'">' + time + '</div>' +
        '<div data-comment-flag="' + comment_id + '_' + comment_sequence + '" class="msg ' + msg_owner + ' ' + device_now + '">' +
            '<div class="msg_headimg '+msg_headimg_hide+'" style="background-image:url(' + headimg + ')"></div>' +
            '<div class="msg_nickname '+msg_nickname_hide+'">' + nickname + '</div>' +
            '<div class="msg_content_wrapper '+msg_weixin+'">' +
                '#{msg_content_html}' + // 不同 msgType 有不同的 HTML 片段
            '</div>' +
        '</div>'
    var msg_content_html = ''
    var error_img = "/static/img/tools/error_img_"+parseInt(Math.random()*10%2)+".png"
    // 评论 COMMENT
    if (msgType === 'COMMENT') {
        content_values = content.split(content_type+"//")[1]
        if (content_type === 'HRELOAD'){
            window.reload()
            return
        }
        if (content_type === 'HFORGE') {
            if(content_values.indexOf("urn")>=0){

            }else if (content_values.indexOf("move")>=0){

            }
        }
        if(content_type=="HVVPLAY"){
            console.log("hvvplay")
            $("#v_v")[0].play();
        }
        if (content_type === 'videoplay'){
            $("#video_here")[0].play();
        }
        if (content_type === 'HWEBFACEIMG') {
            var face_url = decodeURIComponent(content_values)
            msg_content_html =
                '<span class="msg_content face">' +
                    '<div class="msg_face_wrap" data-face-url="' + face_url + '">' +
                        '<img crossorigin="Anonymous" class="msg_face" src="' + face_url + '"  onerror="this.src=\''+error_img+'\'">' +
                    '</div>' +
                '</span>'
        } else if (content_type === 'HWEBIMG') {
            // 外链图片
            // console.log(content_values)
            var url = decodeURIComponent(content_values)
            // console.log(url)
            var thumbnail_url = url+""
            msg_content_html = 
                '<span class="msg_content msg_image">' +
                    '<div class="msg_image_thumbnail_wrap clearfix" data-url="' + url + '">' +
                        '<img crossorigin="Anonymous" class="msg_image_thumbnail" src="' + thumbnail_url + '" onerror="this.src=\''+error_img+'\'">' +
                    '</div>' +
                    '<button class="baidu_ai_action_btn" data-value="general_basic" data-url="'+thumbnail_url+'?imageView2/2/w/500">通用文字识别</button>'+
                    '<button class="baidu_ai_action_btn" data-value="form_ocr" data-url="'+thumbnail_url+'?imageView2/2/w/1000">表格识别</button>'+
                    '<button class="baidu_ai_action_btn" data-value="business_license" data-url="'+thumbnail_url+'?imageView2/2/w/500">营业执照识别</button>'+
                    '<button class="baidu_ai_action_btn" data-value="idcard" data-url="'+thumbnail_url+'?imageView2/2/w/500" data-id-card-side="front">身份证正面</button>'+
                    '<button class="baidu_ai_action_btn" data-value="idcard" data-url="'+thumbnail_url+'?imageView2/2/w/500" data-id-card-side="back">身份证反面</button>'+
                    '<br><button class="baidu_ai_action_btn" data-value="form_ocr" data-url="'+thumbnail_url+'?imageView2/2/w/1000">表格识别</button>'+
                    '<br><button class="baidu_ai_action_btn" data-value="form_ocr_plus" data-type="json" data-url="'+thumbnail_url+'?imageView2/2/w/1000">输出JSON</button>'+
                    '<br><button class="baidu_ai_action_btn" data-value="form_ocr_plus" data-type="excel" data-url="'+thumbnail_url+'?imageView2/2/w/1000">输出EXCEL</button>'+
                '</span>'
            
        } else if (content_type === 'HWEBPANORAMA') {
            // 外链全景图片
            // console.log(content_values)
            var url = decodeURIComponent(content_values)
            // console.log(url)
            var thumbnail_url = url+""
            msg_content_html = 
                '<span class="msg_content msg_panorama">' +
                    '<div class="msg_panorama_thumbnail_wrap clearfix" data-url="' + url + '">' +
                        '<img crossorigin="Anonymous" class="msg_panorama_thumbnail" src="' + thumbnail_url + '" onerror="this.src=\''+error_img+'\'">' +
                    '</div>' +
                '</span>'
        } else if (content_type === 'HQWEBIMG') {
            // 图片
            var md5 = content_values
            // $(".msg_self.image_wait[data-md5='"+md5+"']").fadeOut(500,function(){
            //     $(".msg_self.image_wait[data-md5='"+md5+"']").remove()
            // })
            removeWaitingMessage(roomId, 'image', md5)
            // console.log(content_values)
            var url = decodeURIComponent("http://image.hotpoor.org/"+roomId+"_"+content_values)
            // console.log(url)
            var thumbnail_url = url+""
            msg_content_html = 
                '<span class="msg_content msg_image">' +
                    '<div class="msg_image_thumbnail_wrap clearfix" data-url="' + url + '">' +
                        '<img crossorigin="Anonymous" class="msg_image_thumbnail" src="' + thumbnail_url + '?imageView2/2/w/300" onerror="this.src=\''+error_img+'\'">' +
                    '</div>' +
                    '<button class="baidu_ai_action_btn" data-value="general_basic" data-url="'+thumbnail_url+'?imageView2/2/w/500">通用文字识别</button>'+
                    '<button class="baidu_ai_action_btn" data-value="form_ocr" data-url="'+thumbnail_url+'?imageView2/2/w/1000">表格识别</button>'+
                    '<button class="baidu_ai_action_btn" data-value="business_license" data-url="'+thumbnail_url+'?imageView2/2/w/500">营业执照识别</button>'+
                    '<button class="baidu_ai_action_btn" data-value="idcard" data-url="'+thumbnail_url+'?imageView2/2/w/500" data-id-card-side="front">身份证正面</button>'+
                    '<button class="baidu_ai_action_btn" data-value="idcard" data-url="'+thumbnail_url+'?imageView2/2/w/500" data-id-card-side="back">身份证反面</button>'+
                    '<br><button class="baidu_ai_action_btn" data-value="form_ocr" data-url="'+thumbnail_url+'?imageView2/2/w/1000">表格识别</button>'+
                    '<br><button class="baidu_ai_action_btn" data-value="form_ocr_plus" data-type="json" data-url="'+thumbnail_url+'?imageView2/2/w/1000">输出JSON</button>'+
                    '<br><button class="baidu_ai_action_btn" data-value="form_ocr_plus" data-type="excel" data-url="'+thumbnail_url+'?imageView2/2/w/1000">输出EXCEL</button>'+
                '</span>'
        } else if (content_type === 'HQWEBPANORAMA') {
            var md5 = content_values
            // $(".msg_self.image_wait[data-md5='"+md5+"']").fadeOut(500,function(){
            //     $(".msg_self.image_wait[data-md5='"+md5+"']").remove()
            // })
            removeWaitingMessage(roomId, 'panorama', md5)
            // console.log(content_values)
            var url = decodeURIComponent("http://image.hotpoor.org/"+roomId+"_"+content_values)
            // console.log(url)
            var thumbnail_url = url+""
            msg_content_html = 
                '<span class="msg_content msg_panorama">' +
                    '<div class="msg_panorama_thumbnail_wrap clearfix" data-url="' + url + '">' +
                        '<img crossorigin="Anonymous" class="msg_panorama_thumbnail" src="' + thumbnail_url + '?imageView2/2/w/300" onerror="this.src=\''+error_img+'\'">' +
                    '</div>' +
                '</span>'
        } else if (content_type === 'HQWEBVIDEO') {
            var md5 = content_values
            removeWaitingMessage(roomId, 'video', md5)
            // 图片
            // console.log(content_values)
            var url = decodeURIComponent("http://video.hotpoor.org/"+roomId+"_"+content_values)
            // console.log(url)
            var thumbnail_url = url+""
            var base_id = parseInt(timer)+"_"+content_values
            var video_id = 'video_'+parseInt(timer)+"_"+content_values
            var img_id = 'img_'+parseInt(timer)+"_"+content_values
            var canvas_id = 'canvas_'+parseInt(timer)+"_"+content_values
            if (device_now=="device_android"&&is_weixin){
                msg_content_html =
                    '<span class="msg_content msg_video">' +
                        '<div class="msg_video_thumbnail_wrap clearfix" data-url="' + url + '">' +
                            '<div class="video_cover" style="position: absolute; z-index: 1; top: 0px; left: 0px; width: 100%; height: 100%;">' +
                                '<img src="http://img.plancats.com/video_play_white.svg" style="position: absolute;z-index: 2;left: 50%;top: 50%;width: 100px;height: 100px;margin-left: -50px;margin-top: -50px;">' +
                            '</div>' +
                            '<img id="'+img_id+'" src="'+url+'?vframe/jpg/offset/0/"'+' style="width:100%;height:auto;" onerror="this.src=\''+error_img+'\'">'+
                            '<canvas id="'+canvas_id+'" class="msg_video_thumbnail" onclick="videoPlay(\''+base_id+'\',\''+url+'\')" style="position:absolute;left:0px;top:0px;"></canvas>'+
                        '</div>' +
                    '</span>'
            }else{
                msg_content_html = 
                    '<span class="msg_content msg_video">' +
                        '<div class="msg_video_thumbnail_wrap clearfix" data-url="' + url + '">' +
                            '<div class="video_cover" style="position: absolute; z-index: 1; top: 0px; left: 0px; width: 100%; height: 100%;">' +
                                '<img src="http://img.plancats.com/video_play_white.svg" style="position: absolute;z-index: 2;left: 50%;top: 50%;width: 100px;height: 100px;margin-left: -50px;margin-top: -50px;">' +
                            '</div>' +
                            '<video id="'+video_id+'" poster="'+url+'?vframe/jpg/offset/0/" class="msg_video_thumbnail" preload="metadata" x-webkit-airplay="true" x5-video-player-type="h5" webkit-playsinline playsinline x5-video-player-fullscreen="true" data-src="' + thumbnail_url + '" style="display:inline;"></video>' +
                            // '<canvas id="'+canvas_id+'" class="msg_video_thumbnail" onclick="videoPlay(\''+base_id+'\')"></canvas>'+
                        '</div>' +
                    '</span>'
            }
        }else if (content_type === 'HWEIXINTEXT') {
            msg_content_html = '<span class="msg_content msg_content_weixintext">' + '<b>微信公众号留言</b><br>留言内容: '+content_values +'<br>留言时间: '+time+ '</span>'
        }else {
            msg_content_html = '<span class="msg_content">' + content + '</span>'
        }
        msg_html = msg_html.replace('#{msg_content_html}', msg_content_html)
        $('.room[data-room-id=' + roomId + ']').find(".room_card").append(msg_html)
    
    // 语音 AUDIO
    } else if (msgType === 'AUDIO') {
        if (content_type === 'HQAUDIO') {
            var audio_src = "http://audio.hotpoor.org/" + roomId + "_" + user_id + "_" + content_values.split(",")[0]
            var audio_length = parseInt(content_values.split(",")[1]) + "\'\'"
            var audio_media_id = content_values.split(",")[2]
            // $(".msg_self.audio_wait[data-media='"+audio_media_id+"']").fadeOut(500,function(){
                $(".msg_self.audio_wait[data-media='"+audio_media_id+"']").remove()
            // })
        } else {
            var audio_src = ""
            var audio_length = "错误"
        }

        msg_content_html = 
            '<span class="msg_content audio" data-type="audio" data-audio-src="' + audio_src + '">' +
                '<div class="msg_audio">' +
                    '<span class="msg_audio_btn"></span>' +
                    '<span class="msg_audio_line"></span>' +
                    '<span class="msg_audio_time">' + audio_length + '</span>' +
                '</div>' +
                '<div class="msg_audio_cover"></div>' +
            '</span>'
        msg_html = msg_html.replace('#{msg_content_html}', msg_content_html)
        $('.room[data-room-id=' + roomId + ']').find(".room_card").append(msg_html)

    // 语音转文字 AUDIOCAPTION
    } else if (msgType === 'AUDIOCAPTION') {
        content = content.split("百度语音转文字: ")[1]
        destination = destination.split("百度语音翻译: ")[1]
        var audiocaption_logo = "http://img.plancats.com/baidu_speech.png"
        var msg_audio_caption_html =
            '<br>' +
            '<span class="msg_content audiocaption" style="font-style:italic;">' + content +
                '<br>' +
                destination +
                // '<br>' +
                // '<div style="margin-top: 4px;height: 20px;padding-top: 5px;box-shadow: 0px -1px 0px rgba(255,255,255,0.6);">' +
                //     '<img src="' + audiocaption_logo + '" style="height: 16px;border-radius: 2px;">' +
                // '</div>' +
            '</span>'+
            ''+
            '<br>'+
            //'<span><div class="blockchain_btn ibm_invoke" data-user-id="'+user_id+'" data-comment-target="'+comment_id+'_'+comment_sequence+'">ibm invoke</div>'+
            '<span><div class="blockchain_btn wx_pay_test" data-app="hotpoor" data-value="1" data-order-id="" data-user-id="'+user_id+'" data-comment-target="'+comment_id+'_'+comment_sequence+'">weixin pay</div>'+
            '</span>'
        $('[data-comment-flag="' + comment_id + '_' + comment_sequence + '"]').find('.msg_content_wrapper').append(msg_audio_caption_html)
    } else if (msgType === 'IOTDATA'){
        msg_content_html = '<span class="msg_content">' + content + '</span>'
        msg_html = msg_html.replace('#{msg_content_html}', msg_content_html)
        $('.room[data-room-id=' + roomId + ']').find(".room_card").append(msg_html)
        return
    } else if (msgType === 'LITEOSDEMO') {
        msg_content_html = '<span class="msg_content">' + content + '</span>'
        msg_html = msg_html.replace('#{msg_content_html}', msg_content_html)
        $('.room[data-room-id=' + roomId + ']').find(".room_card").append(msg_html)
        return
    } else if (msgType === 'RADIO'){
        radioEl_list.push(msg[1].src)
        msg_html = '<audio src="'+msg[1].src+'" controls>'
        $('.room[data-room-id=' + roomId + ']').find(".room_card").append(msg_html)
        if (radioEl_list.length>1){

        }else if(radioEl_list.length>0){
            radioEl.src = radioEl_list[0]
        }
        if (web_recorder_now){

        }else{
            radioEl.play()
        }
        return
    } else if (msgType === 'CMDXC'){
        if ($("#CMDXC").val()!="xialiwei"){
            console.log("========")
            console.log("CMDXC")
            console.log("========")
            console.log(msg[1])
            console.log("========")
            return
        }
        xc_value = msg[1].value
        xc_action = msg[1].action

        console.log("========")
        console.log("http://127.0.0.1:8088/api/xc/action")
        console.log("========")
        $.ajax({
            url: 'http://127.0.0.1:8088/api/xc/action',
            type: 'GET',
            dataType: 'json',
            data: {
                "value":xc_value,
                "action":xc_action
            },
            success: function (data) {
                console.log(data);
            },
            error: function (error) {
                console.log(error)
            }
        })
    }else{
        return
    }


    if (msg_owner == "msg_self"){
        // 聊天记录滚动到最底部
        if($("[data-comment-flag='"+comment_id+"_"+comment_sequence+"']").length>=1){
            $('.room[data-room-id=' + roomId + ']>.im_room_scroll').stop().animate({"scrollTop":$("[data-comment-flag='"+comment_id+"_"+comment_sequence+"']")[0].offsetTop})
        }
    } else {
        var targetRoom = $('.room[data-room-id="' + roomId + '"]>.im_room_scroll')[0]
        if (targetRoom.scrollHeight - targetRoom.scrollTop - targetRoom.offsetHeight > 500) {
            rooms_info[roomId].roomNewMsgCount += 1
            setRoomNewMsgTip(roomId, rooms_info[roomId].roomNewMsgCount)
        } else {
            $(targetRoom).stop().animate({
                "scrollTop": targetRoom.scrollHeight - targetRoom.offsetHeight
            })
            // if($("[data-comment-flag='"+comment_id+"_"+comment_sequence+"']").length>=1){
            //     $('.room[data-room-id=' + roomId + ']').stop().animate({"scrollTop":$("[data-comment-flag='"+comment_id+"_"+comment_sequence+"']")[0].offsetTop})
            // }
        }
    }

    members_json[user_id] = {"headimgurl":headimg,"nickname":nickname,"tel": tel}

    if (latestRoomIds.indexOf(roomId) === -1) {
        if (rooms_info[roomId]!=undefined){
            createConversation(roomId)
        }else{
            //TODO rooms_info[roomId] = ...
            createConversation(roomId)
        }
    }
    if (isExpanded) {
        onMessageExpanded(roomId, msg)
    } else {
        onMessageCollapsed(roomId, msg)
    }

    rooms_info[roomId]["latestComment"] = msg
    item_text = ""
    setRoomItemText(msg)
    sortRoomItems()

    if (notify_flag||(!notify_flag&&targetRoomId!=roomId&&isExpanded)){
        notify(nickname,item_text,headimg,roomId)
    }
}

function setRoomItemText (msg) {
    item_text = ""
    if(msg[0]=="AUDIO"){
        item_text = "[语音]"
    }else if (msg[0]=="AUDIOCAPTION"){
        item_text = "[语音·转文字]"+msg[1].content.replace("百度语音转文字: ","")
    }else if(msg[0]=="COMMENT"){
        if(msg[1].content.indexOf("HQWEBIMG//")>=0||msg[1].content.indexOf("HWEBIMG//")>=0){
            item_text = "[图片]"
        }else if(msg[1].content.indexOf("HQWEBPANORAMA//")>=0||msg[1].content.indexOf("HWEBPANORAMA//")>=0){
            item_text = "[全景图片]"
        }else if (msg[1].content.indexOf("HWEBFACEIMG//")>=0){
            item_text = "[表情]"
        }else if (msg[1].content.indexOf("HQWEBVIDEO//")>=0){
            item_text = "[小视频]"
        }else{
            item_text = msg[1].content
        }
    }
    item_text = msg[1].nickname +": "+item_text
    var roomId = msg[2]
    $roomItem = $(".im_room_item[data-room-id='"+roomId+"']")
    $roomItem[0].dataset.time = parseInt(msg[1].time)
    $roomItem.find(".im_room_item_latest_msg").text(item_text)
    $roomItem.find(".im_room_item_latest_time").text(formatDate_plus(msg[1].time))
}

function sortRoomItems (roomId) {
    im_rooms_items = [".im_room_items_top",".im_room_items_all"];
    for (j in im_rooms_items){
        var d = []
        $(im_rooms_items[j]+'>.im_room_item').each(function (i, roomItem) {
            d.push([roomItem, parseInt(roomItem.dataset.time)])
        })
        d = d.sort(function (a, b) { return a[1] - b[1] })
        var len = d.length
        for (var i = 0; i < len; i ++) {
            $(im_rooms_items[j]).prepend(d[i][0])
        }
    }
}


function scrollIntoElement (roomId, el) {
    var $roomEl = $('.room[data-room-id=' + roomId + ']>.im_room_scroll')
    if(typeof(el)!="undefined"){
        $roomEl.stop().animate({
            "scrollTop": el.offsetTop
        })
    }
}

$('body').on('click', '.msg_video_thumbnail_wrap>.video_cover', function (e) {
    var $coverEl = $(e.currentTarget)
    var $el = $coverEl.closest('.msg_video_thumbnail_wrap')
    $coverEl.fadeOut()
    var video = $el.find('video')[0]
    if (video) {
        video.src = video.dataset.src
        video.setAttribute('controls', '')
        video.play()
    } 
    var canvas = $el.find('canvas')[0]
    if (canvas) {
        $(canvas).click()
    }
})


var bLiveVideoTimer = null;
var oLiveVideo = null;
var oLiveCanvas = null;
function videoPlay(id_base,url){
    clearInterval(bLiveVideoTimer)
    var video_id = "video_"+id_base
    $(".video_tool_base").attr("id",video_id)
    $(".video_tool_base").attr("src",url)
    var canvas_id = "canvas_"+id_base
    var img_id = "img_"+id_base
    //获取video
    oLiveVideo=document.getElementById(video_id);
    oLiveImg = document.getElementById(img_id);
    oLiveVideo.pause()
    oLiveVideo.currentTime = 0
    //获取canvas画布
    oLiveCanvas=document.getElementById(canvas_id);
    oLiveCanvas.width = oLiveImg.width
    oLiveCanvas.height = oLiveImg.height;
    console.log(oLiveCanvas.width)
    console.log(oLiveCanvas.height)
    //设置画布
    oLiveCanvas2D = oLiveCanvas.getContext('2d');
    //设置setinterval定时器
    oLiveCanvas2D.clearRect(0,0,oLiveCanvas.width,oLiveCanvas.height);
    //监听播放
    oLiveVideo.addEventListener('play',function() {
        bLiveVideoTimer=setInterval(function() {
            oLiveCanvas2D.clearRect(0,0,oLiveCanvas.width,oLiveCanvas.height);
            oLiveCanvas2D.drawImage(oLiveVideo,0,0,oLiveCanvas.width,oLiveCanvas.height);
        },20);
    },false);
    //监听暂停
    oLiveVideo.addEventListener('pause',function() {
        clearInterval(bLiveVideoTimer);
    },false);
    //监听结束
    oLiveVideo.addEventListener('ended',function() {
        clearInterval(bLiveVideoTimer);
        oLiveVideo.pause()
        oLiveVideo.currentTime = 0
        oLiveCanvas2D.clearRect(0,0,oLiveCanvas.width,oLiveCanvas.height);
        $(oLiveCanvas).siblings('.video_cover').show()
    },false);
    oLiveVideo.play()
}
function loadMessage (msg) {
    var msgType = msg[0]
    var roomId = msg[2]
    var content = msg[1].content
    content = escapeHTML(content)
    content = content.replace(/\n/g, '<br>')
    var headimg = msg[1].headimgurl
    var nickname = msg[1].nickname
    var timer = msg[1].time
    var time = formatDate(timer)
    var user_id = msg[1].user_id
    var tel = msg[1].tel
    var plus = msg[1].plus
    plus_content = escapeHTML(plus.content)
    plus_type = escapeHTML(plus.type)

    if (plus.destination == undefined){
        plus_content_destination = ""
    }else{
        plus_content_destination = escapeHTML(plus.destination)
    }

    if (plus_type == "百度语音转文字"){
        plus_content = plus_content.split("百度语音转文字: ")[1]
        if (plus_content_destination.split("百度语音翻译: ").length==2) {
            plus_content_destination = plus_content_destination.split("百度语音翻译: ")[1]
        }
    }
    var comment_id = msg[1].comment_id
    var comment_sequence = msg[1].sequence

    var content_type = content.split("//")[0]
    var content_values = content.split("//")[1]

    var msg_owner = (user_id === USER_ID) ? 'msg_self' : 'msg_other'


    var msg_headimg_hide = ""
    var msg_nickname_hide = ""
    
    if(rooms_info[roomId].createtime - timer <= 300){
        var msg_time_hide = "msg_time_hide"
        msg_headimg_hide = "msg_headimg_hide"
        msg_nickname_hide = "msg_nickname_hide"
    }else{
        var msg_time_hide = ""   
    }

    var msg_weixin = ""
    if (msgType === 'COMMENT' && content_type === 'HWEIXINTEXT') {
        msg_headimg_hide = "msg_headimg_hide"
        msg_nickname_hide = "msg_nickname_hide"
        msg_weixin = "msg_weixin"
        if (rooms_info[roomId].createuser != "card_place") {
            $(".msg[data-comment-flag='"+rooms_info[roomId].createcommentsequence+"']>.msg_headimg_hide").removeClass("msg_headimg_hide")
            $(".msg[data-comment-flag='"+rooms_info[roomId].createcommentsequence+"']>.msg_nickname_hide").removeClass("msg_nickname_hide")
        }
    }
    if (rooms_info[roomId].createcard){

    }else{
        if (rooms_info[roomId].createuser != user_id) {
            $(".msg[data-comment-flag='"+rooms_info[roomId].createcommentsequence+"']>.msg_headimg_hide").removeClass("msg_headimg_hide")
            $(".msg[data-comment-flag='"+rooms_info[roomId].createcommentsequence+"']>.msg_nickname_hide").removeClass("msg_nickname_hide")
        }
    }

    var msg_cards_place = ["msg_weixin"]
    rooms_info[roomId].createtime = timer
    rooms_info[roomId].createuser = user_id
    rooms_info[roomId].createcommentsequence = comment_id+"_"+comment_sequence
    rooms_info[roomId].createcard = false
    if (msg_weixin.indexOf(msg_cards_place)>=0){
        rooms_info[roomId].createcard = true
        rooms_info[roomId].createuser = "card_place"
    }
    var msg_html =
        '<div class="msg_time '+msg_time_hide+'" data-time="'+timer+'">' + time + '</div>' +
        '<div data-comment-flag="' + comment_id + '_' + comment_sequence + '" class="msg ' + msg_owner + ' ' + device_now + '">' +
            '<div class="msg_headimg '+msg_headimg_hide+'" style="background-image:url(' + headimg + ')"></div>' +
            '<div class="msg_nickname '+msg_nickname_hide+'">' + nickname + '</div>' +
            '<div class="msg_content_wrapper '+msg_weixin+'">' +
                '#{msg_content_html}' + // 不同 msgType 有不同的 HTML 片段
            '</div>' +
        '</div>'
    var msg_content_html = ''
    var error_img = "/static/img/tools/error_img_"+parseInt(Math.random()*10%2)+".png"
    if (msgType === 'COMMENT') {
        content_values = content.split(content_type+"//")[1]
        if (content_type === 'HWEBFACEIMG') {
            var face_url = decodeURIComponent(content_values)
            msg_content_html =
                '<span class="msg_content face">' +
                    '<div class="msg_face_wrap" data-face-url="' + face_url + '">' +
                        '<img class="msg_face" src="' + face_url + '"  onerror="this.src=\''+error_img+'\'" onerror="this.src=\''+error_img+'\'">' +
                    '</div>' +
                '</span>'
        } else if (content_type === 'HWEBIMG') {
            // 外链图片
            // console.log(content_values)
            var url = decodeURIComponent(content_values)
            // console.log(url)
            var thumbnail_url = url+""
            msg_content_html = 
                '<span class="msg_content msg_image">' +
                    '<div class="msg_image_thumbnail_wrap clearfix" data-url="' + url + '">' +
                        '<img crossorigin="Anonymous" class="msg_image_thumbnail" src="' + thumbnail_url + '" onerror="this.src=\''+error_img+'\'">' +
                    '</div>' +
                    '<button class="baidu_ai_action_btn" data-value="general_basic" data-url="'+thumbnail_url+'?imageView2/2/w/500">通用文字识别</button>'+
                    '<button class="baidu_ai_action_btn" data-value="form_ocr" data-url="'+thumbnail_url+'?imageView2/2/w/1000">表格识别</button>'+
                    '<button class="baidu_ai_action_btn" data-value="business_license" data-url="'+thumbnail_url+'?imageView2/2/w/500">营业执照识别</button>'+
                    '<button class="baidu_ai_action_btn" data-value="idcard" data-url="'+thumbnail_url+'?imageView2/2/w/500" data-id-card-side="front">身份证正面</button>'+
                    '<button class="baidu_ai_action_btn" data-value="idcard" data-url="'+thumbnail_url+'?imageView2/2/w/500" data-id-card-side="back">身份证反面</button>'+
                    '<br><button class="baidu_ai_action_btn" data-value="form_ocr" data-url="'+thumbnail_url+'?imageView2/2/w/1000">表格识别</button>'+
                    '<br><button class="baidu_ai_action_btn" data-value="form_ocr_plus" data-type="json" data-url="'+thumbnail_url+'?imageView2/2/w/1000">输出JSON</button>'+
                    '<br><button class="baidu_ai_action_btn" data-value="form_ocr_plus" data-type="excel" data-url="'+thumbnail_url+'?imageView2/2/w/1000">输出EXCEL</button>'+
                '</span>'
            
        } else if (content_type === 'HWEBPANORAMA') {
            // 外链全景图片
            // console.log(content_values)
            var url = decodeURIComponent(content_values)
            // console.log(url)
            var thumbnail_url = url+""
            msg_content_html = 
                '<span class="msg_content msg_panorama">' +
                    '<div class="msg_panorama_thumbnail_wrap clearfix" data-url="' + url + '">' +
                        '<img class="msg_panorama_thumbnail" src="' + thumbnail_url + '" onerror="this.src=\''+error_img+'\'">' +
                    '</div>' +
                '</span>'
        } else if (content_type === 'HQWEBIMG') {
            // 图片
            // console.log(content_values)
            var url = decodeURIComponent("http://image.hotpoor.org/"+roomId+"_"+content_values)
            // console.log(url)
            var thumbnail_url = url+""
            msg_content_html = 
                '<span class="msg_content msg_image">' +
                    '<div class="msg_image_thumbnail_wrap clearfix" data-url="' + url + '">' +
                        '<img crossorigin="Anonymous" class="msg_image_thumbnail" src="' + thumbnail_url + '?imageView2/2/w/300" onerror="this.src=\''+error_img+'\'">' +
                    '</div>' +
                    '<button class="baidu_ai_action_btn" data-value="general_basic" data-url="'+thumbnail_url+'?imageView2/2/w/500">通用文字识别</button>'+
                    '<button class="baidu_ai_action_btn" data-value="business_license" data-url="'+thumbnail_url+'?imageView2/2/w/500">营业执照识别</button>'+
                    '<button class="baidu_ai_action_btn" data-value="idcard" data-url="'+thumbnail_url+'?imageView2/2/w/500" data-id-card-side="front">身份证正面</button>'+
                    '<button class="baidu_ai_action_btn" data-value="idcard" data-url="'+thumbnail_url+'?imageView2/2/w/500" data-id-card-side="back">身份证反面</button>'+
                    '<br><button class="baidu_ai_action_btn" data-value="form_ocr" data-url="'+thumbnail_url+'?imageView2/2/w/1000">表格识别</button>'+
                    '<br><button class="baidu_ai_action_btn" data-value="form_ocr_plus" data-type="json" data-url="'+thumbnail_url+'?imageView2/2/w/1000">输出JSON</button>'+
                    '<br><button class="baidu_ai_action_btn" data-value="form_ocr_plus" data-type="excel" data-url="'+thumbnail_url+'?imageView2/2/w/1000">输出EXCEL</button>'+
                '</span>'
        } else if (content_type === 'HQWEBPANORAMA') {
            // console.log(content_values)
            var url = decodeURIComponent("http://image.hotpoor.org/"+roomId+"_"+content_values)
            // console.log(url)
            var thumbnail_url = url+""
            msg_content_html = 
                '<span class="msg_content msg_panorama">' +
                    '<div class="msg_panorama_thumbnail_wrap clearfix" data-url="' + url + '">' +
                        '<img crossorigin="Anonymous" class="msg_panorama_thumbnail" src="' + thumbnail_url + '?imageView2/2/w/300" onerror="this.src=\''+error_img+'\'">' +
                    '</div>' +
                '</span>'
        } else if (content_type === 'HQWEBVIDEO') {
            // 图片
            // console.log(content_values)
            var url = decodeURIComponent("http://video.hotpoor.org/"+roomId+"_"+content_values)
            // console.log(url)
            var thumbnail_url = url+""
            var base_id = parseInt(timer)+"_"+content_values
            var video_id = 'video_'+parseInt(timer)+"_"+content_values
            var img_id = 'img_'+parseInt(timer)+"_"+content_values
            var canvas_id = 'canvas_'+parseInt(timer)+"_"+content_values
            if (device_now=="device_android"&&is_weixin){
                msg_content_html =
                    '<span class="msg_content msg_video">' +
                        '<div class="msg_video_thumbnail_wrap clearfix" data-url="' + url + '">' +
                            '<div class="video_cover" style="position: absolute; z-index: 1; top: 0px; left: 0px; width: 100%; height: 100%;">' +
                                '<img src="http://img.plancats.com/video_play_white.svg" style="position: absolute;z-index: 2;left: 50%;top: 50%;width: 100px;height: 100px;margin-left: -50px;margin-top: -50px;">' +
                            '</div>' +
                            '<img id="'+img_id+'" src="'+url+'?vframe/jpg/offset/0/"'+' style="width:100%;height:auto;" onerror="this.src=\''+error_img+'\'">'+
                            '<canvas id="'+canvas_id+'" class="msg_video_thumbnail" onclick="videoPlay(\''+base_id+'\',\''+url+'\')" style="position:absolute;left:0px;top:0px;"></canvas>'+
                        '</div>' +
                    '</span>'
            }else{
                msg_content_html = 
                    '<span class="msg_content msg_video">' +
                        '<div class="msg_video_thumbnail_wrap clearfix" data-url="' + url + '">' +
                            '<div class="video_cover" style="position: absolute; z-index: 1; top: 0px; left: 0px; width: 100%; height: 100%;">' +
                                '<img src="http://img.plancats.com/video_play_white.svg" style="position: absolute;z-index: 2;left: 50%;top: 50%;width: 100px;height: 100px;margin-left: -50px;margin-top: -50px;">' +
                            '</div>' +
                            '<video id="'+video_id+'" poster="'+url+'?vframe/jpg/offset/0/" class="msg_video_thumbnail" preload="meta" x-webkit-airplay="true" x5-video-player-type="h5" webkit-playsinline playsinline x5-video-player-fullscreen="true" data-src="' + thumbnail_url + '" style="display:inline;"></video>' +
                            // '<canvas id="'+canvas_id+'" class="msg_video_thumbnail" onclick="videoPlay(\''+base_id+'\')"></canvas>'+
                        '</div>' +
                    '</span>'
            }
        }else if (content_type === 'HWEIXINTEXT') {
            msg_content_html = '<span class="msg_content msg_content_weixintext">' + '<b>微信公众号留言</b><br>留言内容: '+content_values +'<br>留言时间: '+time+ '</span>'
        } else {
            msg_content_html = '<span class="msg_content">' + content + '</span>'
        }


        msg_html = msg_html.replace('#{msg_content_html}', msg_content_html)
    
    } else if (msgType === 'AUDIO') {
        if (content_type === 'HQAUDIO') {
            var audio_src = "http://audio.hotpoor.org/" + roomId + "_" + user_id + "_" + content_values.split(",")[0]
            var audio_length = parseInt(content_values.split(",")[1]) + "\'\'"
        } else {
            var audio_src = ""
            var audio_length = "错误"
        }
        var audiocaption_logo = "http://img.plancats.com/baidu_speech.png"
        msg_content_html = 
            '<span class="msg_content audio" data-type="audio" data-audio-src="' + audio_src + '">' +
                '<div class="msg_audio">' +
                    '<span class="msg_audio_btn"></span>' +
                    '<span class="msg_audio_line"></span>' +
                    '<span class="msg_audio_time">' + audio_length + '</span>' +
                '</div>' +
                '<div class="msg_audio_cover"></div>' +
            '</span>' +
            '<br>' +
                '<span class="msg_content audiocaption" style="font-style:italic;">' + plus_content +
                    '<br>' +
                    plus_content_destination+
                    // '<br>' +
                    // '<div style="margin-top: 4px;height: 20px;padding-top: 5px;box-shadow: 0px -1px 0px rgba(255,255,255,0.6);">' +
                    //     '<img src="' + audiocaption_logo + '" style="height: 16px;border-radius: 2px;">' +
                    // '</div>' +
                '</span>'+
                ''
                +'<br>'+
                //'<span>'+
                //    '<div class="blockchain_btn ibm_invoke" data-user-id="'+user_id+'" data-comment-target="'+comment_id+'_'+comment_sequence+'">ibm invoke</div>'+
                    '<span><div class="blockchain_btn wx_pay_test" data-app="hotpoor" data-value="1" data-order-id="" data-user-id="'+user_id+'" data-comment-target="'+comment_id+'_'+comment_sequence+'">weixin pay</div>'+
                '</span>'

    
        msg_html = msg_html.replace('#{msg_content_html}', msg_content_html)
    }
    $('.room[data-room-id=' + roomId + ']').find(".room_card").prepend(msg_html)
}

//百度UNIT-access_token检查
function baidu_ai_check(content,_aim_id) {
    $.ajax({
        url: '/api/mmplus_baidu_ai/access_token_update?user_id=0cd8429c1da249b6935d7eef72d7fc0b',
        type: 'GET',
        dataType: 'json',
        data: {
        },
        success: function (data) {
            console.log(data);
            baidu_ai_access_token = data.access_token
            baidu_ai(content,_aim_id)
        },
        error: function (error) {
            // console.log(error)
        }
    })
}
baidu_ai_session_id = null
// 百度UNIT回复测试
function baidu_ai(content,_aim_id) {
    $.ajax({
        url: '/api/mmplus_baidu_ai/query',
        type: 'POST',
        dataType: 'json',
        data: {
           scene_id: 7742,
            query: content,
            access_token: baidu_ai_access_token,
            session_id: baidu_ai_session_id,
            aim_id:_aim_id,
        },
        success: function (data) {
            console.log(data)
baidu_ai_session_id = data.result.session_id;

console.log("======")
        },
        error: function (error) {
            // console.log(error)
        }
    })
}

baidu_ai_access_token = null
// 发送消息
function submitComment(content) {
    $.ajax({
        url: '/api/comment/submit',
        type: 'POST',
        dataType: 'json',
        data: {
            app: WX_APP,
            aim_id: targetRoomId,
            content: content,
            redirect_uri:'http://www.hotpoor.org/home/mmplus?user_id=0cd8429c1da249b6935d7eef72d7fc0b',
        },
        success: function (data) {
            // console.log(data)
            baidu_ai_check(content,targetRoomId)
        },
        error: function (error) {
            // console.log(error)
        }
    })
}
function secretSubmitComment(content,aim_id) {
    $.ajax({
        url: '/api/comment/submit_secret',
        type: 'POST',
        dataType: 'json',
        data: {
            app: WX_APP,
            aim_id: aim_id,
            content: content,
            msgtype: aim_id
        },
        success: function (data) {
            // console.log(data)
        },
        error: function (error) {
            // console.log(error)
        }
    })
}

function roomScrollToBottom (roomId) {
    var $currentRoom = $('.room[data-room-id=' + roomId + ']')
    var $currentRoomCard = $currentRoom.find('.room_card')
    $currentRoomCard[0].scrollIntoView(false)
    if ($currentRoomCard.height() <= $currentRoom.height() - 20) {
        if (rooms_info[roomId].last_comment_id) {
            $currentRoom.find('.room_load_btn').show()
        }
    }
}


/*
 * 事件监听
 */

if (window.navigator.userAgent.indexOf('Mobile') !== -1) {
    $chatHeads.on('touchstart', function (e) {
        if (!isExpanded) {
            e.stopPropagation()
            e.preventDefault()
            isStarted = true
            isMoved = false
            _maxOffset = 0
            _time = e.timeStamp
            var touch = e.originalEvent.targetTouches[0]
            touchId = touch.identifier
            _clientX = touch.clientX
            _clientY = touch.clientY
            _startX = _clientX
            _startY = _clientY
            var els = $chatHeads.children()
            for (var i = 0,len = els.length; i < len; i++) {
                els[i].classList.remove('transition')
            }
        }
    })

    $(window).on('touchmove', function (e) {
        if (!isExpanded) {
            if (isStarted) {
                e.preventDefault()
                isMoved = true;

                var touch = e.originalEvent.targetTouches[0]
                if (touch.identifier === touchId) {
                    var clientX = touch.clientX
                    var clientY = touch.clientY
                    if (Math.abs(clientX - _startX) > _maxOffset) {
                        _maxOffset = Math.abs(clientX - _startX)
                    }
                    if (Math.abs(clientY - _startY) > _maxOffset) {
                        _maxOffset = Math.abs(clientY - _startY)
                    }
                    var dx = clientX - _clientX
                    var dy = clientY - _clientY
                    _clientX = clientX
                    _clientY = clientY
                    var _x = x + dx
                    var _y = y + dy
                    if (_y < minY) {
                        _y = minY
                        onHeadsMoveEnd()
                        isStarted = false
                    } else if (_y > maxY) {
                        _y = maxY
                        onHeadsMoveEnd()
                        isStarted = false
                    } else {
                        if (_maxOffset > MAXOFFSET) {
                            moveHeads(_x, _y)
                        } else {
                            moveHeadsTogether(_x, _y)
                        }
                    }
                }
            }
        }
    })

    $(window).on('touchend', function (e) {
        if (!isExpanded) {
            if (isStarted) {
                isStarted = false
                var roomId = e.target.dataset.roomId

                var _isMoved = true
                if(device_now == "device_pc"){
                    if(isMoved){
                        if (e.timeStamp - _time < MAXPERIOD && _maxOffset < MAXOFFSET) {
                           var _isMoved = false
                        }
                    }
                }else if (device_now == "device_iphone"){
                    if (e.timeStamp - _time < MAXPERIOD && _maxOffset < MAXOFFSET) {
                       var _isMoved = false
                    }
                }else if (device_now == "device_android"){
                    if (e.timeStamp - _time < MAXPERIOD && _maxOffset < MAXOFFSET) {
                       var _isMoved = false
                    }
                }else if (device_now == "device_mac"){
                    if (e.timeStamp - _time < MAXPERIOD && _maxOffset < MAXOFFSET) {
                       var _isMoved = false
                    }
                }
                if (!_isMoved) {
                    onHeadsClickWhenCollapsed()
                } else {
                    onHeadsMoveEnd()
                }
            }
        }
    })
} else {
    $chatHeads.on('mousedown', function (e) {
        if (!isExpanded) {
            e.stopPropagation()
            e.preventDefault()
            isStarted = true
            isMoved = false
            _maxOffset = 0
            _time = e.timeStamp
            _clientX = e.clientX
            _clientY = e.clientY
            _startX = _clientX
            _startY = _clientY
            var els = $chatHeads.children()
            for (var i = 0,len = els.length; i < len; i++) {
                els[i].classList.remove('transition')
            }
        }
    })

    $(window).on('mousemove', function (e) {
        if (!isExpanded) {
            if (isStarted) {
                e.preventDefault()
                isMoved = true
                var clientX = e.clientX
                var clientY = e.clientY
                var dx = clientX - _clientX
                var dy = clientY - _clientY
                _clientX = clientX
                _clientY = clientY
                var _x = x + dx
                var _y = y + dy
                if (Math.abs(clientX - _startX) > _maxOffset) {
                        _maxOffset = Math.abs(clientX - _startX)
                }
                if (Math.abs(clientY - _startY) > _maxOffset) {
                        _maxOffset = Math.abs(clientY - _startY)
                }
                if (_y < minY) {
                    _y = minY
                    onHeadsMoveEnd()
                    isStarted = false
                } else if (_y > maxY) {
                    _y = maxY
                    onHeadsMoveEnd()
                    isStarted = false
                } else {
                    if (_maxOffset > MAXOFFSET) {
                        moveHeads(_x, _y)
                    } else {
                        moveHeadsTogether(_x, _y)
                    }
                }
            }
        }
    })

    $(window).on('mouseup', function (e) {
        if (!isExpanded) {
            if (isStarted) {
                isStarted = false
                var roomId = e.target.dataset.roomId

                var _isMoved = true
                if(device_now == "device_pc"){
                    // console.log("---1"+isMoved)
                    if(isMoved){
                        // console.log("---2"+isMoved)
                        if (e.timeStamp - _time < MAXPERIOD && _maxOffset < MAXOFFSET) {
                            // console.log("---3"+isMoved)
                           var _isMoved = false
                        }
                    }else{
                        var _isMoved = false
                    }
                }else if (device_now == "device_iphone"){
                    if (e.timeStamp - _time < MAXPERIOD && _maxOffset < MAXOFFSET) {
                       var _isMoved = false
                    }
                }else if (device_now == "device_android"){
                    if (e.timeStamp - _time < MAXPERIOD && _maxOffset < MAXOFFSET) {
                       var _isMoved = false
                    }
                }else if (device_now == "device_mac"){
                    if (e.timeStamp - _time < MAXPERIOD && _maxOffset < MAXOFFSET) {
                       var _isMoved = false
                    }
                }

                if (_isMoved) {
                    onHeadsMoveEnd()
                } else {
                    onHeadsClickWhenCollapsed()
                }
            }
        }
    })
}

$chatHeads.on("click", function (e) {
    if (isExpanded) {
        var roomId = e.target.dataset.roomId
        if (isLogo) {
            isLogo = false
            $imMenu.hide()
            $imBox.show()
            onClickSwitch(roomId)
        }else{
            if (roomId === targetRoomId) {
                onHeadsClickWhenExpanded()
            } else {
                onClickSwitch(roomId)
            }
        }
        roomScrollToBottom(roomId)
    }
})

var $imMenu = $('.im_menu')
var isLogo = false
$logo.on('click', function (e) {
    e.stopPropagation()
    if (isExpanded) {
        if (!isLogo) {
            isLogo = true
            $imBox.hide()
            $imMenu.show()
            var index = latestRoomIds.length
            var offset = r * (2 * index + 1) + 5 * (index + 1)
            $roomArrow.css({ 'right': offset + 'px' })
        } else {
            isLogo = false
            $imMenu.hide()
            onHeadsClickWhenExpanded()
        }
    }
})

var im_menu_border_timeout = null
$("body").on("click", ".im_menu_tab", function (e) {
    var el = e.currentTarget
    var tab = el.dataset.tab
    var index = el.dataset.offset
    $('.im_menu_content').hide()
    $('.im_menu_content[data-tab=' + tab + ']').show()

    $('.im_menu_tab').removeClass('active')
    $('.im_menu_tab[data-tab=' + tab + ']').addClass('active')
    var value = index * 25 + '%'
    $('.im_menu_border').stop()

    if (device_now === 'device_android') {
        clearTimeout(im_menu_border_timeout)
        im_menu_border_timeout = setTimeout(function () {
            $('.im_menu_border').animate({'left': value},250)
        }, 100)
    } else {
        $('.im_menu_border').animate({'left': value},250)
    }
})


$(window).on('resize', function (e) {
    // console.log('resize')
    var old_h = h
    w = window.innerWidth
    h = window.innerHeight
    maxX = w - minX
    maxY = h - minY
    x = maxX
    y = y / old_h * h
    // resetStyle()
    if (isExpanded) {
        setHeadsStyleExpanded()
    } else {
        setHeadsStyleCollapsed()
    }
    if (device_now === 'device_iphone') {
        $imBox.css({'height': (h - 80) + 'px'})
        $(".style_help").remove()
        $("body").append('<div class="style_help"><style>.im_chat_head,.im_logo {top: initial;bottom: ' + (h - 30) + 'px;}</style></div>')
    }
})

$imBox.on('animationend', function (e) {
    $imBox.removeClass('expand')
})
$imBox.on('webkitAnimationEnd', function (e) {
    $imBox.removeClass('expand')
})

var $imMenuResize = $('.im_menu_resize')
$("body").on("click", ".im_menu_resize, .im_chat_icon_resize", function (e) {
    e.stopPropagation()
    if ($chatResize.hasClass('im_chat_icon_resize_full')) {
        $chatResize.removeClass('im_chat_icon_resize_full')
        $imBox.removeClass('im_box_full')
    } else {
        $chatResize.addClass('im_chat_icon_resize_full')
        $imBox.addClass('im_box_full')
    }
    if ($imMenuResize.hasClass('im_menu_resize_full')) {
        $imMenuResize.removeClass('im_menu_resize_full')
        $imMenu.removeClass('im_menu_full')
    } else {
        $imMenuResize.addClass('im_menu_resize_full')
        $imMenu.addClass('im_menu_full')
    }
})
$sendMsg.on('click', function (e) {
    var content = $msgContent.val()
    if (content.replace(/\s/g, '') !== '') {
        submitComment(content)
        $msgContent.val('')
        $sendMsg.removeClass('im_edit_icon_send_active')
        adjustInputHeight()
    }
})
$msgContent.on('input', function (e) {
    adjustInputHeight()
    var content = $msgContent.val()
    if (content.replace(/\s/g, '') !== '') {
        $sendMsg.addClass('im_edit_icon_send_active')
    } else {
        $sendMsg.removeClass('im_edit_icon_send_active')
    }
})
$baseInputEdit.on('click', function (e) {
    $msgContent.focus()
})

$baseInputEdit.on('keydown', function(e) {
    if((e.ctrlKey && e.key == "Enter")||(e.ctrlKey && e.keyCode ==13)||(e.metaKey && e.key == "Enter")||(e.metaKey && e.keyCode ==13)){
        $(".im_edit_icon_send_active").click()
    }
})


function adjustInputHeight () {
    $baseInput.removeClass('row-1 row-2 row-3')
    var scrollHeight = $msgContent[0].scrollHeight
    if (scrollHeight === 20) {
        $baseInput.addClass('row-1')
    } else if (scrollHeight === 40) {
        $baseInput.addClass('row-2')
    } else {
        $baseInput.addClass('row-3')
    }
}


$('.im_edit_icon_plus').on('click', function () {
    $msgContent.blur()
    showEditPlus()
})
$('.im_edit_icon_text').on('click', function () {
    hideEditPlus()
})


var $imEdit = $('.im_edit')
var $imEditBase = $('.im_edit_base')
var $imEditPlus = $('.im_edit_plus')
var $imEditIcons = $('.im_edit_icon')
var $imEditTools = $('.im_edit_tool')


function showEditPlus () {
    $imEditBase.hide()
    if (device_now === 'device_android') {
        $imEditPlus.css({'transform': 'translate3d(0,-180px,0)', 'transition': 'none'}).fadeIn()
    } else {
        $imEditPlus.show().addClass('plus')
    }

    setTimeout(function () {
        $imBox.css({'padding-bottom': '230px'})
    }, 500)

    $('.im_edit_icon_face').click()
}

function hideEditPlus () {
    $imBox.css({'padding-bottom': '50px'})

    if (device_now === 'device_android') {
        $imEditPlus.fadeOut(function () {
            $imEditPlus.css({'transform': 'translate3d(0,0,0)', 'transition': 'none'})  
        })
    } else {
        $imEditPlus.removeClass('plus').hide()
    }
    $imEditBase.fadeIn(100)

    $imEditIcons.removeClass('active')
    $imEditTools.hide()
}

$("body").on("click", ".im_edit_icon", function (e) {
    var $el = $(e.currentTarget)
    var tool = $el.data('tool')
    $imEditIcons.removeClass('active')
    $el.addClass('active')
    $imEditTools.hide()
    $('.im_edit_tool[data-tool=' + tool + ']').show()
})



$(document).on('click', '.tool_face_pack', function (e) {
    var $el = $(e.currentTarget)
    var index = $el.index()
    var leftValue = $el.width() * index
    var face_pack = $el.data('face-pack')
    $('.tool_face_packs_border').css({'left': leftValue})
    $('.tool_face').hide()
    $('.tool_face[data-face-pack="' + face_pack + '"]').fadeIn()
})

$(document).on('click', '.tool_face_item', function (e) {
    var $el = $(e.currentTarget)
    $el.addClass('animate')
    var face_id = $el.data('face-id')
    var face_url = "http://img.plancats.com/" + face_id + '.png'
    var content = 'HWEBFACEIMG//' + encodeURIComponent(face_url)
    submitComment(content)
})

$(document).on('animationend', '.tool_face_item', function (e) {
    var $el = $(e.currentTarget)
    $el.removeClass('animate')
})
$(document).on('webkitAnimationEnd', '.tool_face_item', function (e) {
    var $el = $(e.currentTarget)
    $el.removeClass('animate')
})



function resetRoomsInfo(roomId) {
    // imgUrl 和 roomName 不动
    rooms_info[roomId].createtime = ''
    rooms_info[roomId].finishtime = 0
    rooms_info[roomId].room_time_flag = ''
    rooms_info[roomId].createuser = ''
    rooms_info[roomId].finishuser = ''
    rooms_info[roomId].createcard = false
    rooms_info[roomId].finishcard = false
    rooms_info[roomId].createcommentsequence = ''
    rooms_info[roomId].finishcommentsequence = ''
    rooms_info[roomId].latestComment = ''
    rooms_info[roomId].last_comment_id = ''
    rooms_info[roomId].roomNewMsgCount = 0
}



// 选择聊天界面

// 创建聊天界面
function createConversation (roomId) {
    if(latestRoomIds.indexOf(roomId)==-1){
        // var time_now = ((new Date()).getTime()/1000)
        // rooms_info[roomId] = {
        //     "imgUrl": imgUrl,
        //     "roomName": roomName,
        //     "createtime": time_now,
        //     "finishtime": 0,
        //     "room_time_flag": time_now,
        //     "createuser":"",
        //     "finishuser":"",
        //     "createcommentsequence":"",
        //     "finishcommentsequence":"",
        // }

        latestRoomIds.unshift(roomId)
        head = $('<div class="im_chat_head transition" data-room-id="' + roomId + '"></div>')[0]
        head.style.backgroundImage = 'url(' + rooms_info[roomId].imgUrl + ')'
        head.style.zIndex = baseZIndex + 1
        if (isExpanded) {
            var newX = expandedX(-1)
            var newY = expandedY(-1)
        } else {
            var newX = collapsedX(-1)
            var newY = collapsedY(-1)
        }
        setTransform(head, newX, newY)
        $chatHeads.prepend(head)

        var len = latestRoomIds.length
        if (len > MAXROOMS) {
            if (targetRoomId === latestRoomIds[len - 1]) {
                var delRoomId = latestRoomIds.splice(len - 2, 1)
            } else {
                var delRoomId = latestRoomIds.pop()
            }
            $chatHeads.children('[data-room-id=' + delRoomId + ']').remove()
            $('.room[data-room-id='+ delRoomId +']').remove()
            resetRoomsInfo(delRoomId)
            setTimeout(function () {
                resetRoomsInfo(delRoomId)
            }, 1000)

            len = MAXROOMS
        }


        if (isExpanded) {
            setHeadsStyleExpanded()
        } else {
            setHeadsStyleCollapsed()
        }

        $rooms.append(
            '<div class="room" style="display:block;" data-room-id="' + roomId + '" data-room-name="' + rooms_info[roomId].roomName + '">' +
                '<div class="im_room_scroll">' +
                    '<div class="room_load_btn" style="display:block;">往昔消息</div>' +
                    '<div class="room_card"></div>' +
                '</div>' +
                '<div class="im_room_new_msg_tip_wrap" style="display:none;">' +
                    '<span class="im_room_new_msg_tip">0条新消息</span>' +
                '</div>' +
            '</div>')
        $('.room[data-room-id=' + roomId + ']').find('.im_room_scroll').on('scroll', onRoomScroll)


        var index = latestRoomIds.indexOf(targetRoomId)
        var offset = r * (2 * index + 1) + 5 * (index + 1)
        $roomArrow.css({ 'right': offset + 'px' })

        $.ajax({
            url: '/api/comment/load',
            type: 'POST',
            dataType: 'json',
            data: {
                app: WX_APP,
                aim_id: roomId,
                comment_id: rooms_info[roomId].last_comment_id,
            },
            success: function (data) {
                if(data.info == "ok"){
                    rooms_info[roomId].last_comment_id = data.last_comment_id
                    members_json_now = members_json
                    members_json_new = data.members
                    members_json = $.extend({}, members_json_now,members_json_new)
                    var comment, comments, _i, _len, _msg
                    comments = data.comments
                    for (_i = 0, _len = comments.length; _i < _len; _i++) {
                        comment = comments[(_len - _i - 1)]
                        _msg = [comment[3],{
                            "content": comment[4],
                            "nickname": members_json[comment[1]].nickname,
                            "headimgurl": members_json[comment[1]].headimgurl,
                            "time": comment[2],
                            "user_id": comment[1],
                            "tel": members_json[comment[1]].tel,
                            "plus": comment[5],
                            "sequence": comment[0],
                            "comment_id": data.comment_id,
                        },roomId]
                        if (typeof(LOADMESSAGE_PLUS) == "undefined") {
                            loadMessage(_msg)
                            if (_i == 0) {
                                rooms_info[roomId]["latestComment"] = _msg
                                item_text = ""
                                setRoomItemText(_msg)
                                sortRoomItems()
                            }
                        } else {
                            LOADMESSAGE_PLUS_ACTION(_msg)
                        }
                    }
                    $(".room[data-room-id='"+roomId+"']>.im_room_scroll>.room_card>.msg_time[data-time='"+rooms_info[roomId].createtime+"']").removeClass("msg_time_hide")
                    $(".msg[data-comment-flag='"+rooms_info[roomId].createcommentsequence+"']>.msg_headimg_hide").removeClass("msg_headimg_hide")
                    $(".msg[data-comment-flag='"+rooms_info[roomId].createcommentsequence+"']>.msg_nickname_hide").removeClass("msg_nickname_hide")
                    if (data.last_comment_id) {
                        $(".room[data-room-id='"+roomId+"']>.im_room_scroll>.room_load_btn").show()
                    } else {
                        $(".room[data-room-id='"+roomId+"']>.im_room_scroll>.room_load_btn").hide()
                    }
                    var flag = data.comment_id + '_' + comments[_len-1][0]
                    scrollIntoElement(roomId, $('[data-comment-flag=' + flag + ']')[0])
                } else {
                    $(".room[data-room-id='"+roomId+"']>.im_room_scroll>.room_load_btn").hide()
                }
            },
            error: function (error) {
                console.log(error)
                $(".room[data-room-id='"+roomId+"']>.im_room_scroll>.room_load_btn").show()
            }
        })
    }
    // resetStyle()
    if (isExpanded) {
        setHeadsStyleExpanded()
    } else {
        setHeadsStyleCollapsed()
    }
    if (roomId !== ws_aim_id_base) {
        joinMoreRooms([roomId])
    }
}




// 处理收起状态时，收到新消息时，切换头像，显示消息框，显示红标
function onMessageCollapsed (roomId, msg) {
    var content = msg[1].content
    content = content.replace(/\n/, '')
    content = escapeHTML(content)

    item_text = ""
    if(msg[0]=="AUDIO"){
        item_text = "[语音]"
    }else if (msg[0]=="AUDIOCAPTION"){
        item_text = "[语音·转文字]"+msg[1].content.replace("百度语音转文字: ","")
    }else if(msg[0]=="COMMENT"){
        if(msg[1].content.indexOf("HQWEBIMG//")>=0||msg[1].content.indexOf("HWEBIMG//")>=0){
            item_text = "[图片]"
        }else if(msg[1].content.indexOf("HQWEBPANORAMA//")>=0||msg[1].content.indexOf("HWEBPANORAMA//")>=0){
            item_text = "[全景图片]"
        }else if (msg[1].content.indexOf("HWEBFACEIMG//")>=0){
            item_text = "[表情]"
        }else if (msg[1].content.indexOf("HQWEBVIDEO//")>=0){
            item_text = "[小视频]"
        }else{
            item_text = msg[1].content
        }
    }

    var index = latestRoomIds.indexOf(roomId)
    if (index !== -1) {
        targetRoomId = roomId
        latestRoomIds.splice(index, 1)
        latestRoomIds.unshift(roomId)

        if (!latestUnreadNumber[roomId]) { latestUnreadNumber[roomId] = 0 }
        latestUnreadNumber[roomId] += 1
        notifyWhenCollapsed(roomId, item_text, latestUnreadNumber[roomId], 'text')
        setHeadsStyleCollapsed()
    } else {
        targetRoomId = roomId
        latestRoomIds.unshift(roomId)
        var len = latestRoomIds.length

        latestUnreadNumber[roomId] = 1
        notifyWhenCollapsed(roomId, item_text, 1, 'text')

        var head = $('<div class="im_chat_head" data-room-id="' + roomId + '" style="background-image:url()"></div>')[0]
        setTransform(head, collapsedX(-1), collapsedY(-1))
        head.style.zIndex = baseZIndex + 1
        $chatHeads.prepend(head)

        if (len > MAXROOMS) {
            var delRoomId = latestRoomIds[len - 1]
            latestRoomIds.pop()
            $chatHeads.children('[data-room-id=' + delRoomId + ']').remove()
            $('.room[data-room-id='+ delRoomId +']').find('.im_room_scroll').off('scroll', onRoomScroll)
            $('.room[data-room-id='+ delRoomId +']').remove()
            resetRoomsInfo(delRoomId)
            len = MAXROOMS

            delete latestUnreadNumber[delRoomId]
            notifyWhenCollapsed(delRoomId, item_text, 0, 'text')
        }

        setHeadsStyleCollapsed()
    }
}

// 处理展开状态时，收到新消息时，切换头像，显示红标
function onMessageExpanded (roomId, msg) {
    var content = msg[1].content
    content = content.replace(/\n/, '')
    content = escapeHTML(content)
    
    var index = latestRoomIds.indexOf(roomId)
    if (roomId === targetRoomId) {
        //
    } else if (index !== -1) {
        latestRoomIds.splice(index, 1)
        latestRoomIds.unshift(roomId)

        if (!latestUnreadNumber[roomId]) { latestUnreadNumber[roomId] = 0 }
        latestUnreadNumber[roomId] += 1
        notifyWhenExpanded(roomId, content, latestUnreadNumber[roomId], 'number')

        setHeadsStyleExpanded()
    } else {
        latestRoomIds.unshift(roomId)
        var len = latestRoomIds.length

        latestUnreadNumber[roomId] = 1
        notifyWhenExpanded(roomId, content, 1, 'number')

        var head = $('<div class="im_chat_head" data-room-id="' + roomId + '" style="background-image:url()"></div>')[0]
        setTransform(head, expandedX(-1), expandedY(-1))
        head.style.zIndex = baseZIndex + 1
        $chatHeads.prepend(head)

        if (len > MAXROOMS) {
            if (targetRoomId === latestRoomIds[len - 1]) {
                var delRoomId = latestRoomIds.splice(len - 2, 1)
            } else {
                var delRoomId = latestRoomIds.pop()
            }

            delete latestUnreadNumber[delRoomId]
            notifyWhenExpanded(delRoomId, content, 0, 'number')

            $chatHeads.children('[data-room-id=' + delRoomId + ']').remove()
            $('.room[data-room-id='+ delRoomId +']').find('.im_room_scroll').off('scroll', onRoomScroll)
            $('.room[data-room-id='+ delRoomId +']').remove()
            // rooms_info[delRoomId] = {}
            resetRoomsInfo(delRoomId)
            len = MAXROOMS
        }

        setHeadsStyleExpanded()
    }
    if (isLogo) {
        var index = latestRoomIds.length
    } else {
        var index = latestRoomIds.indexOf(targetRoomId)
    }
    var offset = r * (2 * index + 1) + 5 * (index + 1)
    $roomArrow.css({ 'right': offset + 'px' })
}

var isExpanding = false
// 处理收起状态时，点击头像，隐藏消息框，展开头像，清除红标
function onHeadsClickWhenCollapsed () {
    var els = $chatHeads.children()
    for (var i = 0,len = els.length; i < len; i++) {
        els[i].classList.add('transition')
    }
    $(".msg_notice").remove()
    if (!isExpanding) {
        $("body").append("<div class='xialiwei_help_cover'></div>");
        isExpanding = true
        var _roomId = targetRoomId
        $cover.show()
        setTimeout(function () {
            $imBox.addClass('expand')
            $imBox.show()
            $roomArrow.css({ 'right': '35px' })
            $roomArrow.addClass('show')

            roomScrollToBottom(_roomId)
            setTimeout(function () {
                isExpanding = false
                isExpanded = true
                $logo.css({'visibility': 'visible'})
                $(".xialiwei_help_cover").remove();
            }, 300)
        }, timeout_rooms_show_plus)

        $body.addClass('expand')
        $logo.addClass('expand')
        $chatHeads.addClass('expand')

        $logo.css({'visibility': 'visible'})
        setHeadsStyleExpanded()

        latestUnreadNumber[_roomId] = 0
        notifyWhenExpanded(_roomId, '', 0, 'number')
        //notifyWhenExpanded(_roomId, '', 0, 'dot')

        $('.room').hide()
        var $room = $('.room[data-room-id=' + _roomId + ']')
        $room.show()
        var roomName = $room.data('room-name')
        $chatName.text(roomName)

        // isExpanded = true

    }
}

var isCollapsing = false
// 处理展开状态时，点击头像，收起头像
function onHeadsClickWhenExpanded () {
    if (!isCollapsing) {
        $("body").append("<div class='xialiwei_help_cover'></div>");
        isCollapsing = true
        $cover.hide()
        $imBox.hide()
        $body.removeClass('expand')
        $logo.removeClass('expand')
        $chatHeads.removeClass('expand')

        var index = latestRoomIds.indexOf(targetRoomId)
        latestRoomIds.splice(index, 1)
        latestRoomIds.unshift(targetRoomId)

        setHeadsStyleCollapsed()

        // arrow
        $roomArrow.removeClass('show')
        setTimeout(function () {
            isCollapsing = false
            isExpanded = false
            $logo.css({'visibility': 'hidden'})
            $(".xialiwei_help_cover").remove();
        }, 300)
        // isExpanded = false
    }
}

var isSwitching = false
// 处理展开状态时，点击头像，切换 room

function onClickSwitch (roomId) {
    if (!isSwitching) {
        isSwitching = true
        targetRoomId = roomId
        $('.room').hide()
        var $room = $('.room[data-room-id=' + roomId + ']')
        $room.show()
        var roomName = $room.data('room-name')
        $chatName.text(roomName)

        var index = latestRoomIds.indexOf(targetRoomId)
        var offset = r * (2 * index + 1) + 5 * (index + 1)
        $roomArrow.css({ 'right': offset + 'px' })

        latestUnreadNumber[roomId] = 0
        notifyWhenExpanded(roomId, '', 0, 'number')
        isSwitching = false
    }
}



function setHeadsStyleCollapsed () {
    var len = latestRoomIds.length
    for (var i = 0; i < len; i++) {
        var el = $chatHeads.children('[data-room-id=' + latestRoomIds[i] + ']')[0]
        el.style.zIndex = baseZIndex - i
        setTransform(el, collapsedX(i), collapsedY(i))
    }
    setTransform($logo[0], collapsedX(i), collapsedY(i))
}

function setHeadsStyleExpanded () {
    var len = latestRoomIds.length
    for (var i = 0; i < len; i++) {
        var el = $chatHeads.children('[data-room-id=' + latestRoomIds[i] + ']')[0]
        el.style.zIndex = baseZIndex - i
        setTransform(el, expandedX(i), expandedY(i))
    }
    setTransform($logo[0], expandedX(i), expandedY(i))
}



function setTransform(el, x, y) {
   var value = 'translate3d(' + x + 'px,' + y + 'px,0)'
   el.style.transform = value
   el.style.webkitTransform = value
}
function collapsedX (i) {
    return maxX + 4 * i
}
function collapsedY (i) {
    return y
}
function expandedX (i) {
    return w - r * (2 * i + 1) - 5 * (i + 1)
}
function expandedY (i) {
    return r + 10
}

function moveHeads (_x, _y) {
    var els = []
    var len = latestRoomIds.length
    for (var i = 0; i < len; i++) {
        var el = $chatHeads.children('[data-room-id=' + latestRoomIds[i] + ']')[0]
        els.push(el)
    }
    _callLater(els, function (el, index) {
        setTransform(el, _x + 4 * index, _y)
    })
    x = _x;
    y = _y;
}

function moveHeadsTogether (_x, _y) {
    var len = latestRoomIds.length
    for (var i = 0; i < len; i++) {
        var el = $chatHeads.children('[data-room-id=' + latestRoomIds[i] + ']')[0]
        setTransform(el, _x + 4 * i, _y)
    }
    x = _x;
    y = _y;
}


function onHeadsMoveEnd () {
    var els = []
    for (var i = 0; i < latestRoomIds.length; i++) {
        var el = $chatHeads.children('[data-room-id=' + latestRoomIds[i] + ']')[0]
        els.push(el)
    }
    _callLater(els, function (el, index) {
        el.classList.add('transition')
        setTransform(el, collapsedX(index), collapsedY(index))
    })
    setTransform($logo[0], collapsedX(els.length), collapsedY(els.length))
    x = maxX
}


function _requestFrame(n, callback) {
    if (n > 0) {
        requestAnimationFrame(function() {
            _requestFrame(n-1, callback)
        })
    } else if (n === 0) {
        callback()
    }
}

function _callLater(els, callback) {
    var len = els.length
    if (len) {
        function _call(i) {
            callback(els[i], i)
            i += 1
            if (i < len) {
                _requestFrame(3, function () {
                    _call(i)
                })
            }
        }
        _call(0)
    }
}


/**
 * 加载历史消息
 */
var isLoadingMore = false
var $roomLoadTip = $('.im_room_load_tip')

function loadHistory (currentRoomId) {
    isLoadingMore = true
    $roomLoadTip.text("消息加载中...").fadeIn()
    $.ajax({
        url: '/api/comment/load',
        type: 'POST',
        dataType: 'json',
        data: {
            app: WX_APP,
            aim_id: currentRoomId,
            comment_id: rooms_info[currentRoomId].last_comment_id,
        },
        success: function (data) {
            if(data.info == "ok"){
                rooms_info[currentRoomId].last_comment_id = data.last_comment_id
                members_json_now = members_json
                members_json_new = data.members
                members_json = $.extend({}, members_json_now,members_json_new)
                var comment, comments, _i, _len, _msg
                comments = data.comments
                for (_i = 0, _len = comments.length; _i < _len; _i++) {
                    comment = comments[(_len - _i - 1)]
                    _msg = [comment[3],{
                        "content": comment[4],
                        "nickname": members_json[comment[1]].nickname,
                        "headimgurl": members_json[comment[1]].headimgurl,
                        "time": comment[2],
                        "user_id": comment[1],
                        "tel": members_json[comment[1]].tel,
                        "plus": comment[5],
                        "sequence": comment[0],
                        "comment_id": data.comment_id,
                    },currentRoomId]
                    loadMessage(_msg)
                }
                $(".room[data-room-id='"+currentRoomId+"']>.im_room_scroll>.room_card>.msg_time[data-time='"+rooms_info[currentRoomId].createtime+"']").removeClass("msg_time_hide")
                $(".msg[data-comment-flag='"+rooms_info[currentRoomId].createcommentsequence+"']>.msg_headimg_hide").removeClass("msg_headimg_hide")
                $(".msg[data-comment-flag='"+rooms_info[currentRoomId].createcommentsequence+"']>.msg_nickname_hide").removeClass("msg_nickname_hide")
                var scroll_flag = data.comment_id + '_' + comments[comments.length-1][0]
                var $el = $("[data-comment-flag='"+ scroll_flag +"']")
                if ($el.length == 1) {
                    scrollIntoElement(currentRoomId, $el[0])
                }
                isLoadingMore = false
                $roomLoadTip.text('加载成功！')
                setTimeout(function () {
                    $roomLoadTip.fadeOut()
                }, 1000)
                if (data.last_comment_id) {
                    $('.room[data-room-id="' + currentRoomId + '"]>.im_room_scroll>.room_load_btn').show()
                } else {
                    $('.room[data-room-id="' + currentRoomId + '"]>.im_room_scroll>.room_load_btn').hide()
                }
            } else {
                isLoadingMore = false
                $roomLoadTip.text('加载失败！')
                setTimeout(function () {
                    $roomLoadTip.fadeOut()
                }, 1000)
                $('.room[data-room-id="' + currentRoomId + '"]>.im_room_scroll>.room_load_btn').show()
            }
        },
        error: function (error) {
            isLoadingMore = false
            $roomLoadTip.text('加载失败！')
            setTimeout(function () {
                $roomLoadTip.fadeOut()
            }, 1000)
            $('.room[data-room-id="' + currentRoomId + '"]>.im_room_scroll>.room_load_btn').show()
        }
    })
}


function onRoomScroll (e) {
    var $el = $(e.currentTarget)
    var roomId = $el.parent().data('room-id')
    var scrollTop = $el.scrollTop()

    if (scrollTop < 10 && !isLoadingMore) {
        if (rooms_info[roomId].last_comment_id) {
            $el.find('.room_load_btn').hide()
            loadHistory(roomId)
        } else {

        }
    }

    if (rooms_info[roomId].roomNewMsgCount) {
        var targetRoom = $el[0]
        if (targetRoom.scrollHeight - targetRoom.scrollTop - targetRoom.offsetHeight <= removeRoomMsgTipHeight) {
            rooms_info[roomId].roomNewMsgCount = 0
            resetRoomNewMsgTip(roomId)
        }
    }
}


$("body").on("click", ".room_load_btn", function (e) {
    var $el = $(e.currentTarget)
    // $el.hide()
    var roomId = $el.closest('.room').data('room-id')
    loadHistory(roomId)
})

/**
 * æ¶æ¯éç¥
 */

// var noDisturbList = []  // ä¸ææ° roomId åè¡¨
var latestUnreadNumber = {}
var notifyWhenCollapsed_timeout = null
var notifyWhenCollapsed_timeout_fadeOut = null
function notifyWhenCollapsed (roomId, content, number, type) {
    var $el = $chatHeads.children('[data-room-id=' + roomId + ']')
    if (type === 'text') {
        var $head = $chatHeads.children('[data-room-id=' + roomId + ']')
        if (number == 0) {
            $head.children().remove()
        } else {
            $head.children(".msg_number").remove()
            var $msgNumber = $('<span class="msg_number">' + number + '</span>')
            $head.append($msgNumber)
        }

        $(".msg_notice").remove()
        // handle content
        var msgTip = $('<div class="msg_notice" style="top:'+(y - 15) + 'px">' +
            '<span class="msg_notice_text">' + content + '</span>' +
            '</div>')[0]
        $("body").append(msgTip)
        clearTimeout(notifyWhenCollapsed_timeout)
        clearTimeout(notifyWhenCollapsed_timeout_fadeOut)
        notifyWhenCollapsed_timeout = setTimeout(function () {
            $(msgTip).css({'transform': 'scale(1.0)','-webkit-transform': 'scale(1.0)'})
            notifyWhenCollapsed_timeout_fadeOut = setTimeout(function(){
                $(msgTip).fadeOut(500,function(){this.remove()})
            },2000)
        }, 200)
    } else if (type === 'number') {
        var $head = $chatHeads.children('[data-room-id=' + roomId + ']')
        if (number == 0) {
            $head.children().remove()
        } else {
            var $msgNumber = $('<span class="msg_number">' + number + '</span>')
            $head.append($msgNumber)
        }
    } else if (type === 'dot') {
        var $head = $chatHeads.children('[data-room-id=' + roomId + ']')
        if (number == 0) {
            $head.children().remove()
        } else {
            var $msgNumber = $('<span class="msg_dot"></span>')
            $head.append($msgNumber)
        }
    }
}

function notifyWhenExpanded (roomId, content, number, type) {
    if (type === 'dot') {
        var $head = $chatHeads.children('[data-room-id=' + roomId + ']')
        if (number == 0) {
            $head.children().remove()
        } else {
            var $msgNumber = $('<span class="msg_dot"></span>')
            $head.append($msgNumber)
        }
    } else if (type === 'number') {
        var $head = $chatHeads.children('[data-room-id=' + roomId + ']')
        if (number == 0) {
            $head.children().remove()
        } else {
            var $msgNumber = $('<span class="msg_number">' + number + '</span>')
            $head.append($msgNumber)
        }
    }
}



/**
 * 全景
 */

showPanorama_timeout = null
function showPanorama(url, width, height) {
    $('.pop_card_cover').show()
    $('.pop_card_cancel').show()
    clearTimeout(showPanorama_timeout)
    $('.pop_card').empty().append(
        '<div class="panorama_view_container" style="width: ' + width + 'px;height: ' + height + 'px;max-height:'+parseInt((h*0.9)- 90)+'px;">' +
            '<iframe class="panorama_view" style="width:100%;height:100%;border: none;vertical-align:bottom;" src=""></iframe>' +
        '</div>')
    showPanorama_timeout = setTimeout(function(){
        $(".panorama_view").attr("src",url)
    },300)

}
function showImage(url, width, height) {
    var error_img = "/static/img/tools/error_img_"+parseInt(Math.random()*10%2)+".png"
    $('.pop_card_cover').show()
    $('.pop_card_cancel').show()
    $('.pop_card').empty().append(
        '<div class="image_view_container" style="max-width: ' + width + 'px;height:auto;">' +
            '<img onerror="this.src = \'' + error_img + '\'" crossorigin="Anonymous" class="image_view" style="width:100%;height:auto;border: none;vertical-align:bottom;" src="' + url + '">' +
        '</div>')
}
AudioContext = window.AudioContext || window.webkitAudioContext
URL = window.URL || window.webkitURL
audio_context = new AudioContext();


var web_recorder = null;
var web_recorder_now = false;
var web_audio_tool_now = false;

var web_recorder_start_time = 0;
var web_recorder_stop_time = 0;

// timeout用
var web_recorder_time_out_now = null;

//timeInterval用（也可以每次做减法，使用时间戳更精准）
var web_recorder_move_time = 0;
var web_recorder_time_base = 60;
var web_p = null;

// 开始录音
function web_start_record_Audio(argument) {
    // body...
    web_recorder_now = true;
    web_recorder_start_time = new Date().getTime()
    web_recorder && web_recorder.record()
    console.log(web_recorder)
    console.log("=== web_recorder record() ===")
    clearTimeout(web_recorder_time_out_now)
    web_recorder_time_out_now = setTimeout(function(){
        web_stop_record_Audio_auto()
    },5000);
    console.log("开始录音")
}
// 暂停录音
function web_pause_record_Audio(argument) {
    // body...
}
// 连续录音
function web_stop_record_Audio_auto(argument) {
    if(web_recorder_now){
        clearTimeout(web_recorder_time_out_now)
        web_recorder && web_recorder.stop()
        console.log(web_recorder)
        console.log("=== web_recorder stop() ===")
        web_recorder_stop_time = new Date().getTime()
        createDownloadLink(web_recorder_start_time,web_recorder_stop_time)
        web_recorder.clear()
        // web_recorder_now = false;
        web_recorder_now = true;
        console.log("自动开启下一个录音")
        web_start_record_Audio()
    }
}

// 停止录音
function web_stop_record_Audio(argument) {
    clearTimeout(web_recorder_time_out_now)
    web_recorder && web_recorder.stop()
    console.log(web_recorder)
    console.log("=== web_recorder stop() ===")
    web_recorder_stop_time = new Date().getTime()
    createDownloadLink(web_recorder_start_time,web_recorder_stop_time)
    web_recorder.clear()
    web_recorder_now = false;
    console.log("结束录音")
}

function BufferLoader(context, urlList, callback) {
  this.context = context;
  this.urlList = urlList;
  this.onload = callback;
  this.bufferList = new Array();
  this.loadCount = 0;
}

BufferLoader.prototype.loadBuffer = function(url, index) {
  // Load buffer asynchronously
  var request = new XMLHttpRequest();
  request.open("GET", url, true);
  request.responseType = "arraybuffer";

  var loader = this;

  request.onload = function() {
    // Asynchronously decode the audio file data in request.response
    loader.context.decodeAudioData(
      request.response,
      function(buffer) {
        if (!buffer) {
          alert('error decoding file data: ' + url);
          return;
        }
        loader.bufferList[index] = buffer;
        if (++loader.loadCount == loader.urlList.length)
          loader.onload(loader.bufferList);
      }
    );
  }

  request.onerror = function() {
    alert('BufferLoader: XHR error');
  }

  request.send();
}

BufferLoader.prototype.load = function() {
  for (var i = 0; i < this.urlList.length; ++i)
  this.loadBuffer(this.urlList[i], i);
}




// 创造资源下载
blob_i = null
function createDownloadLink(startRecording_time,stopRecording_time){
    if (web_recorder){
        console.log("拥有资源")
    }else{
        console.log("资源缺失")
    }

    web_recorder && web_recorder.exportWAV(function(blob){
        stopRecording_time = new Date().getTime()
        data_info = {
            "roomId":targetRoomId,
            "name":stopRecording_time+"_"+Math.random(),
            "duration":(stopRecording_time-startRecording_time)/1000.0
        }
        blob_i = blob

        console.log("资源生成")
        console.log(URL.createObjectURL(blob))
        reader = new FileReader()
        reader.onload = function (e) {
            var radio_result;
            if(e.target.readyState == FileReader.DONE){
                radio_result = e.target.result
                msg = ["RADIO", {
                    "content": "RADIO",
                    "nickname": "xialiwei",
                    "headimgurl": USER_HEADIMGURL,
                    "tel": "15201950688",
                    "time": (stopRecording_time/1000),
                    "user_id": USER_ID,
                    "sequence": "",
                    "comment_id": "",
                    "src":radio_result,
                }, targetRoomId]
                console.log(msg)
                ws.send(JSON.stringify(msg))
            }
            // var uploadFile;
            // uploadFile = function(file) {
            //   var endingByte, file_index, file_lists, files, reader, startingByte, tempfile, type, updateProgress, uploadNextFile, xhrProvider;
            //   file_lists = [];
            //   files = file;
            //   file_lists.push(files);
            //   file_index = 0;
            //   startingByte = 0;
            //   endingByte = 0;
            //   type = file.type ? file.type : 'n/a';
            //   reader = new FileReader();
            //   tempfile = null;
            //   startingByte = 0;
            //   xhrProvider = function() {
            //     var xhr;
            //     xhr = jQuery.ajaxSettings.xhr();
            //     if (xhr.upload) {
            //       xhr.upload.addEventListener('progress', updateProgress, false);
            //     }
            //     return xhr;
            //   };
            //   updateProgress = function(evt) {
            //     return console.log(startingByte, file.size, evt.loaded, evt.total);
            //   };
            //   // $("#uploading_files").text("Uploading file #{file_index+1} of #{files.length} at #{(startingByte + (endingByte-startingByte)*evt.loaded/evt.total)/file.size*100}%")
            //   uploadNextFile = function() {
            //     file_index += 1;
            //     if (file_index < files.length) {
            //       return uploadFile(files[file_index]);
            //     } else {
            //       file_lists.shift();
            //       if (file_lists.length > 0) {
            //         file_index = 0;
            //         files = file_lists[0];
            //         return uploadFile(files[file_index]);
            //       }
            //     }
            //   };
            //   reader.onload = function(evt) {
            //     var bin, content, worker;
            //     content = evt.target.result.slice(evt.target.result.indexOf("base64,") + 7);
            //     bin = atob(content);
            //     worker = new Worker("/static/js/md5.js");
            //     worker.onmessage = function(event) {
            //       var Qiniu_UploadUrl, Qiniu_UploadUrl_https, md5;
            //       md5 = event.data;
            //       // console.log "md5", md5, file
            //       Qiniu_UploadUrl_https = "https://up.qbox.me";
            //       if (window.location.protocol === "https:") {
            //         Qiniu_UploadUrl = Qiniu_UploadUrl_https;
            //       } else {
            //         Qiniu_UploadUrl = "http://up.qiniu.com";
            //       }
            //       return $.post("/api/audio/check4wav", {
            //         "aim_id": data_info.roomId,
            //         "name": data_info.name,
            //         "duration": data_info.duration,
            //         "app":WX_APP
            //       }, function(data) {
            //         var Qiniu_upload, upload_token;
            //         if (files.length === 1) {
            //           if (data["exists"]) {
            //             return;
            //           }
            //         } else {
            //           if (file_index + 1 === files.length) {
            //             if (data["exists"]) {
            //               return;
            //             }
            //           } else {
            //             if (data["exists"]) {
            //               return uploadNextFile();
            //             }
            //           }
            //         }
            //         upload_token = data["token"];
            //         // upload_version = data["profile_img_version"]
            //         Qiniu_upload = function(f, token, key) {
            //           var formData, startDate, xhr;
            //           xhr = new XMLHttpRequest();
            //           xhr.open('POST', Qiniu_UploadUrl, true);
            //           formData = new FormData();
            //           if (key !== null && key !== void 0) {
            //             formData.append('key', key);
            //           }
            //           formData.append('token', token);
            //           formData.append('file', f);
            //           xhr.upload.addEventListener("progress", function(evt) {
            //             var formatSpeed, nowDate, percentComplete, taking, uploadSpeed, x, y;
            //             if (evt.lengthComputable) {
            //               nowDate = new Date().getTime();
            //               taking = nowDate - startDate;
            //               x = evt.loaded / 1024;
            //               y = taking / 1000;
            //               uploadSpeed = x / y;
            //               if (uploadSpeed > 1024) {
            //                 formatSpeed = (uploadSpeed / 1024).toFixed(2) + "Mb\/s";
            //               } else {
            //                 formatSpeed = uploadSpeed.toFixed(2) + "Kb\/s";
            //               }
            //               percentComplete = Math.round(evt.loaded * 100 / evt.total);
            //               return console.log(percentComplete, ",", formatSpeed);
            //             }
            //           }, false);
            //           xhr.onreadystatechange = function(response) {
            //             var blkRet;
            //             if (xhr.readyState === 4 && xhr.status === 200 && xhr.responseText !== "") {
            //               blkRet = JSON.parse(xhr.responseText);
            //               return uploadNextFile();
            //             }
            //           };
            //           startDate = new Date().getTime();
            //           return xhr.send(formData);
            //         };
            //         return Qiniu_upload(file, upload_token, data_info.roomId +"_"+USER_ID+ "_" + data_info.name+".wav");
            //       });
            //     };
            //     return worker.postMessage(bin);
            //   };
            //   return reader.readAsDataURL(file);
            // };
            // uploadFile(blob);
        }
        reader.readAsDataURL(blob)
    })
}

// 预览录音
function web_replay_record_Audio(argument) {
    // body...
}
function web_send_record_Audio(argument) {
    // body...
}

window.onload = function(){
    $("body").on("click", ".msg_panorama_thumbnail_wrap", function (e) {
        var url = e.currentTarget.dataset.url
        var width = parseInt(w * 0.9)
        var height = parseInt(width * 2 / 3) - 90/2
        var url_base = "http://hotpoor.org/home/tools/webgl_panorama_dualfisheye?url="+url+"&title=HOTPOOR&target_z=100&move=true&target_y=100&target_x=45"
        // "&screen_width="+width+"&screen_height="+height
        // var url_base2 = "http://www.hotpoor.org/home/tools/panorama?url="+url
        showPanorama(url_base, width, height)
    })
    $("body").on("click", ".msg_image_thumbnail_wrap", function (e) {
        var url = e.currentTarget.dataset.url
        var width = parseInt(w * 0.9)
        var height = parseInt(width * 2 / 3)
        var url_base = url
        if (url.indexOf("?")>=0){
            showImage(url_base, width, height)
        }else{
            showImage(url_base+"?imageView2", width, height)
        }
    })
    $("body").on("click", ".pop_card_wrap,.pop_card_cancel", function (e) {
        // if (e.target === e.currentTarget) {
            $('.pop_card_cover').hide()
            $('.pop_card_cancel').hide()
            clearTimeout(showPanorama_timeout)
            var frame = $(".panorama_view")
            var el = frame[0]
            if (el) {
                el.contentWindow.document.write('');
                el.contentWindow.document.clear();
                var p = el.parentNode;
                p.removeChild(el);
            }
            // cycleClear()
        // }
    })
    // cycleClear_timeout = null
    // function cycleClear() {
    //     try {
    //         var frame = $(".panorama_view")
    //         var el = frame[0]
    //         if (el) {
    //             el.contentWindow.document.write('');
    //             el.contentWindow.document.clear();
    //             var p = el.parentNode;
    //             p.removeChild(el);
    //         }
    //     } catch (e) {
    //         console.log("再来一次")
    //         cycleClear_timeout = setTimeout(cycleClear, 100);
    //     }
    // }

    if (window.location.protocol === "https:"){
        if (navigator.mediaDevices.getUserMedia) {
            web_p = navigator.mediaDevices.getUserMedia({ audio: true, video:false })
            web_p.then(function (stream) {
                    web_audio_tool_now = true;
                    input = audio_context.createMediaStreamSource(stream);
                    console.log(audio_context)
                    console.log(input)
                    web_recorder = new Recorder(input)
                    console.log(web_recorder)
                    console.log("=== web_recorder ===")
                }
            )
            web_p.catch(function(err) { console.log(err.name); });
            console.log("=== navigator.mediaDevices.getUserMedia be here ===")
        }else{
            console.log("=== navigator.mediaDevices.getUserMedia null ===")
        }
    }

}


/**
 * 图片上传进度动画
 */

function addWaitingMessage (room_id, type, id) {
    var type_img_url
    if (type === 'image') {
        type_img_url = 'http://img.plancats.com/camera_gray.svg'
    } else if (type === 'panorama') {
        type_img_url = 'http://img.plancats.com/panorama_gray.svg'
    } else if (type === 'video') {
        type_img_url = 'http://img.plancats.com/video_gray.svg'
    }
    var image_upload_wait_html = 
        '<div class="msg_self image_wait" data-md5="' + id + '">' +
            '<span>' +
                '<div class="image_wait_container">' +
                    '<img class="image_wait_type_icon" src="' + type_img_url + '">' +
                    '<div class="image_wait_progress_wrap">' +
                        '<div class="image_wait_line">' +
                            '<div class="image_wait_progress" style="width:0%;"></div>' +
                            '<img class="image_wait_head" style="left:0%;" src="' + members_json[USER_ID].headimgurl + '">' +
                         '</div>' +
                    '</div>' +
                '</div>' +
            '<span>' +
        '</div>'
    $(".room[data-room-id='"+ room_id +"']>.im_room_scroll>.room_card").append(image_upload_wait_html)
    scrollIntoElement(room_id, $(".msg_self.image_wait[data-md5='"+id+"']")[0])
    // $('.room[data-room-id=' + room_id + ']>.im_room_scroll').stop().animate({"scrollTop":$(".msg_self.image_wait[data-md5='"+id+"']")[0].offsetTop})
}

function updateWaitingMessage (roomId, type, id, value) {
    $(".msg_self.image_wait[data-md5='"+id+"']").find('.image_wait_progress').css({
        'width': value + '%'
    })
    $(".msg_self.image_wait[data-md5='"+id+"']").find('.image_wait_head').css({
        'left': value + '%'
    })
}

function removeWaitingMessage (roomId, type, id) {
    $(".msg_self.image_wait[data-md5='"+id+"']").fadeOut(500,function(){
        $(".msg_self.image_wait[data-md5='"+id+"']").remove()
    })
}


/**
 * 当前 room 新消息提示
 */
var removeRoomMsgTipHeight = 200  // px
function setRoomNewMsgTip (roomId, num) {
    var $room = $('.room[data-room-id=' + roomId + ']')
    $room.find('.im_room_new_msg_tip').text(num + '条新消息')
    $room.find('.im_room_new_msg_tip_wrap').show()
}

function resetRoomNewMsgTip (roomId) {
    var $room = $('.room[data-room-id=' + roomId + ']')
    $room.find('.im_room_new_msg_tip').text('0条新消息')
    $room.find('.im_room_new_msg_tip_wrap').fadeOut(500)
}


$("body").on("click", ".im_room_new_msg_tip", function (e) {
    var roomId = $(e.currentTarget).closest('.room').data('room-id')
    rooms_info[roomId].roomNewMsgCount = 0
    resetRoomNewMsgTip(roomId)

    var $el = $('.room[data-room-id=' + roomId + ']').find('.im_room_scroll')
    $el.stop().animate({
        "scrollTop": $el[0].scrollHeight - $el[0].offsetHeight
    })
})



/**
 * 图片上传
 */
// var uploadFileType

var uploadFileType = null
var uploadFileRoomId = null
$("body").on("click", ".tool_image_btn", function (e) {
    var el = e.target
    uploadFileType = el.dataset.name
    console.log("======\n")
    console.log(uploadFileType)
    console.log("======\n")
    uploadFileRoomId = targetRoomId
    if (uploadFileType === 'image' || uploadFileType === 'panorama') {
        $("#img_add_upload").click()
    } else if (uploadFileType === 'short_video') {
        if (HOME_FILE_APPS.indexOf('short_video') !== -1) {
            $("#video_add_upload").click()
        } else {
            return alert('付费20元/月开通小视频上传功能')
        }
    } else if (uploadFileType === 'video') {
        if (HOME_FILE_APPS.indexOf('video') !== -1) {
            $("#video_add_upload").click()
        } else {
            return alert('付费50元/月开通视频上传功能')
        }
    }
})

$("body").on("mousemove", ".tool_image_btn", function (e) {
    $(".tool_image_btn").removeClass("tool_image_btn_here")
    $(this).addClass("tool_image_btn_here")
})
$("body").on("mouseout", ".tool_image_btn", function (e) {
    $(".tool_image_btn").removeClass("tool_image_btn_here")
})
$("body").on("touchmove", ".tool_image_btn", function (e) {
    $(".tool_image_btn").removeClass("tool_image_btn_here")
    $(this).addClass("tool_image_btn_here")
})
$(window).on("touchend", function (e) {
    $(".tool_image_btn").removeClass("tool_image_btn_here")
})


var root;

root = typeof exports !== "undefined" && exports !== null ? exports : this;

$(function() {
  var CDN_PREFIX, file_lists, handleFileSelect;
  CDN_PREFIX = "http://image.hotpoor.org";
  file_lists = [];
  if (window.File && window.FileList && window.FileReader && window.Blob && window.Worker) {
    handleFileSelect = function(evt) {
      var content_type, endingByte, file_index, files, img_add, startingByte, uploadFile, _ref, _room_id;
      img_add = (_ref = $(this).attr("id") === "img_add_upload") != null ? _ref : {
        "true": false
      };
      _room_id = uploadFileRoomId;
      var _file_type = uploadFileType
      console.log('>>' + _file_type)
      content_type = "HQWEBIMG//";
      if (uploadFileType === "panorama") {
        content_type = "HQWEBPANORAMA//";
      }
      evt.stopPropagation();
      evt.preventDefault();
      files = null;
      if (evt.target.files) {
        files = evt.target.files;
      } else {
        files = evt.dataTransfer.files;
      }
      file_lists.push(files);
      file_index = 0;
      startingByte = 0;
      endingByte = 0;
      uploadFile = function(file) {
        var reader, tempfile, type, updateProgress, uploadNextFile, xhrProvider;
        type = file.type ? file.type : 'n/a';
        reader = new FileReader();
        tempfile = null;
        startingByte = 0;
        console.log("正在上传第一张图片");
        xhrProvider = function() {
          var xhr;
          xhr = jQuery.ajaxSettings.xhr();
          if (xhr.upload) {
            xhr.upload.addEventListener('progress', updateProgress, false);
          }
          return xhr;
        };
        updateProgress = function(evt) {
          return console.log("Uploading file " + (file_index + 1) + " of " + files.length + " at " + ((startingByte + (endingByte - startingByte) * evt.loaded / evt.total) / file.size * 100) + "%");
        };
        uploadNextFile = function() {
          var obj;
          console.log("正在要上传下一张图片");
          file_index += 1;
          if (file_index < files.length) {
            uploadFile(files[file_index]);
            console.log("===");
            console.log(file_index);
            return console.log("===|||");
          } else {
            file_lists.shift();
            if (file_lists.length > 1) {
              file_index = 0;
              files = file_lists[0];
              uploadFile(files[file_index]);
              console.log("===+++");
              console.log(file_index);
              return console.log("===|||");
            } else {
              console.log("===>>>");
              obj = document.getElementById('img_add_upload');
              return obj.outerHTML = obj.outerHTML;
            }
          }
        };
        reader.onload = function(evt) {
          var bin, content, worker;
          content = evt.target.result.slice(evt.target.result.indexOf("base64,") + 7);
          bin = atob(content);
          worker = new Worker("/static/js/md5.js");
          worker.onmessage = function(event) {
            var Qiniu_UploadUrl, Qiniu_UploadUrl_https, md5, worker_aim_url;
            md5 = event.data;
            Qiniu_UploadUrl_https = "https://up.qbox.me";
            if (window.location.protocol === "https:") {
              Qiniu_UploadUrl = Qiniu_UploadUrl_https;
            } else {
              Qiniu_UploadUrl = "http://up.qiniu.com";
            }
            worker_aim_url = "/api/image/check";
            return $.post(worker_aim_url, {
              "aim_id": _room_id,
              "md5": md5
            }, function(data) {
              var Qiniu_upload, upload_token;
              if (files.length === 1) {
                console.log("正在上传1张图片");
                if (data["exists"]) {
                  content = content_type + md5;
                  return $.ajax({
                    url: '/api/comment/submit',
                    type: 'POST',
                    dataType: 'json',
                    data: {
                      "app": WX_APP,
                      "aim_id": _room_id,
                      "content": content
                    },
                    success: function(data) {
                      var obj;
                      console.log(data);
                      obj = document.getElementById('img_add_upload');
                      return obj.outerHTML = obj.outerHTML;
                    },
                    error: function(error) {
                      return console.log(error);
                    }
                  });
                }
              } else {
                if (file_index + 1 === files.length) {
                  console.log("正在上传最后一张图片");
                  if (data["exists"]) {
                    content = content_type + md5;
                    return $.ajax({
                      url: '/api/comment/submit',
                      type: 'POST',
                      dataType: 'json',
                      data: {
                        "app": WX_APP,
                        "aim_id": _room_id,
                        "content": content
                      },
                      success: function(data) {
                        var obj;
                        console.log(data);
                        obj = document.getElementById('img_add_upload');
                        return obj.outerHTML = obj.outerHTML;
                      },
                      error: function(error) {
                        return console.log(error);
                      }
                    });
                  }
                } else {
                  console.log("正在上传" + (file_index + 1) + "/" + files.length + "张图片");
                  if (data["exists"]) {
                    content = content_type + md5;
                    return $.ajax({
                      url: '/api/comment/submit',
                      type: 'POST',
                      dataType: 'json',
                      data: {
                        "app": WX_APP,
                        "aim_id": _room_id,
                        "content": content
                      },
                      success: function(data) {
                        return console.log(data);
                      },
                      error: function(error) {
                        return console.log(error);
                      },
                      complete: function() {
                        return uploadNextFile();
                      }
                    });
                  }
                }
              }
              upload_token = data["token"];
              Qiniu_upload = function(f, token, key) {
                var formData, startDate, xhr;
                xhr = new XMLHttpRequest();
                xhr.open('POST', Qiniu_UploadUrl, true);
                formData = new FormData();
                if (key !== null && key !== void 0) {
                  formData.append('key', key);
                }
                formData.append('token', token);
                formData.append('file', f);
                xhr.upload.addEventListener("progress", function(evt) {
                  var formatSpeed, nowDate, percentComplete, taking, uploadSpeed, x, y;
                  if (evt.lengthComputable) {
                    nowDate = new Date().getTime();
                    taking = nowDate - startDate;
                    x = evt.loaded / 1024;
                    y = taking / 1000;
                    uploadSpeed = x / y;
                    if (uploadSpeed > 1024) {
                      formatSpeed = (uploadSpeed / 1024).toFixed(2) + "Mb\/s";
                    } else {
                      formatSpeed = uploadSpeed.toFixed(2) + "Kb\/s";
                    }
                    percentComplete = Math.round(evt.loaded * 100 / evt.total);
                    // $('.image_wait[data-md5=' + md5 + ']').find('span').text('图片正在上传... ' + percentComplete + '%')
                    updateWaitingMessage(_room_id, _file_type, md5, percentComplete)
                    return console.log(percentComplete, ",", formatSpeed);
                  }
                }, false);
                xhr.onreadystatechange = function(response) {
                  var blkRet;
                  if (xhr.readyState === 4 && xhr.status === 200 && xhr.responseText !== "") {
                    blkRet = JSON.parse(xhr.responseText);
                    return $.post("/api/image/add", {
                      "aim_id": _room_id,
                      "md5": md5
                    }, function() {
                      // content = "HQWEBIMG//" + md5;
                      content = content_type + md5;
                      $.ajax({
                        url: '/api/comment/submit',
                        type: 'POST',
                        dataType: 'json',
                        data: {
                          "app": WX_APP,
                          "aim_id": _room_id,
                          "content": content
                        },
                        success: function(data) {
                          return console.log(data);
                        },
                        error: function(error) {
                          return console.log(error);
                        }
                      });
                      return uploadNextFile();
                    });
                  }
                };
                startDate = new Date().getTime();

                console.log('>>' + _file_type)
                addWaitingMessage(_room_id, _file_type, md5)
                return xhr.send(formData);
              };
              return Qiniu_upload(file, upload_token, _room_id + "_" + md5);
            });
          };
          return worker.postMessage(bin);
        };
        return reader.readAsDataURL(file);
      };
      if (file_lists.length >= 1) {
        return uploadFile(files[file_index]);
      }
    };
    return $("body").on("change", "#img_add_upload", handleFileSelect);
  }
});

$(function() {
  var CDN_PREFIX_VIDEO, file_lists_video, handleFileSelectVideo;
  CDN_PREFIX_VIDEO = "http://video.hotpoor.org";
  file_lists_video = [];
  if (window.File && window.FileList && window.FileReader && window.Blob && window.Worker) {
    handleFileSelectVideo = function(evt){
      var content_type, endingByte, file_index, files, img_add, startingByte, uploadFile, _ref, _room_id;
      img_add = (_ref = $(this).attr("id") === "video_add_upload") != null ? _ref : {
        "true": false
      };
      _room_id = uploadFileRoomId;
      var _file_type = uploadFileType
      console.log('>>' + _file_type)
      content_type = "HQWEBVIDEO//";
      evt.stopPropagation();
      evt.preventDefault();
      files = null;
      if (evt.target.files) {
        files = evt.target.files;
      } else {
        files = evt.dataTransfer.files;
      }
      file_lists_video.push(files);
      file_index = 0;
      startingByte = 0;
      endingByte = 0;
      uploadFile = function(file) {
        var reader, tempfile, type, updateProgress, uploadNextFile, xhrProvider;
        type = file.type ? file.type : 'n/a';
        $("#console_log").append(""+type+"<br>")
        reader = new FileReader();
        tempfile = null;
        startingByte = 0;
        console.log("正在上传第一个视频");
        $("#console_log").append("正在上传第一个视频<br>")
        xhrProvider = function() {
          var xhr;
          xhr = jQuery.ajaxSettings.xhr();
          if (xhr.upload) {
            xhr.upload.addEventListener('progress', updateProgress, false);
          }
          return xhr;
        };
        updateProgress = function(evt) {
          return console.log("Uploading file " + (file_index + 1) + " of " + files.length + " at " + ((startingByte + (endingByte - startingByte) * evt.loaded / evt.total) / file.size * 100) + "%");
        };
        uploadNextFile = function() {
          var obj;
          console.log("正在要上传下一个视频");
          file_index += 1;
          if (file_index < files.length) {
            uploadFile(files[file_index]);
            console.log("===");
            console.log(file_index);
            return console.log("===|||");
          } else {
            file_lists_video.shift();
            if (file_lists_video.length > 1) {
              file_index = 0;
              files = file_lists_video[0];
              uploadFile(files[file_index]);
              console.log("===+++");
              console.log(file_index);
              return console.log("===|||");
            } else {
              console.log("===>>>");
              obj = document.getElementById('video_add_upload');
              return obj.outerHTML = obj.outerHTML;
            }
          }
        };
        reader.onabort = function(evt) {
            $("#console_log").append("reader.onabort 中断<br>")
        }
        reader.onerror = function(evt) {
            $("#console_log").append("reader.onerror 出错<br>")
            for(i in reader.error){
                $("#console_log").append(i+": "+reader.error[i]+"<br>")
            }
        }
        reader.onloadstart = function(evt) {
            $("#console_log").append("reader.onloadstart 开始<br>")
        }
        reader.onprogress = function(evt) {
            $("#console_log").append("reader.onprogress 正在读取<br>")
        }
        reader.onloadend = function(evt) {
            $("#console_log").append("reader.onloadend 结束 无论成功失败<br>")
        }

        reader.onload = function(evt) {
          $("#console_log").append("reader.onload<br>")
          var bin, content, worker;
          content = evt.target.result.slice(evt.target.result.indexOf("base64,") + 7);
          bin = atob(content);
          worker = new Worker("/static/js/md5.js");
          worker.onmessage = function(event) {
            var Qiniu_UploadUrl, Qiniu_UploadUrl_https, md5, worker_aim_url;
            md5 = event.data;
            Qiniu_UploadUrl_https = "https://up.qbox.me";
            if (window.location.protocol === "https:") {
              Qiniu_UploadUrl = Qiniu_UploadUrl_https;
            } else {
              Qiniu_UploadUrl = "http://up.qiniu.com";
            }
            worker_aim_url = "/api/video/check";
            return $.post(worker_aim_url, {
              "aim_id": _room_id,
              "md5": md5
            }, function(data) {
              var Qiniu_upload, upload_token;
              if (files.length === 1) {
                console.log("正在上传1个视频");
                if (data["exists"]) {
                  content = content_type + md5;
                  return $.ajax({
                    url: '/api/comment/submit',
                    type: 'POST',
                    dataType: 'json',
                    data: {
                      "app": WX_APP,
                      "aim_id": _room_id,
                      "content": content
                    },
                    success: function(data) {
                      var obj;
                      console.log(data);
                      obj = document.getElementById('video_add_upload');
                      return obj.outerHTML = obj.outerHTML;
                    },
                    error: function(error) {
                      return console.log(error);
                    }
                  });
                }
              } else {
                if (file_index + 1 === files.length) {
                  console.log("正在上传最后一个视频");
                  if (data["exists"]) {
                    content = content_type + md5;
                    return $.ajax({
                      url: '/api/comment/submit',
                      type: 'POST',
                      dataType: 'json',
                      data: {
                        "app": WX_APP,
                        "aim_id": _room_id,
                        "content": content
                      },
                      success: function(data) {
                        var obj;
                        console.log(data);
                        obj = document.getElementById('video_add_upload');
                        return obj.outerHTML = obj.outerHTML;
                      },
                      error: function(error) {
                        return console.log(error);
                      }
                    });
                  }
                } else {
                  console.log("正在上传" + (file_index + 1) + "/" + files.length + "个视频");
                  if (data["exists"]) {
                    content = content_type + md5;
                    return $.ajax({
                      url: '/api/comment/submit',
                      type: 'POST',
                      dataType: 'json',
                      data: {
                        "app": WX_APP,
                        "aim_id": _room_id,
                        "content": content
                      },
                      success: function(data) {
                        return console.log(data);
                      },
                      error: function(error) {
                        return console.log(error);
                      },
                      complete: function() {
                        return uploadNextFile();
                      }
                    });
                  }
                }
              }
              upload_token = data["token"];
              Qiniu_upload = function(f, token, key) {
                var formData, startDate, xhr;
                xhr = new XMLHttpRequest();
                xhr.open('POST', Qiniu_UploadUrl, true);
                formData = new FormData();
                if (key !== null && key !== void 0) {
                  formData.append('key', key);
                }
                formData.append('token', token);
                formData.append('file', f);
                xhr.upload.addEventListener("progress", function(evt) {
                  var formatSpeed, nowDate, percentComplete, taking, uploadSpeed, x, y;
                  if (evt.lengthComputable) {
                    nowDate = new Date().getTime();
                    taking = nowDate - startDate;
                    x = evt.loaded / 1024;
                    y = taking / 1000;
                    uploadSpeed = x / y;
                    if (uploadSpeed > 1024) {
                      formatSpeed = (uploadSpeed / 1024).toFixed(2) + "Mb\/s";
                    } else {
                      formatSpeed = uploadSpeed.toFixed(2) + "Kb\/s";
                    }
                    percentComplete = Math.round(evt.loaded * 100 / evt.total);
                    // $('.image_wait[data-md5=' + md5 + ']').find('span').text('图片正在上传... ' + percentComplete + '%')
                    updateWaitingMessage(_room_id, _file_type, md5, percentComplete)
                    return console.log(percentComplete, ",", formatSpeed);
                  }
                }, false);
                xhr.onreadystatechange = function(response) {
                  var blkRet;
                  if (xhr.readyState === 4 && xhr.status === 200 && xhr.responseText !== "") {
                    blkRet = JSON.parse(xhr.responseText);
                    return $.post("/api/video/add", {
                      "aim_id": _room_id,
                      "md5": md5
                    }, function() {
                      // content = "HQWEBIMG//" + md5;
                      content = content_type + md5;
                      $.ajax({
                        url: '/api/comment/submit',
                        type: 'POST',
                        dataType: 'json',
                        data: {
                          "app": WX_APP,
                          "aim_id": _room_id,
                          "content": content
                        },
                        success: function(data) {
                          return console.log(data);
                        },
                        error: function(error) {
                          return console.log(error);
                        }
                      });
                      return uploadNextFile();
                    });
                  }
                };
                startDate = new Date().getTime();

                console.log('>>' + _file_type)
                addWaitingMessage(_room_id, _file_type, md5)
                return xhr.send(formData);
              };
              return Qiniu_upload(file, upload_token, _room_id + "_" + md5);
            });
          };
          return worker.postMessage(bin);
        };
        return reader.readAsDataURL(file);
      };
      if (file_lists_video.length >= 1) {
        return uploadFile(files[file_index]);
      }
    };
    return $("body").on("change", "#video_add_upload", handleFileSelectVideo);
  }
});

// $("body").append("<div id='console_log' style='position:fixed;z-index:200000;left:0px;top:0px;color:red;'></div>");







/**
 * 微信录音
 */

function addRecordRoomIcon (roomId) {
    $('.im_edit_tool_voice').prepend(
        '<div class="wx_record_room_icon_wrap">' +
            '<img class="wx_record_room_icon" src="' + rooms_info[roomId].imgUrl + '">' +
        '</div>')
}

function removeRecordRoomIcon () {
    $('.wx_record_room_icon_wrap').remove()
}


var weixinRecordingMode = 'single'
var weixinRecordingModeLan = 'zh'
var startWeixinRecording_time=0

var $recordRing = $('.wx_record_ring')
var $recordStart = $('#wx_record_start')
var $recordStop = $('#wx_record_stop')
var $recordUpload = $('#wx_record_upload')
var $recordCancel = $('#wx_record_cancel')
var $recordInfo = $('.wx_record_info')
var $modeSingle = $("#wx_record_mode_single")
var $modeContinue = $("#wx_record_mode_continue")
var $modeLanZh = $("#wx_record_mode_lan_zh")
var $modeLanEn = $("#wx_record_mode_lan_en")

$("body").on("click", "#wx_record_mode_single", function (e) {
    weixinRecordingMode = 'single'
    $modeSingle.addClass("active")
    $modeContinue.removeClass("active")
})
$("body").on("click", "#wx_record_mode_continue", function (e) {
    weixinRecordingMode = 'continue'
    $modeSingle.removeClass("active")
    $modeContinue.addClass("active")
})

$("body").on("click", "#wx_record_mode_lan_zh", function (e) {
    weixinRecordingModeLan = 'zh'
    $modeLanZh.addClass("active")
    $modeLanEn.removeClass("active")
})
$("body").on("click", "#wx_record_mode_lan_en", function (e) {
    weixinRecordingModeLan = 'en'
    $modeLanZh.removeClass("active")
    $modeLanEn.addClass("active")
})


$("body").on("animationend", ".wx_record_ring", function (e) {
    $(e.currentTarget).removeClass('animate')
})
$("body").on("webkitAnimationEnd", ".wx_record_ring", function (e) {
    $(e.currentTarget).removeClass('animate')
})

var recordStatus = 'notRecord' // 'recording', 'uploading'
var recordActionStop = false
var recordRoomId = null
$("body").on("click", "#wx_record_start", function (e) {
    // var _room_id=targetRoomId
    if (recordStatus === 'notRecord') {
        recordActionStop = false
        if (!recordRoomId) {
            recordRoomId = targetRoomId
            addRecordRoomIcon(recordRoomId)
        }
        wx.startRecord({
            cancel: function() {},
            success: function() {
                recordStatus = 'recording'
                startCount()
                $recordStart.hide()
                $recordStop.show()
                $recordRing.addClass('animate')
                $recordCancel.addClass('active')
                $recordInfo.text('完成录音并发送')

                startWeixinRecording_time = new Date().getTime();
                wx.onVoiceRecordEnd({
                    complete: function(res) {
                        if (recordStatus === 'recording') {
                            recordStatus = 'uploading'
                            stopCount()
                            $recordStop.hide()
                            $recordUpload.show()
                            $recordCancel.removeClass('active')
                            $recordInfo.text('上传中')

                            var localId, localId_now;
                            localId = res.localId;
                            localId_now = localId;
                            return StopWeixinRecordingAuto(localId_now, recordRoomId);
                        }
                      }
                });
            }
        });
    }
})

$("body").on("click", "#wx_record_stop", function (e) {
    // var _room_id = targetRoomId
    if (recordStatus === 'recording') {
        recordActionStop = true
        recordStatus = 'uploading'
        stopCount()
        $recordStop.hide()
        $recordUpload.show()
        $recordCancel.removeClass('active')
        $recordInfo.text('上传中')

        wx.stopRecord({
            success: function(res) {
                var localId, localId_now;
                localId = res.localId;
                localId_now = localId;
                return StopWeixinRecordingAuto(localId_now,recordRoomId);
            }
        })
    }
})

$("body").on("click", "#wx_record_cancel", function () {
    if (recordStatus === 'recording') {
        recordActionStop = true
        recordStatus = 'notRecord'
        stopCount()
        $recordStop.hide()
        $recordStart.show()
        $recordInfo.text("开始录音")
        $recordCancel.removeClass('active')
        wx.stopRecord({
            success: function (res) {
                recordRoomId = null
                removeRecordRoomIcon()
            }
        })
    } else if (recordStatus === 'notRecord') {
        hideEditPlus()
    }
})



var $recordTimer = $('.wx_record_timer')
var timer = null
function startCount () {
    var count = parseInt($recordTimer.text())
    if (!timer) {
        timer = setInterval(function () {
            // count -= 1
            var time = new Date().getTime()
            count = parseInt((60000 + startWeixinRecording_time - time) / 1000)
            $recordTimer.text(count + 's')
            if (count === 2) {
                $('#wx_stopRecord').click()
            }
        }, 1000)
    }
}
function stopCount () {
    clearInterval(timer)
    timer = null
    $recordTimer.text('60s')
}

function StopWeixinRecordingAuto(localId_now, _room_id) {
    stopWeixinRecording_time = new Date().getTime();
    data_info = {
        "name": new Date().getTime() + Math.random(),
        "duration": (stopWeixinRecording_time - startWeixinRecording_time) / 1000.0
    };
    wx.uploadVoice({
        localId: localId_now,
        isShowProgressTips: 1,
        success: function(res) {
            $.post("/api/audio/weixin_upload", {
                "aim_id": _room_id,
                "media_id": res.serverId,
                "name": data_info.name,
                "duration": data_info.duration,
                "lan":weixinRecordingModeLan,
                "app": WX_APP
            }, function(data) {
                if (recordStatus === 'uploading') {
                    wx_upload_wait_html = '<div class="msg_self audio_wait" data-media="'+res.serverId+'"><span>语音正在上传...</span></div>'
                    $(".room[data-room-id='"+_room_id+"']>.im_room_scroll>.room_card").append(wx_upload_wait_html)
                    $('.room[data-room-id=' + _room_id + ']>.im_room_scroll').stop().animate({"scrollTop":$(".msg_self.audio_wait[data-media='"+res.serverId+"']")[0].offsetTop})
                    recordStatus = 'notRecord'
                    $recordUpload.hide()
                    $recordStart.show()
                    $recordInfo.text('开始录音')
                    $('.wx_record_cancel_wrap').show()
                    if (weixinRecordingMode === 'continue') {
                        if (recordActionStop) {
                            recordActionStop = false
                            recordRoomId = null
                            removeRecordRoomIcon()
                        } else {
                            $recordStart.click()
                        }
                    } else {
                        recordRoomId = null
                        removeRecordRoomIcon()
                    }
                }
                //alert("微信上传成功");
            });
        }
    });
}


/**
 * 播放录音
 */
var globalVolume = 1

var $volumeControl = $('.tool_setting_volume_control')
var $volumeProgress = $('.tool_setting_volume_progress')
var $volumeDot = $('.tool_setting_volume_dot')
var $volumeIcon = $('.tool_setting_volume_icon')

var volumeDotStart = false
var volumeWidth
var volumeStartX
var volumeOffsetX

var isMuted = false
$volumeIcon.on("click", function (e) {
    if (!isMuted) {
        isMuted = true
        audioEl.muted = true
        $volumeIcon.addClass('mute')
    } else {
        isMuted = false
        audioEl.muted = false
        $volumeIcon.removeClass('mute')
    }
})


$volumeDot.on("mousedown", function (e) {
    volumeDotStart = true
    e.preventDefault()
    e.stopPropagation()
    volumeWidth = $volumeControl.width()
    volumeStartX = e.clientX
    volumeOffsetX = volumeWidth * globalVolume
})

notify_flag = false
$(window).on("focus", function (e) {
    notify_flag = false
})
$(window).on("blur", function (e) {
    notify_flag = true
})
$(window).on("mousemove", function (e) {
    if (volumeDotStart) {
        e.preventDefault()
        var value = volumeOffsetX + (e.clientX - volumeStartX)
        if (value <= 0) {
            value = 0
        }
        if (value >= volumeWidth) {
            value = volumeWidth
        }
        var vol = value / volumeWidth
        $volumeProgress.css({'width': 100 * vol + '%'})
        $volumeDot.css({'left': 100 * vol + '%'})
        globalVolume = vol
        audioEl.volume = vol
    }
})
$(window).on("mouseup", function (e) {
    if (volumeDotStart) {
        volumeDotStart = false
        if (globalVolume > 0) {
            isMuted = false
            audioEl.muted = false
            $volumeIcon.removeClass('mute')
        }
    }
})

$volumeDot.on("touchstart", function (e) {
    volumeDotStart = true
    e.preventDefault()
    e.stopPropagation()
    volumeWidth = $volumeControl.width()
    var touch = e.originalEvent.targetTouches[0]
    volumeStartX = touch.clientX
    volumeOffsetX = volumeWidth * globalVolume
})
$(window).on("touchmove", function (e) {
    if (volumeDotStart) {
        e.preventDefault()
        var touch = e.originalEvent.touches[0]
        var value = volumeOffsetX + (touch.clientX - volumeStartX)
        if (value <= 0) {
            value = 0
        }
        if (value >= volumeWidth) {
            value = volumeWidth
        }
        var vol = value / volumeWidth
        $volumeProgress.css({'width': 100 * vol + '%'})
        $volumeDot.css({'left': 100 * vol + '%'})
        globalVolume = vol
        audioEl.volume = vol
    }
})
$(window).on("touchend", function (e) {
    if (volumeDotStart) {
        volumeDotStart = false
        if (globalVolume > 0) {
            isMuted = false
            audioEl.muted = false
            $volumeIcon.removeClass('mute')
        }
    }
})

// 微信支付测试功能
$(document).on("click",".wx_pay_test",function(evt){
wx_pay_order_id = $(this).attr("data-order-id");
wx_pay_app = $(this).attr("data-app");
wx_pay_price = $(this).attr("data-value");
user_id = $(this).attr("data-user-id");
comment_target = $(this).attr("data-comment-target");
$(".wx_alert").remove()
$("body").append("<div class='wx_alert' style='color:white;'>"+wx_pay_order_id+"<br>"+wx_pay_app+"<br>"+wx_pay_price+"<br>"+"</div>")
$.post("/api/wechat_pay/home/order_unifiedorder", {
  weixin_app: wx_pay_app,
  price: wx_pay_price,
  order_id: wx_pay_order_id,
  title: "WeChat Pay For Audio",
}, function(data) {
$(".wx_alert").remove()
$("body").append("<div class='wx_alert' style='color:white;word-break: break-all;word-wrap: break-word;'>"+JSON.stringify(data)+"</div>")
if(data["home_pay_type"]=="weixin_pay"){
  var wxPayData;
  wxPayData = {
    timestamp: data["timestamp"],
    nonceStr: data["nonce"],
    "package": 'prepay_id=' + data["prepay_id"],
    signType: 'MD5',
    paySign: data["paysign"],
    success: function(res) {
        $.ajax({
          url: '/api/comment/submit_data',
          type: 'POST',
          dataType: 'json',
          data: {
            "app": 'hotpoor',
            "aim_id": '0cd8429c1da249b6935d7eef72d7fc0b',
            "user_id": '0cd8429c1da249b6935d7eef72d7fc0b',
            // "content": "ibm_invoke\ncomment_target: "+ibm_invoke_comment_target+"\nuser: "+USER_ID+"\nnowner: "+ibm_invoke_user_id+" voice"+"\ncomment_target: "+ibm_invoke_comment_target+"\nmessage name:"+massage_name+"\nresult: "+invoke_result
            "content": "weixin pay\ncomment_target: "+comment_target+"\nuser: "+USER_ID+"\nnowner: "+user_id+" voice"+"\ncomment_target: "+comment_target
          },
          success: function(data) {
            alert("invoke success");
            return console.log(data);
          },
          error: function(error) {
            return console.log(error);
          }
        });
    },
    complete: function(res) {}
  };
  wx.chooseWXPay(wxPayData);
}

});
});
var gb_img = null;
var gb_dataURL = null;
$(document).on('click','.baidu_ai_action_btn',function (e) {
    var _baidu_ai_action = $(this).attr("data-value");
    var _url = $(this).attr("data-url");
    if (_baidu_ai_action == "general_basic"){
        $.ajax({
            url: '/api/mmplus_baidu_ai/access_token_update?user_id=0cd8429c1da249b6935d7eef72d7fc0b',
            type: 'GET',
            dataType: 'json',
            data: {
            },
            success: function (data) {
                console.log(data);
                baidu_ai_access_token = data.access_token
                $.ajax({
                    url: '/api/mmplus_baidu_ai/general_basic',
                    type: 'POST',
                    dataType: 'json',
                    data: {
                        url: _url,
                        access_token: baidu_ai_access_token,
                        aim_id:targetRoomId,
                    },
                    success: function (data) {
                        console.log("====== 百度通用文字识别 开始 ======")
                        console.log(data)
                        console.log("====== 百度通用文字识别 结束 ======")
                    },
                    error: function (error) {
                        // console.log(error)
                    }
                })
            },
            error: function (error) {
                // console.log(error)
            }
        })
    }else if(_baidu_ai_action == "idcard"){
        gb_id_card_side = $(this).attr("data-id-card-side");
        gb_uri = $(this).attr("data-url");
        // gb_img = new Image(),
        // gb_dataURL='';
        // gb_img.src=_url;
        // gb_img.crossOrigin = "Anonymous";
        // gb_img.setAttribute('crossOrigin', 'anonymous');
        // console.log(gb_img);
        console.log("=== 图片识别 id card ===")
        
        $.ajax({
            url: '/api/mmplus_baidu_ai/access_token_update?user_id=0cd8429c1da249b6935d7eef72d7fc0b',
            type: 'GET',
            dataType: 'json',
            data: {
            },
            success: function (data) {
                console.log(data);
                baidu_ai_access_token = data.access_token
                $.ajax({
                    url: '/api/mmplus_baidu_ai/idcard_uri',
                    type: 'POST',
                    dataType: 'json',
                    data: {
                        gb_id_card_side: gb_id_card_side,
                        image_uri:gb_uri,
                        access_token: baidu_ai_access_token,
                        aim_id:targetRoomId,
                    },
                    success: function (data) {
                        console.log("====== 百度通用文字识别 开始 ======")
                        console.log(data)
                        console.log("====== 百度通用文字识别 结束 ======")
                        // gb_img = null;
                    },
                    error: function (error) {
                        // console.log(error)
                    }
                })
            },
            error: function (error) {
                // console.log(error)
            }
        })


    }else if(_baidu_ai_action == "business_license"){
        gb_uri = $(this).attr("data-url");
        console.log("=== 图片识别 business_license ===")
        
        $.ajax({
            url: '/api/mmplus_baidu_ai/access_token_update?user_id=0cd8429c1da249b6935d7eef72d7fc0b',
            type: 'GET',
            dataType: 'json',
            data: {
            },
            success: function (data) {
                console.log(data);
                baidu_ai_access_token = data.access_token
                $.ajax({
                    url: '/api/mmplus_baidu_ai/business_license',
                    type: 'POST',
                    dataType: 'json',
                    data: {
                        image_uri:gb_uri,
                        access_token: baidu_ai_access_token,
                        aim_id:targetRoomId,
                    },
                    success: function (data) {
                        console.log("====== 百度通用文字识别 开始 ======")
                        console.log(data)
                        console.log("====== 百度通用文字识别 结束 ======")
                        // gb_img = null;
                    },
                    error: function (error) {
                        // console.log(error)
                    }
                })
            },
            error: function (error) {
                // console.log(error)
            }
        })
    }else if(_baidu_ai_action == "form_ocr"){
        gb_uri = $(this).attr("data-url");
        console.log("=== 图片识别 form_ocr ===")
        
        $.ajax({
            url: '/api/mmplus_baidu_ai/access_token_update?user_id=0cd8429c1da249b6935d7eef72d7fc0b',
            type: 'GET',
            dataType: 'json',
            data: {
            },
            success: function (data) {
                console.log(data);
                baidu_ai_access_token = data.access_token
                $.ajax({
                    url: '/api/mmplus_baidu_ai/form_ocr',
                    type: 'POST',
                    dataType: 'json',
                    data: {
                        image_uri:gb_uri,
                        access_token: baidu_ai_access_token,
                        aim_id:targetRoomId,
                    },
                    success: function (data) {
                        console.log("====== 百度通用文字识别 开始 ======")
                        console.log(data)
                        console.log("====== 百度通用文字识别 结束 ======")
                        // gb_img = null;
                    },
                    error: function (error) {
                        // console.log(error)
                    }
                })
            },
            error: function (error) {
                // console.log(error)
            }
        })
    }else if(_baidu_ai_action == "form_ocr_plus"){
        gb_uri = $(this).attr("data-url");
        gb_result_type = $(this).attr("data-type");
        console.log("=== 图片识别 form_ocr_plus ===")
        
        $.ajax({
            url: '/api/mmplus_baidu_ai/access_token_update?user_id=0cd8429c1da249b6935d7eef72d7fc0b',
            type: 'GET',
            dataType: 'json',
            data: {
            },
            success: function (data) {
                console.log(data);
                baidu_ai_access_token = data.access_token
                $.ajax({
                    url: '/api/mmplus_baidu_ai/form_ocr',
                    type: 'POST',
                    dataType: 'json',
                    data: {
                        image_uri:gb_uri,
                        access_token: baidu_ai_access_token,
                        aim_id:targetRoomId,
                    },
                    success: function (data) {
                        console.log("====== 百度通用文字识别 开始 ======")
                        console.log(data)
                        var _request_id = data.result[0].request_id
                        console.log("====== 百度通用文字识别 结束 ======")
                        // gb_img = null;
                        $.ajax({
                            url: '/api/mmplus_baidu_ai/form_ocr/check',
                            type: 'POST',
                            dataType: 'json',
                            data: {
                                request_id:_request_id,
                                result_type:gb_result_type,
                                access_token: baidu_ai_access_token,
                                aim_id:targetRoomId,
                            },
                            success: function (data) {
                                console.log("====== 百度通用文字识别 表格 开始 ======")
                                console.log(data)
                                console.log("====== 百度通用文字识别 表格 结束 ======")
                                // gb_img = null;
                            },
                            error: function (error) {
                                // console.log(error)
                            }
                        })
                    },
                    error: function (error) {
                        // console.log(error)
                    }
                })
            },
            error: function (error) {
                // console.log(error)
            }
        })
    }
});

$(document).on('click', '.ibm_invoke', function (e) {
    var ibm_invoke_user_id = $(this).attr("data-user-id");
    var ibm_invoke_comment_target = $(this).attr("data-comment-target");
    $.ajax({
      url: 'https://b76a12e4dee7402480365feb0cc3c626-vp0.us.blockchain.ibm.com:5001/registrar',
      type: 'POST',
      dataType: 'text',
      data: '{"enrollId": "WebAppAdmin","enrollSecret": "c8900e9ce1"}',
      success: function(data) {
        _data_json = JSON.parse(data)
        if (_data_json.OK == "User WebAppAdmin is already logged in."){
            $.ajax({
              url: 'https://b76a12e4dee7402480365feb0cc3c626-vp0.us.blockchain.ibm.com:5001/network/peers',
              type: 'GET',
              dataType: 'json',
              data: {},
              success: function(data) {

                json_for_deploy = {
                  "jsonrpc": "2.0",
                  "method": "deploy",
                  "params": {
                    "type": 1,
                    "chaincodeID": {
                      "path": "https://github.com/hotpoor-for-Liwei/learn-chaincode/finished"
                    },
                    "ctorMsg": {
                      "function": "init",
                      "args": [
                        ibm_invoke_comment_target+"_"+USER_ID+"_"+ibm_invoke_user_id
                      ]
                    },
                    "secureContext": "WebAppAdmin"
                  },
                  "id": 0
                }
                $.ajax({
                  url: 'https://b76a12e4dee7402480365feb0cc3c626-vp0.us.blockchain.ibm.com:5001/chaincode',
                  type: 'POST',
                  dataType: 'text',
                  data: JSON.stringify(json_for_deploy),
                  success: function(data) {
                    deploy_json = data
                    console.log(deploy_json)
                    massage_name = deploy_json.message
                    console.log(massage_name)
                    invoke_time_now = (new Date()).getTime()+"_JS"
                    json_for_invoke = {
                      "jsonrpc": "2.0",
                      "method": "invoke",
                      "params": {
                        "type": 1,
                        "chaincodeID": {
                          "name": massage_name
                        },
                        "ctorMsg": {
                          "function": "write",
                          "args": [
                            ibm_invoke_comment_target+"_"+USER_ID+"_"+ibm_invoke_user_id,
                            invoke_time_now
                          ]
                        },
                        "secureContext": "WebAppAdmin"
                      },
                      "id": 0
                    }
                    $.ajax({
                      url: 'https://b76a12e4dee7402480365feb0cc3c626-vp0.us.blockchain.ibm.com:5001/chaincode',
                      type: 'POST',
                      dataType: 'text',
                      data: JSON.stringify(json_for_invoke),
                      success: function(data) {
                        invoke_json = data
                        console.log(invoke_json)
                        invoke_result = JSON.stringify(invoke_json.result)
                        console.log(invoke_json)
                        console.log(invoke_result)
                        $.ajax({
                          url: '/api/comment/submit_data',
                          type: 'POST',
                          dataType: 'json',
                          data: {
                            "app": 'hotpoor',
                            "aim_id": '0cd8429c1da249b6935d7eef72d7fc0b',
                            "user_id": '0cd8429c1da249b6935d7eef72d7fc0b',
                            // "content": "ibm_invoke\ncomment_target: "+ibm_invoke_comment_target+"\nuser: "+USER_ID+"\nnowner: "+ibm_invoke_user_id+" voice"+"\ncomment_target: "+ibm_invoke_comment_target+"\nmessage name:"+massage_name+"\nresult: "+invoke_result
                            "content": "ibm_invoke\ncomment_target: "+ibm_invoke_comment_target+"\nuser: "+USER_ID+"\nnowner: "+ibm_invoke_user_id+" voice"+"\ncomment_target: "+ibm_invoke_comment_target+"\nmessage name: "+"******"+"\nresult: "+"******"
                          },
                          success: function(data) {
                            alert("invoke success");
                            return console.log(data);
                          },
                          error: function(error) {
                            return console.log(error);
                          }
                        });
                      },
                      error: function(error) {
                      }
                    });
                  },
                  error: function(error) {
                  }
                });
              },
              error: function(error) {
                return console.log(error);
              }
            });
        }
      },
      error: function(error) {
        return console.log(error);
      }
    });
})

var radioEl = document.createElement('audio')
var radioEl_list =[]
radioEl.onended = function(){
    radioEl_list.shift()
    if(radioEl_list.length>0){
        radioEl.src = radioEl_list[0]
        if (web_recorder_now){

        }else{
            radioEl.play()
        }
    }
}

var audioEl = document.createElement('audio')
var $currEl = null 

audioEl.ontimeupdate = function () {
    setAudioStyle()
}
audioEl.onended = function () {
    resetAudioStyle()
    $currEl.removeClass('playing')
}

$(document).on('click', '.msg_content.audio', function (e) {
    $el = $(e.currentTarget)
    var src = $el.data('audio-src')
    var currSrc = audioEl.currentSrc

    if (src == currSrc) {
        if (audioEl.paused) {
            $el.addClass('playing')
            audioEl.play()
        } else {
            $el.removeClass('playing')
            audioEl.pause()
        }
    } else {
        if ($currEl) {
            $currEl.removeClass('playing')
            resetAudioStyle()
        }
        $currEl = $el
        $el.addClass('playing')
        audioEl.src = src
        audioEl.play()
    }
})


function setAudioStyle () {
    if (!isNaN(audioEl.duration)) {
        var t = parseInt(audioEl.duration - audioEl.currentTime)
        var w = parseInt(200 * audioEl.currentTime / audioEl.duration)
        $currEl.find('.msg_audio_time').text(t + '"')
        $currEl.find('.msg_audio_cover').css({'width': w + 'px'})
    }
}
function resetAudioStyle () {
    $currEl.find('.msg_audio_time').text(parseInt(audioEl.duration) + '"')
    $currEl.find('.msg_audio_cover').css({'width': '0'})
}


/**
 * Utils 工具函数
 */

function escapeHTML (str) {
    return $('<div></div>').text(str).html()
}

function formatDate_plus (now) {
    var comment_time_now, date, hour, minute, month, now_date, year;
    now_date = new Date(now * 1000);
    comment_time_now = new Date;
    year = now_date.getFullYear();
    month = now_date.getMonth() + 1;
    date = now_date.getDate();
    hour = now_date.getHours();
    minute = now_date.getMinutes();
    if (hour < 10) {
        hour = "0" + hour
    }
    if (minute < 10) {
        minute = "0" + minute
    }
    if (comment_time_now.getFullYear() === year && comment_time_now.getMonth() + 1 === month && comment_time_now.getDate() === date) {
        return "今天 "+hour + ":" + minute
    }
    if (comment_time_now.getFullYear() === year) {
        return month + "月" + date + "日 " + hour + ":" + minute
    }
    return year + "年" + month + "月" + date + "日 " + hour + ":" + minute
}
function formatDate (now) {
    var comment_time_now, date, hour, minute, month, now_date, year;
    now_date = new Date(now * 1000);
    comment_time_now = new Date;
    year = now_date.getFullYear();
    month = now_date.getMonth() + 1;
    date = now_date.getDate();
    hour = now_date.getHours();
    minute = now_date.getMinutes();
    if (hour < 10) {
        hour = "0" + hour
    }
    if (minute < 10) {
        minute = "0" + minute
    }
    if (comment_time_now.getFullYear() === year && comment_time_now.getMonth() + 1 === month && comment_time_now.getDate() === date) {
        return hour + ":" + minute
    }
    if (comment_time_now.getFullYear() === year) {
        return month + "月" + date + "日 " + hour + ":" + minute
    }
    return year + "年" + month + "月" + date + "日 " + hour + ":" + minute
}
function reload(){
    var msg = ['RELOAD', {"content":"HOME//CMD//RELOAD"}, initialRoomId]
    ws.send(JSON.stringify(msg))
}



//桌面提醒
function notify(title, content, iconUrl,_room_id) {
        //console.log(window.onfocus)
        if(!title && !content){
            title = "桌面提醒";
            content = "您看到此条信息桌面提醒设置成功";
        }
        if (iconUrl==undefined){
            iconUrl = "http://www.hotpoor.org/static/img/mmplus_logo.png"
        }
        
        if (window.webkitNotifications) {
            //chrome老版本
            if (window.webkitNotifications.checkPermission() == 0) {
                var notif = window.webkitNotifications.createNotification(iconUrl, title, content);
                notif.display = function() {}
                notif.onerror = function() {}
                notif.onclose = function() {}
                notif.onclick = function() {this.cancel();}
                notif.replaceId = 'Meteoric';
                notif.show();
            } else {
                window.webkitNotifications.requestPermission($jy.notify);
            }
        }else if("Notification" in window){
            // 判断是否有权限
            if (Notification.permission === "granted") {
                var notification = new Notification(title, {
                    "icon": iconUrl,
                    "body": content,
                });
                setTimeout(function() {
                    notification.close();
                }, 5000);
                notification.onclick = function(){
                    window.focus();
                    if(isExpanded){
                        if (targetRoomId!=_room_id){
                            $(".im_room_item[data-room-id='"+_room_id+"']").click()
                        }
                    }
                    notification.close();
                }
            }
            //如果没权限，则请求权限
            else if (Notification.permission !== 'denied') {
                Notification.requestPermission(function(permission) {
                    // Whatever the user answers, we make sure we store the
                    // information
                    if (!('permission' in Notification)) {
                        Notification.permission = permission;
                    }
                    //如果接受请求
                    if (permission === "granted") {
                        var notification = new Notification(title, {
                            "icon": iconUrl,
                            "body": content,
                        });
                        setTimeout(function() {
                            notification.close();
                        }, 5000);
                        notification.onclick = function(){
                            window.focus();
                            if(isExpanded){
                                if (targetRoomId!=_room_id){
                                    $(".im_room_item[data-room-id='"+_room_id+"']").click()
                                }
                            }
                            notification.close();
                        }
                    }
                });
            }
        }
    }
if("Notification" in window){
    Notification.requestPermission(function(permission) {
        if (!('permission' in Notification)) {
            Notification.permission = permission;
        }
        // if (permission != "granted") {
        //     notify("MMPLUS通知","已成功开启浏览器提醒","http://www.hotpoor.org/static/img/mmplus_logo.png","")
        // }
    });
}
// 电脑端从粘贴板中截图上传
$("body").on("paste", ".im_edit_content", function(evt) {
  var blob, reader, t, _room_id;
  if ((evt.originalEvent || evt).clipboardData.types[0] === "Files") {
    t = (evt.originalEvent || evt).clipboardData;
    if (t.items[0].kind === "file" && t.items[0].type.match(/^image\//i)) {
      blob = t.items[0].getAsFile();
      reader = new FileReader();
      _room_id = targetRoomId;
      reader.onload = function() {
        var uploadFile;
        uploadFile = function(file) {
          var endingByte, file_index, file_lists, files, startingByte, tempfile, type, updateProgress, uploadNextFile, xhrProvider;
          file_lists = [];
          files = file;
          file_lists.push(files);
          file_index = 0;
          startingByte = 0;
          endingByte = 0;
          type = file.type ? file.type : 'n/a';
          reader = new FileReader();
          tempfile = null;
          startingByte = 0;
          xhrProvider = function() {
            var xhr;
            xhr = jQuery.ajaxSettings.xhr();
            if (xhr.upload) {
              xhr.upload.addEventListener('progress', updateProgress, false);
            }
            return xhr;
          };
          updateProgress = function(evt) {
            return console.log("Uploading file " + (file_index + 1) + " of " + files.length + " at " + ((startingByte + (endingByte - startingByte) * evt.loaded / evt.total) / file.size * 100) + "%");
          };
          uploadNextFile = function() {
            file_index += 1;
            if (file_index < files.length) {
              return uploadFile(files[file_index]);
            } else {
              file_lists.shift();
              if (file_lists.length > 0) {
                file_index = 0;
                files = file_lists[0];
                return uploadFile(files[file_index]);
              }
            }
          };
          reader.onload = function(evt) {
            var bin, content, worker;
            content = evt.target.result.slice(evt.target.result.indexOf("base64,") + 7);
            bin = atob(content);
            worker = new Worker("/static/js/md5.js");
            worker.onmessage = function(event) {
              var Qiniu_UploadUrl, Qiniu_UploadUrl_https, md5;
              md5 = event.data;
              Qiniu_UploadUrl_https = "https://up.qbox.me";
              if (window.location.protocol === "https:") {
                Qiniu_UploadUrl = Qiniu_UploadUrl_https;
              } else {
                Qiniu_UploadUrl = "http://up.qiniu.com";
              }
              return $.post("/api/image/check", {
                "aim_id": _room_id,
                "md5": md5
              }, function(data) {
                var Qiniu_upload, upload_token;
                if (files.length === 1) {
                  if (data["exists"]) {
                    return;
                  }
                } else {
                  if (file_index + 1 === files.length) {
                    if (data["exists"]) {
                        console.log("file_index+1 == files.length");
                        return;
                    }
                  } else {
                    if (data["exists"]) {
                        console.log("md5 already")
                        content = "HQWEBIMG//" + md5;
                        return $.ajax({
                          url: '/api/comment/submit',
                          type: 'POST',
                          dataType: 'json',
                          data: {
                            "app": WX_APP,
                            "aim_id": _room_id,
                            "content": content
                          },
                          success: function(data) {
                            return console.log(data);
                          },
                          error: function(error) {
                            return console.log(error);
                          }
                        });
                        // return uploadNextFile();
                    }
                  }
                }
                upload_token = data["token"];
                Qiniu_upload = function(f, token, key) {
                  var formData, startDate, xhr;
                  xhr = new XMLHttpRequest();
                  xhr.open('POST', Qiniu_UploadUrl, true);
                  formData = new FormData();
                  if (key !== null && key !== void 0) {
                    formData.append('key', key);
                  }
                  formData.append('token', token);
                  formData.append('file', f);
                  xhr.upload.addEventListener("progress", function(evt) {
                    var formatSpeed, nowDate, percentComplete, taking, uploadSpeed, x, y;
                    if (evt.lengthComputable) {
                      nowDate = new Date().getTime();
                      taking = nowDate - startDate;
                      x = evt.loaded / 1024;
                      y = taking / 1000;
                      uploadSpeed = x / y;
                      if (uploadSpeed > 1024) {
                        formatSpeed = (uploadSpeed / 1024).toFixed(2) + "Mb\/s";
                      } else {
                        formatSpeed = uploadSpeed.toFixed(2) + "Kb\/s";
                      }
                      percentComplete = Math.round(evt.loaded * 100 / evt.total);
                      // $('.image_wait[data-md5=' + md5 + ']').find('span').text('图片正在上传... ' + percentComplete + '%')
                      updateWaitingMessage(_room_id, 'image', md5, percentComplete)
                      return console.log(percentComplete, ",", formatSpeed);
                    }
                  }, false);
                  xhr.onreadystatechange = function(response) {
                    var blkRet;
                    if (xhr.readyState === 4 && xhr.status === 200 && xhr.responseText !== "") {
                      blkRet = JSON.parse(xhr.responseText);
                      return $.post("/api/image/add", {
                        "aim_id": _room_id,
                        "md5": md5
                      }, function() {
                        content = "HQWEBIMG//" + md5;
                        $.ajax({
                          url: '/api/comment/submit',
                          type: 'POST',
                          dataType: 'json',
                          data: {
                            "app": WX_APP,
                            "aim_id": _room_id,
                            "content": content
                          },
                          success: function(data) {
                            return console.log(data);
                          },
                          error: function(error) {
                            return console.log(error);
                          }
                        });
                        return uploadNextFile();
                      });
                    }
                  };
                  startDate = new Date().getTime();
                  addWaitingMessage(_room_id, 'image', md5)
                  // image_upload_wait_html = '<div class="msg_self image_wait" data-md5="'+md5+'"><span>图片正在上传...</span></div>'
                  // $(".room[data-room-id='"+_room_id+"']>.room_card").append(image_upload_wait_html)
                  // $('.room[data-room-id=' + _room_id + ']').stop().animate({"scrollTop":$(".msg_self.image_wait[data-md5='"+md5+"']")[0].offsetTop})
                  return xhr.send(formData);
                };
                return Qiniu_upload(file, upload_token, _room_id + "_" + md5);
              });
            };
            return worker.postMessage(bin);
          };
          return reader.readAsDataURL(file);
        };
        return uploadFile(blob);
      };
      return reader.readAsDataURL(blob);
    }
  }
});


like_weixin_audio_now = false
$("body").on("mousedown",".like_weixin_audio",function(e){
    console.log("like_weixin_audio_now:"+like_weixin_audio_now);
    if (like_weixin_audio_now){
        //like_weixin_audio_now=false
    }else{
        $(this).addClass("like_weixin_audio_here")
        like_weixin_audio_now = true
        web_start_record_Audio1();
    }
});

$(window).on("mouseup",function(e){
    if (like_weixin_audio_now){
        $(".like_weixin_audio").removeClass("like_weixin_audio_here")
        web_stop_record_Audio1();
    }
    like_weixin_audio_now=false;
});

var recorder1 = null
$(window).on("load",function(){
    recorder1 = new Recorder({
        sampleRate: 44100, //采样频率，默认为44100Hz(标准MP3采样率)
        bitRate: 128, //比特率，默认为128kbps(标准MP3质量)
        success: function(){ //成功回调函数
            // start.disabled = false;
            $(".like_weixin_audio").css({"background":"green"})
        },
        error: function(msg){ //失败回调函数
            alert(msg);
        },
        fix: function(msg){ //不支持H5录音回调函数
            alert(msg);
        }
    });

});

function web_start_record_Audio1(){
    recorder1.start();
}

function web_stop_record_Audio1(){
    recorder1.stop();
    recorder1.getBlob(function(blob){
        // url = URL.createObjectURL(blob);

        console.log(URL.createObjectURL(blob))
        



        send_audio_1(blob);
    });
}

function send_audio_1(blob){

        reader = new FileReader()
        reader.onload = function (e) {
            var radio_result;
            if(e.target.readyState == FileReader.DONE){
                radio_result = e.target.result
                msg = ["RADIO", {
                    "content": "RADIO",
                    "nickname": "xialiwei",
                    "headimgurl": USER_HEADIMGURL,
                    "tel": "15201950688",
                    "time": (1000/1000),
                    "user_id": USER_ID,
                    "sequence": "",
                    "comment_id": "",
                    "src":radio_result,
                }, targetRoomId]
                console.log(msg)
                ws.send(JSON.stringify(msg))
            }
        }
        reader.readAsDataURL(blob)
}

$("body").on("click",".xc_action",function(){
    dom = $(this)
    value = dom.attr("data-value")
    action = dom.attr("data-action")
    msg = ["CMDXC", {
        "content": "[\""+value+"\",\""+action+"\"]",
        "nickname": "xialiwei",
        "headimgurl": USER_HEADIMGURL,
        "tel": "15201950688",
        "user_id": USER_ID,
        "sequence": "",
        "comment_id": "",
        "value":value,
        "action":action,
    }, targetRoomId]
    console.log(msg)
    ws.send(JSON.stringify(msg))
})


