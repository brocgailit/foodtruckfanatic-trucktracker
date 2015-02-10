module.exports = function (app) {
    // Module dependencies.
    var mongoose = require('mongoose'),
        gmaputil = require('googlemapsutil'),
        q = require('q'),
        Schedule = mongoose.models.Schedule,
        Restaurant = mongoose.models.Restaurant,
        gcm = require('node-gcm'),//todo: remove this
        api = {};

    api.testPush = function(regId){
        var message = new gcm.Message({
            collapseKey: 'demo',
            delayWhileIdle: true,
            timeToLive: 3,
            data: {
                key1: 'message1',
                key2: 'message2'
            }
        });

        var sender = new gcm.Sender('AIzaSyAU3V3fXMUokcFaPxJ_SEnAkgo_hjmccB0');

        var registrationIds = [];
        registrationIds.push(regId);

        var numRetries = 10;
        sender.send(message, registrationIds, numRetries, function (err, result) {
            if(err) console.error(err);
            else    console.log(result);
        });
    }

    api.getTimezone = function(location){

        var deferred = q.defer();
        var now = new Date();
        var thresholdMins = 15;
        var log = 'getting timezone for location';

        //todo: maybe check at hour change?
        if ( typeof location.timezone != 'undefined' && (now.getTime() - location.timezone.timestamp < thresholdMins * 60 * 1000)) {

            log += '\nusing stored timezone';
            deferred.resolve(location.timezone);

        }else {

            log += '\ngetting timezone from google';
            gmaputil.timezone(location.coords.lat, location.coords.lng, now.getTime() / 1000, null, function (err, result) {

                if (!err) {
                    log += '\nfound timezone';
                    result = JSON.parse(result);

                    if (result.status == 'OK') {

                        Schedule.findById(location._id, function (err, schedule) {
                            schedule.timezone = {
                                rawOffset: result.rawOffset,
                                dstOffset: result.dstOffset,
                                timestamp: (new Date()).getTime()
                            };

                            if (!err) {
                                schedule.save(function (err) {
                                    if (!err) {
                                        log += '\nsaved new timezone information';
                                        deferred.resolve(schedule.timezone);
                                    } else {
                                        deferred.reject(new Error("error saving timezone: " + err));
                                    }
                                });
                            }
                        })

                    } else {

                        deferred.reject(new Error(result.status));
                    }

                } else {

                    log += '\nCould not get timezone '+err;
                    deferred.reject(new Error('request error: ' + err));

                }
            });
        }

        console.log(log);
        return deferred.promise;
    }

    //todo: use virtuals for this?
    api.locationIsOpen = function(location){

        var log = '';

        var deferred = q.defer();

        var hours = {
            open:  new Date(location.open),
            close:  new Date(location.close),
            startdate:  new Date(location.startdate),
            enddate:  new Date(location.enddate)
        }

        var isOpen = false;
        var now = new Date();
        var yesterday = new Date(now)
        yesterday.setDate(now.getDate()-1);

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

            log += '\n-------------------------------------------------------------------------\n'+
                'Start: '+start + '\n' +
                'End:   '+end + '\n' +
                'Check: '+check + '\n' +
                '-------------------------------------------------------------------------' +
                (start.getTime() < check.getTime() && end.getTime() > check.getTime());

            return (start.getTime() < check.getTime() && end.getTime() > check.getTime());

        }

        var setTZOffset = function(date, offset){
            date.setSeconds(date.getSeconds()-offset);
        }

        api.getTimezone(location)
            .then( function(timezone){

                //adjsut UTC to truck's local time to check days and hours
                var serverTZOffset = now.getTimezoneOffset()*-60;
                var serverTZDiff = serverTZOffset-timezone.rawOffset-timezone.dstOffset;

                //todo: use iterator for this
                setTZOffset(now,serverTZDiff);
                setTZOffset(yesterday,serverTZDiff);
                setTZOffset(hours.open,serverTZDiff);
                setTZOffset(hours.close,serverTZDiff);
                setTZOffset(hours.startdate,serverTZDiff);
                setTZOffset(hours.enddate,serverTZDiff);

                log += '\nTODAY IS:     '+now;
                log += '\nYESTERDAY IS: '+yesterday;

                if(hours.startdate <= now){

                    log += '\n'+hours.startdate+' <= '+now;

                    if(location.repeat.enabled) {
                        log += '\nrepeat is enabled: '+location.repeat.selected;

                        //check if today or yesterday are in repeat array
                        var idxToday = location.repeat.selected.indexOf(now.getDay()) > -1;
                        var idxYesterday = location.repeat.selected.indexOf(now.getDay()-1) > -1;
                        var openFromToday = false;
                        var openFromYesterday = false;

                        if (idxToday || idxYesterday) {
                            if(idxToday){
                                log += '\nToday is in repeat array '+location.repeat.selected;
                                openFromToday = withinHours(now, hours.open, hours.close);
                            }
                            if(idxYesterday){
                                log += '\nYesterday is in repeat array '+location.repeat.selected;
                                var dayDiff = hours.close.getDay()-hours.open.getDay();
                                log += '\nday diff:'+dayDiff;
                                log += '\nclose day: '+hours.close.getDay();
                                log += '\nopen day: '+hours.open.getDay();

                                if(dayDiff == 1 || dayDiff == -7){
                                    log += '\nYesterday\'s hours rollover into today';
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
                                log += '\nYesterday\'s hour rollover into today';
                                openFromYesterday = withinHours(now, hours.open, hours.close, -1);
                            }
                        }

                        isOpen = openFromToday || openFromYesterday;

                    }
                }
                console.log(log);

                deferred.resolve(isOpen);
            })
            .catch(function(err){
                deferred.reject(err);
            });


        return deferred.promise;

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

        //todo: this is just a test
        if(typeof req.query['push'] !== 'undefined'){
            api.testPush(req.query['push']);
        }


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
                                var promises = [];

                                sched.forEach(function(elem, idx, arr){

                                    var deferred = q.defer();
                                    api.locationIsOpen(elem)
                                        .then(function(open){
                                            elem.isOpen = open;
                                            deferred.resolve(open);

                                        })
                                        .catch(function (err){
                                            deferred.reject(err);;
                                        });

                                    promises.push(deferred.promise);
                                });

                                q.all(promises)
                                    .then(function(){
                                        res.status(200).json({schedules: sched});
                                    })
                                    .catch(function(err){
                                        res.status(404).json(err)
                                    });
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
        var user = api.stripUserData(req.params);

        return Schedule.remove(req.params, function (err, schedule) {
                if (!err) {
                    console.log("removed schedule(s)");
                    return res.send(204);
                } else {
                    console.log(err);
                    return res.json(500, err);
                }
        });

    };


    app.get('/api/schedules', api.schedules);
    app.get('/api/schedules/:id', api.schedule);
    app.post('/api/schedules', api.addSchedule);
    app.put('/api/schedules/:id', api.editSchedule);
    app.delete('/api/schedules', api.deleteSchedule);
};