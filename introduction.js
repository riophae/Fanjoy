var $ = document.getElementById.bind(document);
var $$ = function(rule, elem) {
	return (elem || document).querySelectorAll(rule);
}

var bg_win = chrome.extension.getBackgroundPage();
var Ripple = bg_win.Ripple;
var Fanjoy = bg_win.Fanjoy;

(function() {
	var range = document.createRange();
	var text = $('selected').childNodes[0];
	var keyword = '一段文字';
	var start_pos = text.textContent.indexOf(keyword);
	range.setStart(text, start_pos);
	range.setEnd(text, start_pos + keyword.length);
	window.getSelection().addRange(range);
})();

var wrapper = $('wrapper');

var check_interval = setInterval(function() {
	if (! Fanjoy.user) return;
	clearInterval(check_interval);

	var status = $$('h3 .comment')[0];
	status.style.color = 'green';
	status.textContent = '已完成初始化.';

	getSettings();
}, 16);

function shareMessage(e, msg) {
	setCursorPos(e);
	var port = new Port;
	port.postMessage('post_details', {
		type: 'status',
		status: msg
	});
}

$('feedback').addEventListener('click', function(e) {
	shareMessage(e, '@锐风 我发现了有饭同享的一个问题:');
}, false);

$('recommend').addEventListener('click', function(e) {
	shareMessage(e, '我正在用 @锐风 开发的有饭同享, 很赞的 Chrome 扩展! 分享网页/图片非常方便! http://is.gd/fanjoy');
}, false);

if (is_mac_os) {
	document.body.classList.add('mac');
}