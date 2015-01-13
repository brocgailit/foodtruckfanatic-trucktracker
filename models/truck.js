'use strict';

var mongoose = require('mongoose'),
		Schema = mongoose.Schema;

var fields = {
	business: { type: Schema.Types.ObjectId, ref: "Restaurant" },
	description: { type: String },
	phone: { type: String },
	schedule: [{
        startdate:Date,
        enddate:Date,
        repeat: {
            enabled: {type: Boolean},
            selected: [{type: Number}],
            every: {type: Number},
            type: {type: String},
            forever: {type: Boolean},
            text: {type: String}
        },
        close:Date,
        open:Date,
        description:String,
        street:String,
        coords:{
            lat: {type: Number},
            lng: {type: Number}
        }

    }]
};

var truckSchema = new Schema(fields);

module.exports = mongoose.model('Truck', truckSchema);