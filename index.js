'use strict';

var jsondiffpatch = require('jsondiffpatch');
var lodash = require('lodash');

module.exports = function(schema, opts) {
	// Set up default options
	var defaultOpts = {
		virtualName: '_diff',
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

	// Merge options
	opts = opts || {};
	opts = lodash.merge(defaultOpts, opts);

	// Extract local options...
	var virtualName = opts.virtualName;
	delete opts.virtualName;

	// ...and pass the rest to jdp
	var jdp = jsondiffpatch.create(opts);

	// Post-init and post-save hooks store original
	var reset = function(doc) {
		doc._original = doc.toObject({ transform: false });
	};
	schema.post('init', reset);
	schema.post('save', reset);

	// Expose virtual
    schema.virtual(virtualName).get(function() {
        // Return undefined if this object is brand new
        if (!this._original) {
            return;
        }

        // Otherwise return diff
        return jdp.diff(this._original, this.toObject({ transform: false }));
    });
};

