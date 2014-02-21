var mongo = require('mongodb');

var Server = mongo.Server,
    Db = mongo.Db,
    BSON = mongo.BSONPure;
    
var server = new Server('localhost',27017, {auto_reconnect:true});
var db = new Db('truckdb',server, {safe:false});

/* SAMPLE DATA */

var populateDB = function() {
    console.log('Populating database.');
    var trucks = [{"id":"5","business":"Aybla Grill","truckName":"Good Food Here","locationName":"Good Food Here","distance":"7751.3 mi","businessPhone":"5034903387","phone":"","latitude":"45.516551","longitude":"-122.617904"},{"id":"3","business":"The Grilled Cheese Grill","truckName":"Alberta","locationName":"Alberta","distance":"7751.7 mi","businessPhone":"5032068959","phone":"5032068959","latitude":"45.559212","longitude":"-122.65488"},{"id":"1","business":"The Grilled Cheese Grill","truckName":"Southeast","locationName":"Southeast","distance":"7752 mi","businessPhone":"5032068959","phone":"5032067018","latitude":"45.521784","longitude":"-122.637577"},{"id":"2","business":"Wolf and Bears","truckName":"Southeast","locationName":"Southeast","distance":"7752 mi","businessPhone":"5034535044","phone":"5034532872","latitude":"45.521784","longitude":"-122.637577"},{"id":"4","business":"Wolf and Bears","truckName":"North Portland","locationName":"Mississippi","distance":"7752.9 mi","businessPhone":"5034535044","phone":"5034535044","latitude":"45.551254","longitude":"-122.675811"},{"id":"7","business":"Aybla Grill","truckName":"1660 SE 3rd","locationName":"1660 SE 3rd","distance":"7753.4 mi","businessPhone":"5034903387","phone":"","latitude":"45.511102","longitude":"-122.662807"},{"id":"8","business":"Aybla Grill","truckName":"SW 5th and Oak","locationName":"SW 5th and Oak","distance":"7753.7 mi","businessPhone":"5034903387","phone":"","latitude":"45.521461","longitude":"-122.676051"},{"id":"9","business":"Aybla Grill","truckName":"SW 10th and Alder","locationName":"SW 10th and Alder","distance":"7754 mi","businessPhone":"5034903387","phone":"","latitude":"45.520563","longitude":"-122.681291"},{"id":"6","business":"Aybla Grill","truckName":"PSU","locationName":"PSU","distance":"7754.2 mi","businessPhone":"5034903387","phone":"","latitude":"45.514413","longitude":"-122.681134"}];
    db.collection('trucks', function(err,collection){
       collection.insert(trucks, {safe:true}, function(err,result){
          if(err){
              console.log('Error populating database - '+err);
          }else{
              console.log('Populated database.');
          }
       });
    });
};

db.open(function(err,db){
   if(!err){
       console.log("Connected to 'truckdb' database");
       db.collection('trucks',{strict:true}, function(err,collection){
          if(err){
              console.log("The 'trucks' collection doesn't exist. Creating it.");
              populateDB();
          }
       });
   }else{
       console.log("Couldn't connect to 'truckdb' - "+err);
   }
});

/*
 * GET trucks
 */

exports.findAll = function(req,res) {
    db.collection('trucks', function(err, collection){
        collection.find().toArray(function(err, items){
            res.send(items);
            console.log('Found your trucks');
        });
    });
};

exports.findById = function(req,res) {
    var id = req.params.id;
    console.log('Retrieving truck: ' + id);
    db.collection('trucks', function(err,collection){
        collection.findOne({'_id':new BSON.ObjectID(id)}, function(err, item){
            res.send(item);
        });
    });
};

/*
 * POST trucks
 */

exports.addTruck = function(req,res){
    var truck = req.body;
    console.log('Adding truck: '+JSON.stringify(truck));
    db.collection('trucks', function(err, collection){
        collection.insert(truck, {safe:true}, function(err,result){
            if(err){
                res.send({'error':'An error has occurred'});
            }else{
                console.log('Success: '+JSON.stringify(result[0]));
                res.send(result[0]);
            }
        });
    });
};

/*
 * OPUT trucks
 */

exports.updateTruck = function(req,res){
    var id = req.params.id;
    var truck = req.body;
    console.log('Updating truck: '+id);
    console.log(JSON.stringify(truck));
    db.collection('trucks',function(err,collection){
        collection.update({'_id':new BSON.ObjectID(id)}, truck, {safe:true}, function(err,result){
            if(err){
                console.log('Error updating truck:' + err);
                res.send({'error':'An error has occurred'});
            }else{
                console.log('' + result + ' thing(s) updated');
                res.send(truck);
            }
        });
    });
};

/*
 * DELETE trucks
 */

exports.deleteTruck = function(req,res){
    var id = req.params.id;
    console.log('Deleting truck: '+id);
    db.collection('trucks', function(err, collection){
        collection.remove({'_id':new BSON.ObjectID(id)},{safe:true},function(err,result){
           if(err){
               res.send({'error':'An error has occurred - '+err});
           } else{
               console.log(''+result+' thing(s) deleted');
               res.send(req.body);
           }
        });
    });
};


