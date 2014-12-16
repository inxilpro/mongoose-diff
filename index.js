'use strict';
var jsondiffpatch = require('jsondiffpatch');
var lodash = require('lodash');

module.exports = function(schema, opts) {
	opts = opts || {};
	var defaultOpts = {
		objectHash: function(obj) {
			return obj._id || obj.id;
		},
		arrays: {
			detectMove: true,
			includeValueOnMove: false
		},
		textDiff: {
			minLength: 60
		}
	};

	var jdp = jsondiffpatch.create(lodash.merge(defaultOpts, opts));

	// Post-init hook stores original
	schema.post('init', function() {
		this._original = this.toObject();
	});

	// Post-validate runs before pre-save
	schema.pre('save', function(next) {
		// Check that _original is set
		if (!this._original) {
			return next();
		}

		// Perform diff
		this._diff = jdp.diff(this._original, this.toObject());
		next();
	});
};