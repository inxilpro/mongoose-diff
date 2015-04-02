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

    schema.virtual('_diff').get(function() {
        // Check that _original is set
        // In case of new Schema(), post init is not called
        if (!this._original) {
            this._original = {};
        }

        return jdp.diff(this._original, this.toObject());
    });

	schema.post('save', function() {
		this._original = this.toObject();
	});
};
