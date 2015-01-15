'use strict';

var mongoose = require('mongoose'),
		Schema = mongoose.Schema;

var fields = {
	business: { type: Schema.Types.ObjectId, ref: "Restaurant", required: true },
	description: { type: String },
	phone: { type: String }
};

var truckSchema = new Schema(fields);

module.exports = mongoose.model('Truck', truckSchema);