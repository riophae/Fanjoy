var ce = chrome.extension;
ce.onMessage = ce.onMessage || ce.onRequest;
var settings;
ce.onMessage.addListener(function(msg) {
	if (msg.type = 'do' && msg.data) {
		var type = msg.data.type;
		var url = msg.data.url;
		if (type === 'init-settings') {
			settings = msg.data.value;
		} else if (type === 'selection') {
			shareSelection(true);
		} else if (type === 'image') {
			shareImage(url);
		} else if (type === 'link') {
			shareLink(url);
		}
	}
});
