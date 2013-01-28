var ce = chrome.extension;
ce.onMessage = ce.onMessage || ce.onRequest;
ce.onMessage.addListener(function(msg) {
	if (msg.type = 'do' && msg.code) {
		window.eval(msg.code);
	}
});