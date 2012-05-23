
String.prototype.clear = function() {
	return this.trim().replace(/\s+/g, ' ');
}

var ce = chrome.extension;
ce.connect({ name: 'popup' });
(ce.onMessage || ce.onRequest).addListener(onMessage);
ce.sendMessage = ce.sendMessage || ce.sendRequest;

var bg_win = ce.getBackgroundPage();
var Ripple = bg_win.Ripple;
var Deferred = bg_win.Deferred;
var lscache = bg_win.lscache;
var Share = bg_win.Share;

var bd_style = {};
bd_style = document.defaultView.getComputedStyle(document.body, null);
cacheSize();

var w = window;
var $ = document.getElementById.bind(document);
var $$ = document.querySelectorAll.bind(document);
var log = console.log.bind(console);
var de = document.documentElement;
var html_style = document.defaultView.getComputedStyle(de, null);

var min_height = Share.defaultStyle.minContentHeight;

var resizing = false;
var delta = 0;

var data = {};

var http_s_url = "https?://(((((([0-9a-zA-Z])(([0-9a-zA-Z])|-)*([0-9a-zA-Z])|([0-9a-zA-Z]))\\.)*(([a-zA-Z])(([0-9a-zA-Z])|-)*([0-9a-zA-Z])|([a-zA-Z])))|([0-9]+)\\.([0-9]+)\\.([0-9]+)\\.([0-9]+))(:([0-9]+)){0,1})(/(((([0-9a-zA-Z]|(\\$|-|_|\\.|\\+)|(!|\\*|'|\\(|\\)|,))|(%([0-9a-fA-F])([0-9a-fA-F])))|;|:|@|&|=)*)(/(((([0-9a-zA-Z]|(\\$|-|_|\\.|\\+)|(!|\\*|'|\\(|\\)|,))|(%([0-9a-fA-F])([0-9a-fA-F])))|;|:|@|&|=)*))*(\\?(((([0-9a-zA-Z]|(\\$|-|_|\\.|\\+)|(!|\\*|'|\\(|\\)|,))|(%([0-9a-fA-F])([0-9a-fA-F])))|;|:|@|&|=)*))?)?(#[0-9a-zA-Z-#!/\|:\+]*)?";
var ftp_url = "ftp://(((((([0-9a-zA-Z]|(\\$|-|_|\\.|\\+)|(!|\\*|'|\\(|\\)|,))|(%([0-9a-fA-F])([0-9a-fA-F])))|;|\\?|&|=)*)(:(((([0-9a-zA-Z]|(\\$|-|_|\\.|\\+)|(!|\\*|'|\\(|\\)|,))|(%([0-9a-fA-F])([0-9a-fA-F])))|;|\\?|&|=)*)){0,1}@){0,1}(((((([0-9a-zA-Z])(([0-9a-zA-Z])|-)*([0-9a-zA-Z])|([0-9a-zA-Z]))\\.)*(([a-zA-Z])(([0-9a-zA-Z])|-)*([0-9a-zA-Z])|([a-zA-Z])))|([0-9]+)\\.([0-9]+)\\.([0-9]+)\\.([0-9]+))(:([0-9]+)){0,1}))(/((((([0-9a-zA-Z]|(\\$|-|_|\\.|\\+)|(!|\\*|'|\\(|\\)|,))|(%([0-9a-fA-F])([0-9a-fA-F])))|\\?|:|@|&|=)*)(/(((([0-9a-zA-Z]|(\\$|-|_|\\.|\\+)|(!|\\*|'|\\(|\\)|,))|(%([0-9a-fA-F])([0-9a-fA-F])))|\\?|:|@|&|=)*))*)(;type=(A|I|D|a|i|d))?)?";
var url_patt = '(' + http_s_url + ')|(' + ftp_url + ')';
var url_re = new RegExp(url_patt, 'g');
var url_max_len = 25;
var url_placeholder = 'http://is.gd/xxxxxx';

function forEach(arr, func, context) {
	return Array.prototype.forEach.call(arr, func, context);
}

var full_width = html_style.width;

var wrapper = $('wrapper');
var main = $('main');
var inner = $('inner');

var progress_bar = $('progress');

var inputarea = $('inputArea');
var show = $('showArea');
var pic = $('pic');

var button = $('button');
var counter = $('counter');

var error = $('error');
var options = $('options');
var about = $('about');
var reset = $('reset');
var inquiry = $('inquiry');
var reset_inner = $('resetInner');

var show_options = $('showOptions');
var show_about = $('showAbout');
var logout_btn = $('logout');
var hide_btns = $$('.hide');

var template_type = $('templateType');
var template_code = $('templateCode');
var available_keys = $('availableKeys');

template_type.onchange = function(e) {
	var templates = getTemplates();
	template_code.value = templates[this.value];
	template_code.default = bg_win.settings.default.templates[this.value];
}

template_code.onchange = template_code.onkeydown = throttle(function(e) {
	if (this.value == this.default) return;
	if (! this.value.length) this.value = this.default;
	var settings = { templates: {} };
	settings.templates[template_type.value] = template_code.value;
	Share.setSettings(settings);
}, 40);

available_keys.onchange = function(e) {
	if (this.value == '___') return;
	template_code.value += ' $' + this.value;
	this.value = '___';
	template_code.onchange.call(template_code);
}

inner.style.minHeight = min_height + 'px';
inner.style.maxHeight = Share.defaultStyle.maxContentHeight + 'px';

progress_bar.style.width = full_width;

inputarea.oninput = adjustSize;
inputarea.onkeyup = throttle(count, 100);
inputarea.onkeydown = throttle(function(e) {
	if (e.ctrlKey && e.keyCode === 13) {
		button.click();
	}
}, 100);
button.onclick = submit;

forEach(hide_btns, function(hide_btn) {
	hide_btn.onclick = function(e) {
		var elem = this.parentElement;
		elem.classList.remove('focusInFromBottom');
		elem.classList.add('focusOutFromTop');
		setTimeout(function() {
			elem.style.display = 'none';
		}, 150);
		if (e) {
			e.preventDefault();
			e.stopPropagation();
		}
	}
});

[
	[show_options, options],
	[show_about, about],
	[logout_btn, reset]
].forEach(function(iterator) {
	iterator[0].addEventListener('click', function(e) {
		showOverlay(iterator[1]);
	}, false);
});
logout_btn.addEventListener('click', switchAccount, false);

$('userName').textContent = Share.account.screen_name;
$('avatar').src = Share.account.profile_image_url;

var enable_mouse_action = $('enableMouseAction');
var mouse_action = $('mouseAction');
var ctrl_key = $('ctrlKey');
var acting = false;
show_options.addEventListener('click', function(e) {
	acting = true;

	var settings = Share.getSettings();
	template_type.onchange.call(template_type);

	enable_mouse_action.checked = settings.enableGesture || settings.enableMidButton;
	mouse_action.value = settings.enableMidButton ? 'clickMiddleButton' : 'rightButtonDrag';
	ctrl_key.checked = settings.ctrlKey;

	acting = false;
}, false);
options.onchange = function(e) {
	if (acting) return;
	var enable = enable_mouse_action.checked;
	Share.setSettings({
		enableGesture: enable && mouse_action.value == 'rightButtonDrag',
		enableMidButton: enable && mouse_action.value == 'clickMiddleButton',
		ctrlKey: ctrl_key.checked
	});
}


function throttle(func, delay) {
	var timeout, context, args;
	return function() {
		context = this;
		args = arguments;
		clearTimeout(timeout);
		timeout = setTimeout(function() {
			func.apply(context, args);
		}, delay);
	}
}

function cacheSize(callback) {
	document.body.className = 'default';
	delta = Share.defaultStyle.winHeight - parseInt(bd_style.height);
	document.body.removeAttribute('class');
}

var onAdjustSize = throttle(function() {
	var _delta = de.offsetHeight - de.clientHeight;
	if (_delta) {
		Share.defaultStyle.winHeight += _delta;
		cacheSize();
		adjustSize();
	}
}, 200);

var onSizeAdjusted = throttle(function() {
	resizing = false;
}, 32);

// 根据页面高度调整窗口大小
function adjustSize(e) {
	resizing = true;
	if (wrapper.offsetHeight != wrapper.clientHeight) {
		cacheSize();
	} else {
		w.resizeTo(Share.defaultStyle.winWidth, delta + parseInt(bd_style.height));
    onAdjustSize();
	}
	onSizeAdjusted();
}

function adjustSizeForPic() {
	function callback() {
		pic.parentElement.classList.add('imgLoaded');
		
		// 调整输入框尺寸
		var pic_height = pic.parentElement.offsetHeight;
		min_height = Math.max(pic_height, min_height);
		inner.style.minHeight = min_height + 'px';
		adjustSize();

		// 给图片添加图片尺寸/文件大小信息
		var h = pic.naturalHeight;
		var w = pic.naturalWidth;
		if (h && w) {
			pic.parentElement.title = w + '×' + h;
			var size = data.img_data.size;
			if (size) {
				var units = ['', 'K', 'M', 'G', 'T'];
				while (size / 1024 >= .75) {
					size = size / 1024;
					units.shift();
				}
				size = Math.round(size * 10) / 10 + units[0] + 'B';
				pic.parentElement.title += '@' + size;
			}
		}
	}
	// 等待图片加载完毕
	if (pic.complete) {
		callback();
	} else {
		pic.onload = callback;
		pic.onerror = function() {
			showError('图片加载失败, 操作无法继续.', true);
		}
	}
}

function showOverlay(ol) {
	ol.style.display = 'block';
	ol.classList.remove('focusOutFromTop');
	ol.classList.add('focusInFromBottom');
}

function showInquiry(msg, ok, ng) {
	$('inquiryMsg').textContent = msg;
	$('inquiryOK').onclick = ok;
	$('inquiryNG').onclick = ng;
	showOverlay(inquiry);
}

function showError(msg, mode) {
	Share.playSound();
	focusOnPopup();
	$('errorMsg').innerHTML = msg;
	showOverlay(error);
	if (mode) {
		error.querySelector('.hide').style.display = 'none';
	}
}

function count(e) {
	var length = counter.textContent = 140 - inputarea.textContent.replace(url_re, function(url) {
		return url.length > url_max_len ? url_placeholder : url;
	}).length;
	counter.className = length < 0 ? 'error' : length < 15 ? 'warn' : '';
}

function enableButton() {
	inputarea.setAttribute('contenteditable', 'true');
	button.title = '分享';
	button.textContent = 'Share!';
	button.disabled = false;
	button.className = '';
}

function disableButton(text, title) {
	inputarea.removeAttribute('contenteditable');
	button.disabled = true;
	button.classList.add('disabled');
	button.title = title || '';
	button.textContent = text;
}

function select(start, end) {
	var range = document.createRange();
	var node = inputarea.childNodes[0];
	if (! node) {
		node = document.createTextNode('');
		inputarea.appendChild(node);
	}
	range.setStart(node, start);
	range.setEnd(node, end);

	var selection = w.getSelection();
	selection.removeAllRanges();
	selection.addRange(range);
}

function collaposeSelec() {
	var length = inputarea.textContent.length;
	select(length, length);
}

function submit() {
  if (button.disabled) return;

	button.classList.add('loading');
	progress_bar.value = 0;

	setContent(inputarea.textContent);

	shorten().
	next(post).
	next(closePopup).
	error(function(e) {
		var error = e.status ?
			'连接 ' +
			e.url +
			' 时发生 ' +
			e.status +
			' 错误:<br />' +
			e.exceptionType +
			' / ' +
			e.statusText
			:
			e.exceptionType +
			' / 请检查网络连接.';
		showError(error);
		console.log(e)
		enableButton();
	}).
	hold(function() {
		button.classList.remove('loading');
	});
}

function shorten(links, force) {
	disableButton('Shortening..', '正在缩短网址');

	var result = w.result = links || inputarea.textContent.match(url_re) || [];
	var dl = [];
	var ignored = [];

	[].forEach.call(result, function(link) {
		if (link.length <= url_max_len) {
			if (! force && link.length > url_placeholder.length) {
				ignored.push(link);
				return;
			}
			if (! force) return;
		}
		var d = Ripple.shorten['is.gd'](link).hold(log).
			next(function(short_url) {
				//console.log('long: ' + link + '\nshort: ' + short_url);
				setContent(inputarea.textContent.replace(link, short_url));
			}).
			error(function(e) {
				if (e && ! e.status) {
					ignored.push(link);
				}
			});
		dl.push(d);
	});
	dl = Deferred.parallel(dl);
	dl = dl.next(function() {
		if (inputarea.textContent.length <= 140) return;
		if (ignored.length) {
			return shorten(ignored, true);
		}
		var d = new Deferred;
		var msg = '字数超过 140 字, 如果直接发送, 消息将被截断. 确定要这样做吗?';
		var ng = function() {
			$$('.hide')[0].onclick.call(inquiry.children[0]);
			enableButton();
		}
		showInquiry(msg, d.call.bind(d), ng);
		return d;
	});
	return dl;
}

function test() {
	return shorten().next(function(){alert('test');}).next(enableButton);
}

function post() {
	var params = { status: inputarea.textContent };
	var img_data = data.img_data;
	if (img_data) params.photo = img_data;

	var ajax_options = {
		timeout: img_data ? 90000 : 15000,
		onstart: function() {
			adjustSize();
			disableButton('Submitting..', '正在提交..');
			if (img_data) {
				progress_bar.style.display = 'block';
			}
		},
		onprogress: function(e) {
			if (! img_data || ! e.lengthComputable) return;
			var progress = e.loaded / e.total;
			progress_bar.value = progress * 100;
			document.title = '有饭同享 (' + Math.floor(progress * 100) + '%)';

			if (progress > 0.33 && progress <= 0.66)
				progress_bar.className = 'b';
			else if (progress > 0.66)
				progress_bar.className = 'c';
			else
				progress_bar.className = 'a';
		},
		oncomplete: function() {
			progress_bar.style.display = 'none';
		}
	};

	return Share.user[img_data ? 'postPhoto' : 'postStatus'](params).setupAjax(ajax_options);
}

function processData() {
	var text = document.createTextNode('');
	for (var key in data) {
		data[key] = data[key] || '';
		if (data[key]) {
			text.textContent = data[key];
			data[key] = text.textContent.clear();
		} else {
			data[key] = '';
		}
	}
}

function processImage() {
	show.style.display = 'block';
	var img_url = data.img_url;

	if (Ripple.helpers.isString(img_url) &&
		img_url.indexOf('data:image/') === 0) {
		pic.src = img_url;
		adjustSizeForPic();
		Ripple.helpers.buildPhotoBlob(img_url).
		next(function(blob) {
			data.img_data = blob;
			enableButton();
		});
	} else {
		if (Ripple.helpers.type(img_url) != 'object') {
			disableButton('Loading..', '加载');
		}
	}
}

function getTemplates() {
	return Share.getSettings().templates;
}

function applyTemplate() {
	if (data.type == 'status') {
		setContent(data.status);
		collaposeSelec();
		return;
	}

	template_type.value = data.type;

	var template = getTemplates()[data.type];
	var keys = bg_win.settings.keys;

	template = template.replace(/(?:\$([a-z_]+)\|)+\$([a-z_]+)/g, function() {
		var found_keys = [].slice.call(arguments, 1);
		var result;
		var key;
		for (var i = 0; i < found_keys.length; i++) {
			key = found_keys[i];
			if (keys.indexOf(key) > -1 && data[key]) {
				result = '$' + key;
				break;
			}
		}
		return result || '';
	});

	var selected_text = '';
	var result = template.replace(/#?\$([a-z_]+)#?/g, function(str, key) {
		var result = data[key] || '';
		if (str[0] == '#' && str[str.length-1] == '#') {
			selected_text = result;
		}
		return result;
	});

	setContent(result);
	result = inputarea.textContent;

	var start, end;
	if (! selected_text) {
		start = end = result.length;
	} else {
		start = result.indexOf(selected_text);
		end = start + selected_text.length;
	}
	select(start, end);
}

function setContent(content) {
	inputarea.textContent = content.clear();
	count();
	adjustSize();
}

function buildPhotoBlob(msg) {
	var utf8_string = msg.img_data;
	var content_type = msg.img_type;

	var byte_array = new Uint8Array(utf8_string.length);
	for (var i = 0, len = utf8_string.length; i < len; i++) {
		byte_array[i] = utf8_string.charCodeAt(i) & 0xff;
	}

	var bb = new (w.BlobBuilder || w.WebKitBlobBuilder);
	bb.append(byte_array.buffer);

	var blob = content_type ? bb.getBlob(content_type) : bb.getBlob();
	data.img_data = blob;

	var fr = new FileReader;
	fr.onload = function() {
		pic.src = fr.result;
		adjustSizeForPic();
		enableButton();
	}
	fr.readAsDataURL(blob);
}

function onMessage(req, sender, response) {
	if (req.type === 'post_details') {
		Ripple.helpers.defaults(data, req.msg);

		processData();
		applyTemplate();

		if (data.type == 'image') {
			processImage();
		}
	}
	else if (req.type === 'update_photo') {
		var msg = req.msg;
		if (! msg.img_data) {
			showError('图片加载失败, 操作无法继续.', true);
		} else {
			buildPhotoBlob(msg);
		}
	}
}

function closePopup() {
	ce.sendMessage({
		type: 'close_this_tab'
	});
}

function focusOnPopup() {
	if ((document.webkitVisibilityState || document.visibilityState) === 'visible') return;
	ce.sendMessage({
		type: 'focus_on_this_window'
	});
}

function switchAccount() {
	Deferred.next(function() {
		reset_inner.innerHTML = '<p>正在检查, 请稍等..</p>';
		return Ripple.ajax.get('http://m.fanfou.com/');
	}).
	next(function(html) {
		var re = /1<a href="\/([^"]+)"[^>]+accesskey="1">空间<\/a>/i;
		var result = (html + '').match(re);
		var current_id; // 在饭否登录的账号 ID
		var code = '';

		code = '<p>请先登录您想要切换到的账号, 之后完成验证操作.</p>';

		if (result) {
			current_id = decodeURIComponent(result[1]);
			var current_name = html.match(/<title> 饭否 \| 欢迎你，(.+)<\/title>/)[1];
			code += '<p>';
			code += '当前登录: <strong>' + current_name + '</strong>, ';
			code += current_id == Share.account.id ?
				'已通过验证.' : '已通过验证: ' + '<strong>' + Share.account.screen_name + '</strong>.';
			code += '</p>';
			if (current_id != Share.account.id) {
				code += '<p>若不希望切换到<strong>' + current_name + '</strong>, 请先 ';
			}
			code += '<button id="logoutFF">登出</button><span class="arrow">&raquo;</span>';
		}
		code += '<button id="login">登录</button>';
		code += (current_id && current_id != Share.account.id) ?
			'</p>' : '<span class="arrow">&raquo;</span>';
		code += '<button id="authorize">验证</button>';

		reset_inner.innerHTML = code;

		($('logoutFF') || {}).onclick = function() {
			var logout_btn = this;
			if (logout_btn.classList.contains('disabled')) return;
			var url = 'http://m.fanfou.com' + html.match(/<a href="(\/logout\/[^"]+)">/)[1];
			Ripple.ajax(url, {
				onstart: function() {
					logout_btn.classList.add('disabled');
					logout_btn.textContent = '...';
				},
				success: function() {
					logout_btn.textContent = '已登出';
					logout_btn.onclick = null;
				},
				error: function() {
					logout_btn.textContent = '登出';
					logout_btn.classList.remove('busy');
				}
			});
		}

		$('login').onclick = function() {
			Share.showLogin();
		}

		$('authorize').onclick = function() {
			Share.reset();
			Share.closeAllPopup();
		}
	}).
	error(function(e) {
		reset_inner.innerHTML = '发生致命错误, 操作无法继续.';
	});
}

var fixSize = throttle(function() {
	// 修正
	resizing = true;
	if (delta < 10 || delta > 35) {
		cacheSize();
	} else {
		w.resizeTo(Share.defaultStyle.winWidth, delta + parseInt(html_style.height));
	}
	resizing = false;
}, 32)

// 阻止用户调整窗口大小
w.addEventListener('resize', function(e) {
	// resizing 为真表示程序正在调整窗口大小, 忽略
	if (resizing) return;
	fixSize();
}, false);

w.addEventListener('paste', function (e) {
	if (! /text\/html/.test(e.clipboardData.types)) return;
	e.preventDefault();

	var div = document.createElement('div');
	div.innerHTML = e.clipboardData.getData('text/html');
	var text = div.textContent.clear();

	var selection = w.getSelection();
	var node = selection.focusNode;

	if (! node || ! inputarea.contains(node)) return;

	if (selection.toString().length) {
		selection.deleteFromDocument();
		if (! inputarea.textContent.length) {
			inputarea.innerHTML = '';
			inputarea.appendChild(document.createTextNode(''));
			select(0, 0);
		}
		selection = w.getSelection();
		node = selection.focusNode;
	}

	var offset = selection.focusOffset;
	var origin = node.textContent;

	if (! inputarea.childNodes.length) {
		inputarea.textContent = text;
	} else {
		node.textContent = origin.substring(0, offset) + text + origin.substring(offset);
		node = node.childNodes[0] || node;
	}

	adjustSize();
	count();

	if (node === inputarea) {
		node = inputarea.childNodes[0];
	}

	var range = document.createRange();
	var pos = offset + text.length;
	range.setStart(node, pos);
	range.setEnd(node, pos);

	selection.removeAllRanges();
	selection.addRange(range);
}, false);
