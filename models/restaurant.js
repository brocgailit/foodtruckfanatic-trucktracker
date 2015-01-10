'use strict';

var mongoose = require('mongoose'),
		Schema = mongoose.Schema,
		ObjectId = Schema.ObjectId;

var fields = {
    _id: { type: ObjectId },
	name: { type: String },
	address: { type: String },
	city: { type: String },
	state: { type: String },
	zip: { type: String },
	phone: { type: String },
	website: { type: String },
	cuisine: [{type:String}]
};

var restaurantSchema = new Schema(fields);

module.exports = mongoose.model('Restaurant', restaurantSchema);