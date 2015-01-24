'use strict';

var scheduleSchema;

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var fields = {
        truck: {type: Schema.Types.ObjectId, ref: "Truck", required: true },
        startdate: {type: Date},
        enddate: {type: Date},
        repeat: {
            enabled: {type: Boolean},
            selected: [{type: Number}],
            every: {type: Number},
            type: {type: String},
            forever: {type: Boolean},
            text: {type: String}
        },
        close: {type: Date},
        open: {type: Date},
        description: {type: String},
        street: {type: String},
        coords: {
            lng: {type: Number},
            lat: {type: Number}
        },
        distance: {type: Number},
        isOpen: {type: Boolean}

};

//todo: get rid of repeat text ... use a filter on the client side instead

//retain key order to prevent storing longitude before latitudes ... not sure if this is implemented yet
scheduleSchema = new Schema(fields, { retainKeyOrder: true });
scheduleSchema.index({coords: '2d'});

module.exports = mongoose.model('Schedule', scheduleSchema);