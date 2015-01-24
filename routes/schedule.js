module.exports = function (app) {
    // Module dependencies.
    var mongoose = require('mongoose'),
        gmaputil = require('googlemapsutil'),
        Schedule = mongoose.models.Schedule,
        Restaurant = mongoose.models.Restaurant,
        api = {};

    //todo: use virtuals for this?
    api.locationIsOpen = function(location){

        //console.log(location);

        //this will not work via http ... requires https
        gmaputil.timezone(39.6034810, -119.6822510, 1331161200, {key:'AIzaSyAU3V3fXMUokcFaPxJ_SEnAkgo_hjmccB0'}, function(err, result){
            if(!err){
                console.log(result);
            }else{
                console.log('maps error:'+err);
            }
        });

        /*
        gmaputil.timezone(location.coords.lat, location.coords.lng, new Date().getTime(), null, function(err, result){
            if(!err){
                console.log(result);
            }else{
                console.log('maps error:'+err);
            }
        });
        */

/*
        gmaputil.directions('Toronto', 'Montreal', null, function(err, result){
            if(!err){
                console.log(result);
            }else{
                console.log('maps error:'+err);
            }
        })
        */

        var isOpen = false;
        var now = new Date();
        var yesterday = new Date(now);
        yesterday.setDate(now.getDate()-1)

        var hours = {
            open:  location.open,
            close:  location.close,
            startdate:  location.startdate,
            enddate:  location.enddate
        }

        var withinHours = function(check, start, end, dayOffset){

            if(typeof dayOffset === 'undefined'){
                dayOffset = 0;
            }

            //make copies of date objects
            start = new Date(start);
            end = new Date(end);

            var spanopen = end.getTime()-start.getTime();

            start.setDate(check.getDate()+dayOffset);
            start.setMonth(check.getMonth());
            start.setYear(check.getFullYear());

            end = new Date(start.getTime() + spanopen);

            console.log('-------------------------------------------------------------------------');
            console.log('Start: '+start);
            console.log('End:   '+end);
            console.log('Check: '+check);
            console.log('-------------------------------------------------------------------------');

            console.log((start.getTime() < check.getTime() && end.getTime() > check.getTime()));
            return (start.getTime() < check.getTime() && end.getTime() > check.getTime());

        }

        if(hours.startdate <= now){

            console.log(hours.startdate+' <= '+now);

            if(location.repeat.enabled) {
                console.log('repeat is enabled');

                /*
                 todo:  server needs to know time zone of truck ... perhaps
                 this will return false positives, etc. after 4PM PST will be next day in UTC (16[4PM] + 8 = 24)
                 set the time zone in the Schedule due to the possibility of Truck spanning time zones
                 in certain locations.

                 see https://developers.google.com/maps/documentation/timezone/  ...limit of 2500 requests for free
                 per day... should be non-issue ...

                 javascript dates have (date).getTimezoneOffset() ... returns minutes diff

                 one thing to note ... when saving the startdate, it is saved in UTC. this will also affect the date

                 open times cannot be calculated based on date or day, but must be calculated within the 24 hour period.
                 consider savings times and leap years, etc.

                 i.e. --- (open > location.startdate && open < location.startdate + 24 hr) indicates same day

                 how does server/client know how to convert? --> timezones are stored in date objects.  angular resource
                 will convert to proper utc string before sending

                 so...when is Monday/Tuesday/etc in UTC?
                 */

                //check if today or yesterday are in repeat array
                var idxToday = location.repeat.selected.indexOf(now.getDay()) > -1;
                var idxYesterday = location.repeat.selected.indexOf(now.getDay()-1) > -1;
                var openFromToday = false;
                var openFromYesterday = false;

                console.log('today starts:     '+location.startdate.getHours());



                if (idxToday || idxYesterday) {
                    if(idxToday){
                        console.log('Today is in repeat array '+location.repeat.selected);
                        openFromToday = withinHours(now, hours.open, hours.close);
                    }
                    if(idxYesterday){
                        console.log('Yesterday is in repeat array '+location.repeat.selected);
                        var dayDiff = hours.close.getDay()-hours.open.getDay();
                        if(dayDiff == 1 || dayDiff == -7){
                            console.log('Yesterday\'s hour rollover into today');
                            openFromYesterday = withinHours(now, hours.open, hours.close, -1);
                        }
                    }

                    isOpen = openFromToday || openFromYesterday;

                }
            }else{

                var openFromToday = false;
                var openFromYesterday = false;



                if(location.startdate.getDate() == now.getDate() &&
                    location.startdate.getMonth() == now.getMonth() &&
                    location.startdate.getFullYear() == now.getFullYear()){

                    openFromToday = withinHours(now, hours.open, hours.close);
                }


                if(location.startdate.getDate() == yesterday.getDate() &&
                    location.startdate.getMonth() == yesterday.getMonth() &&
                    location.startdate.getFullYear() == yesterday.getFullYear()){

                    var dayDiff = hours.close.getDay()-hours.open.getDay();
                    if(dayDiff == 1 || dayDiff == -7){
                        console.log('Yesterday\'s hour rollover into today');
                        openFromYesterday = withinHours(now, hours.open, hours.close, -1);
                    }
                }

                isOpen = openFromToday || openFromYesterday;

            }
        }

        return isOpen;
    };

    api.stripUserData = function(query){

        var user = {};

        Object.keys(query).forEach(function (elem, idx, arr) {
            //get rid of user parameters (user_) put into user object
            if ( elem.indexOf('user_') == 0) {
                user[elem.replace('user_', '')] = query[elem];
                delete query[elem];
            }
        });

        //todo:  add checks for user parameters
        user.lng = parseFloat(user.lng);
        user.lat = parseFloat(user.lat);
        user.timestamp = new Date(parseInt(user.timestamp));

        return user;
    }

    // ALL
    api.schedules = function (req, res) {

        var user = api.stripUserData(req.query);

        Object.keys(req.query).forEach(function (elem, idx, arr) {
            //convert possible objectids
            if(mongoose.Types.ObjectId.isValid(req.query[elem])){
                req.query[elem] = mongoose.Types.ObjectId(req.query[elem]);
            }
        });



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
                                    sched.forEach(function(elem, idx, arr){
                                        elem.isOpen = api.locationIsOpen(elem);
                                    });
                                res.status(200).json({schedules: sched});
                            });

                        }
                    });
            }
        });

    };

    // GET
    api.schedule = function (req, res) {

        var user = api.stripUserData(req.query);

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

                        sched.isOpen = api.locationIsOpen(sched);

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