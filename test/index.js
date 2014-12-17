'use strict';

var assert = require('assert');
var async = require('async');
var mongoose = require('mongoose');
var connection = mongoose.createConnection('mongodb://localhost/mongoose-diff-test');
var personSchema = new mongoose.Schema({
	name: String,
	age: Number,
	nicknames: [String],
	isAdmin: Boolean
});

// Load plugin
personSchema.plugin(require('../index.js'));

// Set up pre-save hook & pointer
var preSave;
personSchema.pre('save', function(next) {
	if (preSave) {
		preSave.call(this, next);
	}
});

// Load model
var PersonModel = connection.model('person', personSchema);

// New doc
function newDoc() {
	return new PersonModel({
		name: 'John Smith',
		age: 32,
		nicknames: ['Johnny Boy', 'Smith-o'],
		isAdmin: true
	});
}

// Run tests
describe('A new document', function() {
	async.series([
		function(cb) {
			// Make sure diff doesn't exist on first save
			it('should not have a _diff on initial save', function(done) {
				var doc = newDoc();
				preSave = function(next) {
					assert(!this._diff);
					next();
					cb();
					done();
				};
				doc.save();
			})
		},

		function(cb) {
			// Check diff on subsequent saves
			it('should have a _diff on non-first save', function(done) {
				var doc = newDoc();

				preSave = null;

				doc.save(function(err) {
					assert(!err);

					doc.name = 'Jim Stevens';
					doc.age = 31;
					doc.nicknames = [];
					doc.isAdmin = false;

					preSave = function(next) {
						console.log(this._diff);
						next();
						cb();
						done();
					};

					doc.save();
				});
			})
		}
	]);
});