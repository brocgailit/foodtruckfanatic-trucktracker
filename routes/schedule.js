module.exports = function (app) {
    // Module dependencies.
    var mongoose = require('mongoose'),
        Schedule = mongoose.models.Schedule,
        Restaurant = mongoose.models.Restaurant,
        api = {};

    api.locationIsOpen = function(today, location){

        var isOpen = false;

        var hours = {
            open:  location.open,
            close:  location.close,
            startdate:  location.startdate,
            enddate:  location.enddate
        };


        var withinHours = function(check, start, end){

            //get rid of date information
            start = new Date(0,0,0,start.getHours(),start.getMinutes());
            end = new Date(0,0,0,end.getHours(),end.getMinutes());
            check = new Date(0,0,0,check.getHours(),check.getMinutes());

            if (start.getTime() < check.getTime() && end.getTime() > check.getTime() ){
                return true;
            }else{
                return false;
            }
        }

        if(hours.startdate <= today){

            if(location.repeat.enabled) {
                if (location.repeat.selected.indexOf(today.getDay()) > -1) {
                    isOpen = withinHours(today,hours.open, hours.close);
                }
            }else{

                if(location.startdate.getDate() == today.getDate() &&
                    location.startdate.getMonth() == today.getMonth() &&
                    location.startdate.getYear() == today.getYear()){

                    isOpen = withinHours(today,hours.open, hours.close);
                }

            }
        }

        return isOpen;

    };

    // ALL
    api.schedules = function (req, res) {

        var user = {};

        //using two loops to avoid converting user parameters to object ids
        Object.keys(req.query).forEach(function (elem, idx, arr) {
            //get rid of user parameters (user_) put into user object
            if ( elem.indexOf('user_') == 0) {
                user[elem.replace('user_', '')] = req.query[elem];
                delete req.query[elem];
            }
        });

        Object.keys(req.query).forEach(function (elem, idx, arr) {
            //convert possible objectids
            if(mongoose.Types.ObjectId.isValid(req.query[elem])){
                req.query[elem] = mongoose.Types.ObjectId(req.query[elem]);
            }
        });

        user.lng = parseFloat(user.lng);
        user.lat = parseFloat(user.lat);

        Schedule.geoNear( [user.lng, user.lat], {
            num : 20,
            $maxDistance: 10,
            spherical:true,
            distanceMultiplier:3959,
            query: req.query
        },function(err, schedules){
            if(err) {
                res.status(500).json(err);
            }else{
                schedules = schedules.map(function(x){
                    x.obj.distance = x.dis;
                    return new Schedule(x.obj);
                });
                Schedule.populate(schedules, {path: 'truck'}, function (err, schedules) {
                        if (err) {
                            res.status(500).json(err);
                        } else {
                            Restaurant.populate(schedules, {
                                path: 'truck.business'
                            }, function(err, sched){
                                console.log("found schedules -----------------------------------------------------------");
                                var time = new Date(parseInt(user.timestamp));
                                sched.forEach(function(elem, idx, arr){
                                    elem.isOpen = api.locationIsOpen(time,elem);
                                })

                                res.status(200).json({schedules: sched});
                            });

                        }
                    });
            }
        });

    };

    // GET
    api.schedule = function (req, res) {
        var id = req.params.id;
        Schedule.findOne({ '_id': id})
            .populate('truck')
            .exec(function (err, schedule) {
                if (err) {
                    res.status(404).json(err)
                } else {

                    Restaurant.populate(schedule, {
                        path: 'truck.business'
                    }, function(err, sched){
                        console.log("found schedule");
                        res.status(200).json({schedule: sched});
                    });
                }
            });
    };

    // POST
    api.addSchedule = function (req, res) {

        var schedule;

        if (typeof req.body.schedule == 'undefined') {
            res.status(500);
            return res.json({message: 'schedule is undefined'});
        }

        schedule = new Schedule(req.body.schedule);

        schedule.save(function (err) {
            if (!err) {
                console.log("created schedule");
                return res.json(201, schedule.toObject());
            } else {
                return res.json(500, err);
            }
        });

    };

    // PUT
    api.editSchedule = function (req, res) {
        var id = req.params.id;

        Schedule.findById(id, function (err, schedule) {

            if (typeof req.body.schedule["truck"] != 'undefined') {
                schedule["truck"] = req.body.schedule["truck"];
            }

            if (typeof req.body.schedule["startdate"] != 'undefined') {
                schedule["startdate"] = req.body.schedule["startdate"];
            }

            if (typeof req.body.schedule["enddate"] != 'undefined') {
                schedule["enddate"] = req.body.schedule["enddate"];
            }

            if (typeof req.body.schedule["repeat"] != 'undefined') {
                schedule["repeat"] = req.body.schedule["repeat"];
            }

            if (typeof req.body.schedule["close"] != 'undefined') {
                schedule["close"] = req.body.schedule["close"];
            }

            if (typeof req.body.schedule["open"] != 'undefined') {
                schedule["open"] = req.body.schedule["open"];
            }

            if (typeof req.body.schedule["description"] != 'undefined') {
                schedule["description"] = req.body.schedule["description"];
            }

            if (typeof req.body.schedule["street"] != 'undefined') {
                schedule["street"] = req.body.schedule["street"];
            }

            if (typeof req.body.schedule["coords"] != 'undefined') {
                schedule["coords"] = req.body.schedule["coords"];
            }

            //todo: add more checks here


            return schedule.save(function (err) {
                if (!err) {
                    console.log("updated schedule");
                    return res.json(200, schedule.toObject());
                } else {
                    return res.json(500, err);
                }
            });
        });

    };

    // DELETE
    api.deleteSchedule = function (req, res) {
        var id = req.params.id;
        return Schedule.findById(id, function (err, schedule) {
            return schedule.remove(function (err) {
                if (!err) {
                    console.log("removed schedule");
                    return res.send(204);
                } else {
                    console.log(err);
                    return res.json(500, err);
                }
            });
        });

    };


    app.get('/api/schedules', api.schedules);
    app.get('/api/schedules/:id', api.schedule);
    app.post('/api/schedules', api.addSchedule);
    app.put('/api/schedules/:id', api.editSchedule);
    app.delete('/api/schedules/:id', api.deleteSchedule);
};