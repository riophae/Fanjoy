
function loadImageInfo(strUrl, fncCallback, fncError) {
	function BinaryFile(data) {
		this.getRawData = function() {
			return data;
		}

		this.getByteAt = function(iOffset) {
			return data.charCodeAt(iOffset) & 0xFF;
		}

		this.getLength = function() {
			return data.length || 0;
		}

		this.getStringAt = function(iOffset, iLength) {
			var aStr = [];
			for (var i = iOffset, j = 0; i < iOffset + iLength; i++, j++) {
				aStr[j] = String.fromCharCode(this.getByteAt(i));
			}
			return aStr.join('');
		}
	}

	function BinaryAjax(strURL, fncCallback, fncError) {
		var xhr = new XMLHttpRequest();

		if (fncCallback) {
			xhr.onload = function() {
				if (xhr.status == '200' || xhr.status == '206') {
					this.binaryResponse = new BinaryFile(this.responseText);
					this.fileSize = this.getResponseHeader('Content-Length');
					fncCallback(this);
				} else {
					if (fncError) fncError();
				}
				xhr = null;
			};
		}

		if (fncError) {
			xhr.onerror = fncError;
		}

		xhr.open('GET', strURL, true);
		xhr.overrideMimeType('text/plain; charset=x-user-defined');
		xhr.setRequestHeader('If-Modified-Since', 'Sat, 1 Jan 1970 00:00:00 GMT');
		xhr.send(null);
	}

	function detectFormat(data) {
		if (data.getByteAt(0) == 0xFF && data.getByteAt(1) == 0xD8)
			return 'JPEG';

		if (data.getByteAt(0) == 0x89 && data.getStringAt(1, 3) == 'PNG')
			return 'PNG';

		if (data.getStringAt(0,3) == 'GIF')
			return 'GIF';

		if (data.getByteAt(0) == 0x42 && data.getByteAt(1) == 0x4D)
			return 'BMP';

		return 'UNKNOWN';
	}

	BinaryAjax(
		strUrl,
		function(http) {
			var info = {
				format: detectFormat(http.binaryResponse),
				binaryData: http.binaryResponse.getRawData()
			};

			if (fncCallback) {
				fncCallback(info);
			}
		},
		fncError
	);
}