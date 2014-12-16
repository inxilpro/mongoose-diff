'use strict';

var jsondiffpatch = require('jsondiffpatch').create();
var diff = jsondiffpatch.diff;

module.exports = function(schema) {
	// Post-init hook stores original
	schema.post('init', function() {
		this._original = this.toObject();
	});

	// Post-validate runs before pre-save
	schema.post('validate', function() {
		// Check that _original is set
		if (!this._original) {
			return;
		}

		// Check for listeners
		var listeners = this.listeners('diff');
		if (!listeners.length) {
			return;
		}

		// Perform diff
		this._diff = diff(this._original, this.toObject());
	});
};