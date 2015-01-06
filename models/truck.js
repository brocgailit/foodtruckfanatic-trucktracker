'use strict';

var mongoose = require('mongoose'),
		Schema = mongoose.Schema,
		ObjectId = Schema.ObjectId;

var fields = {
	business_id: { type: ObjectId },
	description: { type: String },
	phone: { type: String },
	schedule: [{
        startdate:Date,
        enddate:Date,
        repeat: {
            enabled: Boolean,
            selected: [Number],
            every: Number,
            type: String,
            forever: Boolean,
            text: String
        },
        close:Date,
        open:Date,
        description:String,
        street:String,
        lat:Number,
        lng:Number
    }]
};

var truckSchema = new Schema(fields);

module.exports = mongoose.model('Truck', truckSchema);