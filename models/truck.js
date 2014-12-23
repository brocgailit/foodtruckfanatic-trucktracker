'use strict';

var mongoose = require('mongoose'),
		Schema = mongoose.Schema,
		ObjectId = Schema.ObjectId;

var fields = {
	business_id: { type: ObjectId },
	name: { type: String },
	description: { type: String },
	phone: { type: String },
	schedule: [{end:Date,repeat:String,close:Date,open:Date,description:String,longitude:Number,latitude:Number}]
};

var truckSchema = new Schema(fields);

module.exports = mongoose.model('Truck', truckSchema);