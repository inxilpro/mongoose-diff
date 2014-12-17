'use strict';

var assert = require('assert');
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
	} else {
		next();
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
	var running = false;
	beforeEach(function(done) {
		if (!running) {
			return done();
		}
		var i = setInterval(function() {
			if (!running) {
				clearInterval(i);
				done();
			}
		}, 100);
	});

	after(function(done) {
		PersonModel.remove(function(err) {
			done();
		});
	});

	// Make sure diff doesn't exist on first save
	it('should not have a _diff on initial save', function(done) {
		running = true;
		var doc = newDoc();
		preSave = function(next) {
			assert(!this._diff);
			next();
			done();
			running = false;
		};
		doc.save();
	});

	// Check diff on subsequent saves
	it('should have a _diff on non-first save', function(done) {
		running = true;
		var doc = newDoc();

		preSave = null;

		doc.save(function(err) {
			assert(!err);

			doc.name = 'Jim Stevens';
			doc.age = 31;
			doc.nicknames = [];
			doc.isAdmin = false;

			preSave = function(next) {
				var expected = {
					name: ['John Smith', 'Jim Stevens'],
					age: [32, 31],
					isAdmin: [true, false],
					nicknames: {
						_t: 'a',
						_0: ['Johnny Boy', 0, 0],
						_1: ['Smith-o', 0, 0 ]
					}
				};
				assert.deepEqual(expected, this._diff);
				next();
				done();
				running = false;
			};

			doc.save();
		});
	});
});