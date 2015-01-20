'use strict';

var mongoose = require('mongoose'),
		Schema = mongoose.Schema;

var fields = {
	name: { type: String, required: true },
    description: { type: String},
	address: { type: String },
	city: { type: String },
	state: { type: String },
	zip: { type: String },
	phone: { type: String },
	website: { type: String },
	cuisine: [{type:String}],
    truck_count: {type: Number}
};

var restaurantSchema = new Schema(fields);

module.exports = mongoose.model('Restaurant', restaurantSchema);