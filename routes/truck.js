module.exports = function (app) {
    // Module dependencies.
    var mongoose = require('mongoose'),
        Truck = mongoose.models.Truck,
        Schedule = mongoose.models.Schedule,
        api = {};


    // ALL
    api.trucks = function (req, res) {

        var user = {};

        //get rid of user parameters (user_) put into user object
        Object.keys(req.query).forEach(function (elem, idx, arr) {
            if (elem.indexOf('user_') == 0) {
                user[elem.replace('user_', '')] = req.query[elem];
                delete req.query[elem];
            }
        });


        Truck.find(req.query)
            .populate('business', 'name cuisine')
            .exec(function (err, trucks) {
                if (err) {
                    res.json(500, err);
                } else {
                    console.log('Found trucks.');
                    res.json({trucks: trucks});
                }
            });

    };

    // GET
    api.truck = function (req, res) {
        var id = req.params.id;
        Truck.findOne({ '_id': id})
            .populate('business')
            .exec(function (err, truck) {
                if (err) {
                    res.status(404).json(err);
                } else {
                    console.log("found truck");

                    res.status(200).json({truck: truck});

                    /*
                    Schedule.find({truck:truck._id}, function(err, schedule){
                        if(err){
                            res.status(404).json(err);
                        }else{
                            truck = truck.toObject();
                            truck.schedule = schedule;
                            res.status(200).json({truck: truck});
                        }
                    })
                    */

                }
            });
    };

    // POST
    api.addTruck = function (req, res) {

        var truck;

        if (typeof req.body.truck == 'undefined') {
            res.status(500);
            return res.json({message: 'truck is undefined'});
        }

        truck = new Truck(req.body.truck);

        truck.save(function (err) {
            if (!err) {
                console.log("created truck");
                return res.json(201, truck.toObject());
            } else {
                return res.json(500, err);
            }
        });

    };

    // PUT
    api.editTruck = function (req, res) {
        var id = req.params.id;

        Truck.findById(id, function (err, truck) {

            if (typeof req.body.truck["business"] != 'undefined') {
                truck["business"] = req.body.truck["business"];
            }

            if (typeof req.body.truck["description"] != 'undefined') {
                truck["description"] = req.body.truck["description"];
            }

            if (typeof req.body.truck["phone"] != 'undefined') {
                truck["phone"] = req.body.truck["phone"];
            }

            //todo: add more checks here


            return truck.save(function (err) {
                if (!err) {
                    console.log("updated truck");
                    return res.json(200, truck.toObject());
                } else {
                    return res.json(500, err);
                }
            });
        });

    };

    // DELETE
    api.deleteTruck = function (req, res) {
        var id = req.params.id;
        Truck.findById(id, function (err, truck) {
            Schedule.remove({truck:id}, function(err){
                if(!err) {
                    truck.remove(function (err) {
                        if (!err) {
                            console.log("removed truck");
                            return res.send(204);
                        } else {
                            console.log(err);
                            return res.json(500, err);
                        }
                    });
                }else{
                    return res.json(500, err);
                }
            })

        });

    };


    app.get('/api/trucks', api.trucks);
    app.get('/api/trucks/:id', api.truck);
    app.post('/api/trucks', api.addTruck);
    app.put('/api/trucks/:id', api.editTruck);
    app.delete('/api/trucks/:id', api.deleteTruck);
};