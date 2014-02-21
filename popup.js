
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
var Fanjoy = bg_win.Fanjoy;

var ajax;

var bd_style = {};
bd_style = document.defaultView.getComputedStyle(document.body, null);

var w = window;
var $ = document.getElementById.bind(document);
var $$ = document.querySelectorAll.bind(document);
var log = console.log.bind(console);
var noop = function() {};
var de = document.documentElement;
var html_style = document.defaultView.getComputedStyle(de, null);
var is_windows = navigator.platform.indexOf('Win32') > -1;

var min_height = Fanjoy.defaultStyle.minContentHeight;

var resizing = false;
var delta = 0;

var data = {};

var http_s_url = "https?://(((((([0-9a-zA-Z])(([0-9a-zA-Z])|-)*([0-9a-zA-Z])|([0-9a-zA-Z]))\\.)*(([a-zA-Z])(([0-9a-zA-Z])|-)*([0-9a-zA-Z])|([a-zA-Z])))|([0-9]+)\\.([0-9]+)\\.([0-9]+)\\.([0-9]+))(:([0-9]+)){0,1})(/(((([0-9a-zA-Z]|(\\$|-|_|\\.|\\+)|(!|\\*|'|\\(|\\)|,))|(%([0-9a-fA-F])([0-9a-fA-F])))|;|:|@|&|=)*)(/(((([0-9a-zA-Z]|(\\$|-|_|\\.|\\+)|(!|\\*|'|\\(|\\)|,))|(%([0-9a-fA-F])([0-9a-fA-F])))|;|:|@|&|=)*))*(\\?(((([0-9a-zA-Z]|(\\$|-|_|\\.|\\+)|(!|\\*|'|\\(|\\)|,))|(%([0-9a-fA-F])([0-9a-fA-F])))|;|:|@|&|=)*))?)?(#[0-9a-zA-Z-=#!/\|:\+%_]*)?";
var ftp_url = "ftp://(((((([0-9a-zA-Z]|(\\$|-|_|\\.|\\+)|(!|\\*|'|\\(|\\)|,))|(%([0-9a-fA-F])([0-9a-fA-F])))|;|\\?|&|=)*)(:(((([0-9a-zA-Z]|(\\$|-|_|\\.|\\+)|(!|\\*|'|\\(|\\)|,))|(%([0-9a-fA-F])([0-9a-fA-F])))|;|\\?|&|=)*)){0,1}@){0,1}(((((([0-9a-zA-Z])(([0-9a-zA-Z])|-)*([0-9a-zA-Z])|([0-9a-zA-Z]))\\.)*(([a-zA-Z])(([0-9a-zA-Z])|-)*([0-9a-zA-Z])|([a-zA-Z])))|([0-9]+)\\.([0-9]+)\\.([0-9]+)\\.([0-9]+))(:([0-9]+)){0,1}))(/((((([0-9a-zA-Z]|(\\$|-|_|\\.|\\+)|(!|\\*|'|\\(|\\)|,))|(%([0-9a-fA-F])([0-9a-fA-F])))|\\?|:|@|&|=)*)(/(((([0-9a-zA-Z]|(\\$|-|_|\\.|\\+)|(!|\\*|'|\\(|\\)|,))|(%([0-9a-fA-F])([0-9a-fA-F])))|\\?|:|@|&|=)*))*)(;type=(A|I|D|a|i|d))?)?";
var url_patt = '(' + http_s_url + ')|(' + ftp_url + ')';
var url_re = new RegExp(url_patt, 'g');
var url_max_len = 35;
var url_placeholder = 'http://is.gd/xxxxxx';

function forEach(arr, func, context) {
	return Array.prototype.forEach.call(arr, func, context);
}

var wrapper = $('wrapper');
var main = $('main');
var inner = $('inner');

var progress = $('progress');
var progress_bar = $('progress-bar');

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

var template_type_onchange = function(e) {
	var templates = getTemplates();
	template_code.value = templates[this.value];
	template_code.default = bg_win.settings.default.templates[this.value];
}
template_type.addEventListener('change', template_type_onchange, false);

var template_code_listener = throttle(function(e) {
	if (! this.value.length) this.value = this.default;
	var settings = { templates: getTemplates() };
	settings.templates[template_type.value] = template_code.value;
	Fanjoy.setSettings(settings);
}, 40);

template_code.addEventListener('change', template_code_listener, false);
template_code.addEventListener('input', template_code_listener, false);

available_keys.addEventListener('change', function(e) {
	if (this.value == '___') return;
	var text = '$' + this.value;
	var start = template_code.selectionStart,
		end = template_code.selectionEnd;
	template_code.value = template_code.value.substring(0, start) +
		text + template_code.value.substring(end, template_code.value.length);
	template_code.selectionStart = template_code.selectionEnd = start + text.length;

	this.value = '___';
	template_code_listener.call(template_code);
}, false);

inner.style.minHeight = min_height + 'px';
inner.style.maxHeight = Fanjoy.defaultStyle.maxContentHeight + 'px';

inputarea.addEventListener('input', onresize, false);
inputarea.addEventListener('keyup', throttle(count, 100), false);
inputarea.addEventListener('keydown', throttle(function(e) {
	if (e.ctrlKey && e.keyCode === 13) {
		button.click();
	}
}, 100), false);
wrapper.addEventListener('dblclick', submit, false);
button.addEventListener('click', submit, false);

var hide_btn_onclick = function(e) {
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
forEach(hide_btns, function(hide_btn) {
	hide_btn.addEventListener('click', hide_btn_onclick, false);
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

$('userName').textContent = Fanjoy.account.screen_name;
$('avatar').src = Fanjoy.account.profile_image_url;

var enable_mouse_action = $('enableMouseAction');
var mouse_action = $('mouseAction');
var ctrl_key = $('ctrlKey');
var acting = false;
show_options.addEventListener('click', function(e) {
	acting = true;

	var settings = Fanjoy.getSettings();
	template_type_onchange.call(template_type);

	enable_mouse_action.checked = settings.enableGesture || settings.enableMidButton;
	mouse_action.value = settings.enableMidButton ? 'clickMiddleButton' : 'rightButtonDrag';
	ctrl_key.checked = settings.ctrlKey;

	acting = false;
}, false);
options.addEventListener('change', function(e) {
	if (acting) return;
	var enable = enable_mouse_action.checked;
	Fanjoy.setSettings({
		enableGesture: enable && mouse_action.value == 'rightButtonDrag',
		enableMidButton: enable && mouse_action.value == 'clickMiddleButton',
		ctrlKey: ctrl_key.checked
	});
}, false);


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

function adjustSizeForPic() {
	function callback() {
		pic.parentElement.classList.add('imgLoaded');

		// 调整输入框尺寸
		var pic_height = pic.parentElement.offsetHeight;
		min_height = Math.max(pic_height, min_height);
		inner.style.minHeight = min_height + 'px';
		onresize();

		if (data.img_data.type === 'image/png') {
			fixTransparentPNG();
		} else {
			setPicTitle();
		}
	}
	// 等待图片加载完毕
	if (pic.complete) {
		callback();
	} else {
		if (pic.binded) return;
		pic.binded = true;
		pic.addEventListener('load', callback, false);
		pic.addEventListener('error', function() {
			showError('图片加载失败, 操作无法继续.', true);
		}, false);
	}
}

function showOverlay(ol) {
	ol.style.display = 'block';
	ol.classList.remove('focusOutFromTop');
	ol.classList.add('focusInFromBottom');
}

function showInquiry(msg, ok, ng) {
	var hide = function() {
		hide_btn_onclick.call(inquiry.children[0]);
	}

	focusOnPopup();
	inquiry.innerHTML += ''; // 强制取消事件绑定
	$('inquiryMsg').textContent = msg;
	$('inquiryOK').addEventListener('click', ok, false);
	$('inquiryOK').addEventListener('click', hide, false);
	$('inquiryNG').addEventListener('click', ng, false);
	$('inquiryNG').addEventListener('click', hide, false);
	showOverlay(inquiry);
}

function showError(msg, mode) {
	Fanjoy.playSound();
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

function setPicTitle() {
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
			pic.parentElement.title += '(' + data.img_data.type.match(/\/(.+)$/)[1].toUpperCase() + ')';
		}
	}
}

function fixTransparentPNG() {
	Ripple.helpers.image2canvas(pic).
	next(function(canvas) {
		var ctx = canvas.getContext('2d');
		var image_data = ctx.getImageData(0, 0, canvas.width, canvas.height);
		var pixel_array = image_data.data;
		var m, a, s;
		for (var i = 0, len = pixel_array.length; i < len; i += 4) {
			a = pixel_array[i+3];
			if (a === 255) continue;
			s = 255 - a;
			a /= 255;
			m = 3;
			while (m--) {
				pixel_array[i+m] = pixel_array[i+m] * a + s;
			}
			pixel_array[i+3] = 255;
		}
		ctx.putImageData(image_data, 0, 0);
		canvas.toBlob(function(blob) {
			data.img_data = blob;
			setPicTitle();
		});
	});
}

function submit() {
	if (button.disabled) return;
	if (! data.img_data && ! inputarea.textContent.length) return;

	button.classList.add('loading');
	progress_bar.style.width = '0';
	setContent(inputarea.textContent);

	checkPhoto().
	next(shorten).
	next(post).
	next(Fanjoy.setSuccessCount).
	next(checkSuccessCount).
	next(closePopup).
	error(function(e) {
		var error = e.status ?
			'连接 ' +
			e.response.request +
			' 时发生 ' +
			e.status +
			' 错误:<br />' +
			e.exceptionType +
			' / ' +
			e.statusText +
			'<br />' +
			(e.response ? (e.response.error || '') : '')
			:
			e.exceptionType +
			' / 请检查网络连接.';
		showError(error);
		console.log(e);
		enableButton();
	}).
	hold(function() {
		button.classList.remove('loading');
	});
}

function checkPhoto() {
	if (! data.img_data || data.img_data.size <= 2 * 1024 * 1024) {
		return Deferred.next();
	}
	var d = new Deferred;
	showInquiry('您将要分享的图片大小超过 2M, 可能会上传失败. 确定继续吗?', d.call.bind(d), noop);
	return d;
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
		showInquiry(msg, d.call.bind(d), enableButton);
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
		timeout: img_data ? 300000 : 15000,
		onstart: function() {
			onresize();
			disableButton('Submitting..', '正在提交..');
			if (img_data) {
				progress.style.display = 'block';
			}
		},
		onprogress: function(e) {
			if (! img_data || ! e.lengthComputable) return;
			var percent = Math.floor(e.loaded / e.total * 100);
			progress_bar.style.width = percent + '%';
			document.title = '有饭同享 (' + percent + '%)';

			if (percent > 33 && percent <= 66)
				progress.className = 'b';
			else if (percent > 66)
				progress.className = 'c';
			else
				progress.className = 'a';
		},
		oncomplete: function() {
			progress.style.display = 'none';
			document.title = '有饭同享';
			ajax = null;
		}
	};

	ajax = Fanjoy.user[img_data ? 'postPhoto' : 'postStatus'](params).setupAjax(ajax_options);
	return ajax;
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
		Ripple.helpers.buildPhotoBlob(img_url).
		next(function(blob) {
			data.img_data = blob;
			adjustSizeForPic();
			enableButton();
		});
	} else {
		if (Ripple.helpers.type(img_url) != 'object') {
			disableButton('Loading..', '加载');
			button.classList.add('loading');
		}
		if (data.fromBG) {
			loadImageInfo(img_url, function(data) {
				if (data.format === 'UNKNOWN')
					data.format = 'PNG';

				onMessage({
					type: 'update_photo',
					msg: {
						img_data: data.binaryData,
						img_type: 'image/' + data.format.toLowerCase()
					}
				});
			}, function() {
				onMessage({
					type: 'update_photo',
					msg: { }
				});
			});
		}
	}
}

function getTemplates() {
	return Fanjoy.getSettings().templates;
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
			if (keys.indexOf(key) > -1) {
				result = '$' + key;
				break;
			}
		}
		return result || '';
	});

	var selected_text = '';
	var result = template.replace(/#?\$([a-z_]+)#?/g, function(str, key) {
		var result = data[key];
		if (str[0] == '#' && str[str.length-1] == '#' && result) {
			selected_text = result;
		}
		return result || '';
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
	onresize();
}

function isImage(type) {
	switch (type) {
	case 'image/jpeg':
	case 'image/png':
	case 'image/gif':
	case 'image/bmp':
	case 'image/jpg':
		return true;
	default:
		return false;
	}
}

function onpasteImage(e) {
	var items = e.clipboardData.items;
	if (! items.length) return;
	var f, i = 0;
	while (items[i]) {
		f = items[i].getAsFile();
		if (f && isImage(f.type))	{
			break;
		}
		i++;
	}
	if (! f) return;
	e.stopImmediatePropagation();
	e.preventDefault();
	f.name = 'image-from-clipboard.' + f.type.replace('image/', '');

	var fr = new FileReader;
	fr.addEventListener('load', function() {
		data.img_url = pic.src = fr.result;
		processImage();
		if (f.type === 'image/png') {
			fixTransparentPNG();
		}
	}, false);
	fr.readAsDataURL(f);
}

function buildPhotoBlob(msg) {
	var utf8_string = msg.img_data;

	var array = [];
	for (var i = 0, len = utf8_string.length; i < len; i++) {
		array[i] = utf8_string.charCodeAt(i) & 0xff;
	}
	var byte_array = new Uint8Array(array);

	var bb = new (w.BlobBuilder || w.WebKitBlobBuilder);
	bb.append(byte_array);

	var blob = bb.getBlob(msg.img_type);
	data.img_data = blob;

	var fr = new FileReader;
	fr.addEventListener('load', function() {
		pic.src = fr.result;
		adjustSizeForPic();
		enableButton();
	}, false);
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
		if (msg.img_data) {
			buildPhotoBlob(msg);
		} else {
			showError('图片加载失败, 操作无法继续.', true);
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

function checkSuccessCount() {
	var count = Fanjoy.getSuccessCount();
	if (count === 5) {
		var d = new Deferred;
		var msg = '您已经成功分享了 5 次! 如果喜欢这个扩展, 请给它打个 5 星!';
		var agreed = function() {
			Fanjoy.showExtHomePage();
			closePopup();
		}
		showInquiry(msg, agreed, d.call.bind(d));
		return d;
	}
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

		if (result) {
			current_id = decodeURIComponent(result[1]);
			var current_name = html.match(/<title> 饭否 \| 欢迎你，(.+)<\/title>/)[1];
			code += '<p>';
			code += '当前登录账号为 <strong>' + current_name + '</strong>, ';
			code += current_id == Fanjoy.account.id ?
				'已通过验证.' : '已通过验证账号为 ' + '<strong>' + Fanjoy.account.screen_name + '</strong>.';
			code += '</p>';
			if (current_id != Fanjoy.account.id) {
				code += '<p>若不希望切换到<strong>' + current_name + '</strong>, 请先 ';
			}
			code += '<button id="logoutFF">登出</button>';
		} else {
			code = "点击按钮完成账号切换 ";
		}
		if (current_id) {
			code += current_id != Fanjoy.account.id ?
				' .</p>' : '<span class="arrow">&raquo;</span>';
		}
		code += '<button id="authorize">验证</button>';

		reset_inner.innerHTML = code;

		if ($('logoutFF')) {
			$('logoutFF').addEventListener('click', function logout_onclick() {
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
					},
					oncomplete: function() {
						logout_btn.removeEventListener('click', logout_onclick, false);
					}
				});
			}, false);
		}

		$('authorize').addEventListener('click', function() {
			Fanjoy.reset();
			Fanjoy.closeAllPopup();
		}, false);
	}).
	error(function(e) {
		reset_inner.innerHTML = '发生致命错误, 操作无法继续.';
	});
}

function onresize(e) {
	if (resizing) return;
	resizing = true;
	var delta = {
		x: outerWidth - innerWidth,
		y: outerHeight - innerHeight
	};
	lscache.set('size_delta', delta);
	Fanjoy.defaultStyle.winWidth = Fanjoy.defaultStyle.innerWidth + delta.x;
	Fanjoy.defaultStyle.winHeight = Fanjoy.defaultStyle.innerHeight + delta.y;
	resizeBy(Fanjoy.defaultStyle.innerWidth - innerWidth, 0);
	setTimeout(function() {
		resizeTo(outerWidth, parseInt(bd_style.height) + delta.y);
		resizing = false;
	}, 32)
}

// 阻止用户调整窗口大小
w.addEventListener('resize', onresize, false);
setInterval(onresize, 250);

w.addEventListener('paste', onpasteImage, false);

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

	onresize();
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

w.addEventListener('unload', function() {
	ajax && ajax.cancel();
}, false);

$('version').textContent = 'ver ' + Fanjoy.version;
$('successCount').textContent = Fanjoy.getSuccessCount();

if (! is_windows) {
	$('mouseOptions').hidden = true;
}