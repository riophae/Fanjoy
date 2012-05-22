var _verifier = '';
var settings = settings || {};
var disabled = {
	enableGesture: false,
	enableMidButton: false,
	ctrlKey: false
};
for (var key in disabled) {
	settings[key] = disabled[key];
}