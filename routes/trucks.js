var mongo = require('mongodb');
var q = require('q');
var events = require('events');
var emitter = new events.EventEmitter();

var Server = mongo.Server,
    Db = mongo.Db,
    BSON = mongo.BSONPure;
    
var server = new Server('troup.mongohq.com',10033, {auto_reconnect:true});
var db = new Db('app22402441',server, {safe:false});

var cname = 'trucks'; //collection name

/* SAMPLE DATA */

var populateDB = function() {
    console.log('Populating database.');
    
    var businesses = [
        {
            id:2,
            name: "The Grilled Cheese Grill",
            contact: {
                address: "1027 NE Alberta Street",
                city: "Portland",
                state: "OR",
                zip: "97217",
                phone: "5038896900",
                email: "matt@grilledcheesegrill.com",
                website: "www.grilledcheesegrill.com"
            },
            trucks: [
                {
                    id: 1,
                    name: "Southeast",
                    phone: "5032067018"
                },
                {
                    id: 2,
                    name: "Alberta",
                    phone: "5032068959"
                },
                {
                    id: 3,
                    name: "Downtown",
                    phone: ""
                }
            ],
            cuisine: ["American", "Grilled Cheese", "Sandwiches"]
        },{
            id:1,
            name: "Aybla Grill",
            contact: {
                address: "1 Street Rd",
                city: "Portland",
                state: "OR",
                zip: "97216",
                phone: "5034903387",
                email: "info@ayblagrill.com",
                website: "www.ayblagrill.com"
            },
            trucks: [
                {
                    id: 1,
                    name: "PSU",
                    phone: ""
                },
                {
                    id: 2,
                    name: "Good Food Here",
                    phone: ""
                },
                {
                    id: 3,
                    name: "1660 SE 3rd",
                    phone: ""
                },
                {
                    id: 4,
                    name: "SW 5th and Oak",
                    phone: ""
                },
                {
                    id: 5,
                    name: "SW 10th and Alder",
                    phone: ""
                }
            ],
            cuisine: ["Mediterranean", "Falafel"]
        },{
            id:3,
            name: "Wolf and Bears",
            contact: {
                address: "3925 N. Mississippi Ave",
                city: "Portland",
                state: "OR",
                zip: "97227",
                phone: "5034535044",
                email: "",
                website: ""
            },
            trucks: [
                {
                    id: 1,
                    name: "Southeast",
                    phone: "5034532872"
                },
                {
                    id: 2,
                    name: "Mississippi",
                    phone: "5034535044"
                },
                {
                    id: 3,
                    name: "Downtown",
                    phone: "5038100671"
                }
            ],
            cuisine: ["Vegetarian", "Middle Eastern", "Falafel"]
        }
    ];
    
    var locations = [
      {
        id: 1,
        businessId: 1,
        truckId: 1,
        schedule: [{
            date: '2014-03-17',
            start: '08:00:00',
            end: '21:00:00',
            repeat: {
                type: 'daily',
                end: '2014-03-21'
            }
        }],
        description: "PSU",
        location: {
            longitude:-122.681134, 
            latitude: 45.514413
            }
      },
      {
        id: 2,
        businessId: 1,
        truckId: 2,
        schedule: [{
            date: '2014-03-17',
            start: '08:00:00',
            end: '21:00:00',
            repeat: {
                type: 'daily',
                end: '2014-03-21'
            }
        }],
        description: "Good Food Here Belmont",
        location: {
            longitude:-122.617904, 
            latitude: 45.516551
            }
      },
      {
        id: 3,
        businessId: 2,
        truckId: 2,
        schedule: [{
            date: '2014-03-17',
            start: '08:00:00',
            end: '21:00:00',
            repeat: {
                type: 'daily',
                end: '2014-03-21'
            }
        }],
        description: "1027 NE Alberta Street",
        location: {
            longitude: -122.65488,
            latitude: 45.559212
            }
      },
      {
        id: 4,
        businessId: 2,
        truckId: 1,
        schedule: [{
            date: '2014-03-17',
            start: '08:00:00',
            end: '21:00:00',
            repeat: {
                type: 'daily',
                end: '2014-03-21'
            }
        }],
        description: "SE 28th Ave (Between Ash and Ankeny)",
        location: {
            longitude:-122.63765, 
            latitude:45.521894
            }
      },
      {
        id: 5,
        businessId: 3,
        truckId: 1,
        schedule: [{
            date: '2014-03-17',
            start: '08:00:00',
            end: '21:00:00',
            repeat: {
                type: 'daily',
                end: '2014-03-21'
            }
        }],
        description: "SE 28th Ave (Between Ash and Ankeny)",
        location: {
            longitude:-122.637715, 
            latitude: 45.521821
        }
      },
      {
        id: 6,
        businessId: 3,
        truckId: 2,
        schedule: [{
            date: '2014-03-17',
            start: '08:00:00',
            end: '21:00:00',
            repeat: {
                type: 'daily',
                end: '2014-03-21'
            }
        }],
        description: "Mississippi Avenue",
        location: {
            longitude:-122.675811, 
            latitude: 45.551254
            }
      },
      {
        id: 7,
        businessId: 1,
        truckId: 3,
        schedule: [{
            date: '2014-03-17',
            start: '08:00:00',
            end: '21:00:00',
            repeat: {
                type: 'daily',
                end: '2014-03-21'
            }
        }],
        description: "1660 SE 3rd",
        location:{
            longitude:-122.662807, 
            latitude: 45.511102
            }
      },
      {
        id: 8,
        businessId: 1,
        truckId: 4,
        schedule: [{
            date: '2014-03-17',
            start: '08:00:00',
            end: '21:00:00',
            repeat: {
                type: 'daily',
                end: '2014-03-21'
            }
        }],
        description: "SW 5th and Oak",
        location: {
            longitude:-122.676051, 
            latitude: 45.521461
            }
      },
      {
        id: 9,
        businessId: 1,
        truckId: 5,
        schedule: [{
            date: '2014-03-17',
            start: '08:00:00',
            end: '21:00:00',
            repeat: {
                type: 'daily',
                end: '2014-03-21'
            }
        }],
        description: "SW 10th and Alder",
        location:{
            longitude:-122.681291, 
            latitude: 45.520563
            }
      },
      {
        id: 10,
        businessId: 3,
        truckId: 3,
        schedule: [{
            date: '2014-03-17',
            start: '08:00:00',
            end: '21:00:00',
            repeat: {
                type: 'daily',
                end: '2014-03-21'
            }
        }],
        location:{
            longitude:-122.681384, 
            latitude: 45.521119
            }
      },
      {
        id: 11,
        businessId: 2,
        truckId: 3,
        schedule: [{
            date: '2014-03-17',
            start: '08:00:00',
            end: '21:00:00',
            repeat: {
                type: 'daily',
                end: '2014-03-21'
            }
        }],
        description: "SW 10th and Alder",
        location:{
            longitude:-122.681422, 
            latitude: 45.521043
            }
      }
    ];
    
    var trucks = [
      {
        id: 1,
        businessId: 1,
        business: "Aybla Grill",
        truckName: "PSU",
        locationName: "PSU",
        phone: "",
        location: {
            longitude:-122.681134, 
            latitude: 45.514413
            }
      },
      {
        id: 2,
        businessId: 1,
        business: "Aybla Grill",
        truckName: "Good Food Here",
        locationName: "Good Food Here",
        phone: "",
        location: {
            longitude:-122.617904, 
            latitude: 45.516551
            }
      },
      {
        id: 3,
        businessId: 2,
        business: "The Grilled Cheese Grill",
        truckName: "Alberta",
        locationName: "Alberta",
        phone: "5032068959",
        location: {
            longitude: -122.65488,
            latitude: 45.559212
            }
      },
      {
        id: 4,
        businessId: 2,
        business: "The Grilled Cheese Grill",
        truckName: "Southeast",
        locationName: "Southeast",
        phone: "5032067018",
        location: {
            longitude:-122.63765, 
            latitude:45.521894 
            }
      },
      {
        id: 5,
        businessId: 3,
        business: "Wolf and Bears",
        truckName: "Southeast",
        locationName: "Southeast",
        phone: "5034532872",
        date: '2014-03-17',
        start: '08:00:00',
        end: '22:00:00',
        repeat: 'daily',
        location: {
            longitude:-122.637715, 
            latitude: 45.521821
        }
      },
      {
        id: 6,
        businessId: 3,
        business: "Wolf and Bears",
        truckName: "North Portland",
        locationName: "Mississippi",
        phone: "5034535044",
        location: {
            longitude:-122.675811, 
            latitude: 45.551254
            }
      },
      {
        id: 7,
        businessId: 1,
        business: "Aybla Grill",
        truckName: "1660 SE 3rd",
        locationName: "1660 SE 3rd",
        phone: "",
        location:{
            longitude:-122.662807, 
            latitude: 45.511102
            }
      },
      {
        id: 8,
        businessId: 1,
        business: "Aybla Grill",
        truckName: "SW 5th and Oak",
        locationName: "SW 5th and Oak",
        phone: "",
        location: {
            longitude:-122.676051, 
            latitude: 45.521461
            }
      },
      {
        id: 9,
        businessId: 1,
        "business": "Aybla Grill",
        "truckName": "SW 10th and Alder",
        "locationName": "SW 10th and Alder",
        "phone": "",
        location:{
            longitude:-122.681291, 
            latitude: 45.520563
            }
      },
      {
        id: 10,
        businessId: 3,
        "business": "Wolf and Bears",
        "truckName": "Downtown",
        "locationName": "SW 10th and Alder",
        "phone": "",
        location:{
            longitude:-122.681384, 
            latitude: 45.521119
            }
      },
      {
        id: 11,
        businessId: 2,
        "business": "Grilled Cheese Grill",
        "truckName": "Downtown",
        "locationName": "SW 10th and Alder",
        "phone": "",
        location:{
            longitude:-122.681422, 
            latitude: 45.521043
            }
      }
    ];
    
    db.collection('businesses', function(err,collection){
       collection.remove();  //get rid of what's in there
       collection.insert(businesses, {safe:true}, function(err,result){
          if(err){
              console.log('Error populating database - '+err);
          }else{
              console.log('Populated business database.');
          }
       });
    });
        
    db.collection('trucks', function(err,collection){
       collection.remove();  //get rid of what's in there
       collection.insert(trucks, {safe:true}, function(err,result){
          if(err){
              console.log('Error populating database - '+err);
          }else{
              console.log('Populated truck database.');
              collection.ensureIndex({location:"2d"});
          }
       });
    });
    
    db.collection('locations', function(err,collection){
       collection.remove();  //get rid of what's in there
       collection.insert(locations, {safe:true}, function(err,result){
          if(err){
              console.log('Error populating database - '+err);
          }else{
              console.log('Populated locations database.');
              collection.ensureIndex({location:"2d"});
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
              db.authenticate('tracker','f00d4thought', function(err, res){
               if(!err){
                   console.log('Authenticated!');
                   populateDB();
               }else{
                   console.log("Couldn't connect to Database.  Couldn't Authenticate. - "+err);
               }
           });
          }
       });
   }else{
       
       
   }
});

var sanitizeFavorites =  function(req){
    var favorites = new Array();
    if ( typeof req.query.favorites !== 'undefined' && req.query.favorites ){
        if (req.query.favorites instanceof Array) {
            favorites = req.query.favorites;
         }else{
             favorites.push(req.query.favorites);
         }
    }
    return favorites;
};

var isFavorite = function(favorites, id){
    var matchFound = false;
    favorites.forEach(function(favorite){
        if(id == favorite){
            matchFound = true;
            return;
        }
    });
    return matchFound;
};

var isValidObjectID = function (str) {
  // coerce to string so the function can be generically used to test both strings and native objectIds created by the driver
  str = str + '';
  var len = str.length, valid = false;
  if (len == 12 || len == 24) {
    valid = /^[0-9a-fA-F]+$/.test(str);
  }
  return valid;
};

var findBusinessById = function(business_id) {
    
    var deferred = q.defer();
    var resolve = deferred.resolve;

    db.collection('businesses', function(err,collection){
        
        collection.findOne({id:business_id}, function(err, item){
            if(err){
                throw new Error(err);
            }else{
                resolve(item);
            }
        });

    });
    
    return deferred.promise;
    
};

var results = {truck:null};

/*
 * GET trucks
 */

exports.findAll = function(req,res) {
    if ( typeof req.query.loc !== 'undefined' && req.query.loc ){
        exports.findByLoc(req,res);
    }else{
        db.collection('locations', function(err, collection){     
            collection.find().toArray(function(err, items){
                res.send(items);
                console.log('Found all of your trucks');
            });
        });
    }
};

exports.findByLoc = function(req,res) {

    var loc = [0,0];  
    var qlimit = 100;
    var favorites = sanitizeFavorites(req);
    
    if ( typeof req.query.loc !== 'undefined' && req.query.loc ){
        loc = JSON.parse(req.query.loc);
    }else{
        loc = JSON.parse(req.params.loc);
    }
    
    if ( typeof req.query.limit !== 'undefined' && req.query.limit ){
        qlimit = parseInt(req.query.limit); 
    }
    
    db.collection('locations', function(err, collection){
        
        collection.geoNear( loc[0],loc[1], {num : qlimit, $maxDistance: 0.5,spherical:true,distanceMultiplier:3959},function(err, items){
            var truck = [];
            
            items = items.results; //strip out meta data
            
            items.forEach(function(item, index){
                    
                var t = item.obj;
                
                t.distance = item.dis;
                t.favorite = isFavorite(favorites,t.truckId);
                
                truck.push(t);

            });
            
            res.send(truck);
            console.log('Found your trucks by location');
            
        });
        
    });
};


exports.findById = function(req,res) {
    var id = req.params.id;
    
    if(isValidObjectID(id)){
        var favorites = sanitizeFavorites(req);
        var loc = [0,0];  
        
        if ( typeof req.query.loc !== 'undefined' && req.query.loc ){
            loc = JSON.parse(req.query.loc);
        }
        
        console.log('Retrieving truck: ' + id);
        db.collection('locations', function(err,collection){
            
            collection.geoNear( loc[0],loc[1], {query:{'_id':new BSON.ObjectID(id)}, $maxDistance: 100000,spherical:true,distanceMultiplier:3959},function(err, items){
                var truck = [];
                console.log(items);
                item = items.results; //strip out meta data
                if(item.length > 0){
                    var t = item[0].obj;
                    t.distance = item[0].dis;
                    t.favorite = isFavorite(favorites,t.truckId);
                    res.send(t);
                }else{
                    res.send('No result found');
                }
                
                
            });
            
        });
     }else{
         res.send(id+' is not a valid ObjectID');
     }
};

exports.findByBusinessId = function(req,res) {
    var business_id = req.params.business_id;
    var loc = [0,0];  
    var favorites = sanitizeFavorites(req);
    
    if ( typeof req.query.loc !== 'undefined' && req.query.loc ){
        loc = JSON.parse(req.query.loc);
    }

    db.collection('trucks', function(err,collection){
        
        collection.geoNear( loc[0],loc[1], {query:{'businessId':parseInt(business_id)}, $maxDistance: 100000,spherical:true,distanceMultiplier:3959},function(err, items){
            var truck = [];
            console.log(items);
            items = items.results; //strip out meta data
            
            items.forEach(function(item){
                var t = item.obj;
                t.distance = item.dis;
                t.favorite = isFavorite(favorites,t.id);
                truck.push(t);
            });
            
            res.send(truck);
        });

    });
};

exports.findAllBusinesses = function(req,res) {
    
        var cuisine, query;
        
        query = null;
        
        if ( typeof req.query.cuisine !== 'undefined' && req.query.cuisine ){
            
            cuisine = req.query.cuisine;
            
            if( !Array.isArray(cuisine) ){
                cuisine = [cuisine];
            }
            
            query = {'cuisine':{ $in: cuisine}};
        }

        db.collection('businesses', function(err, collection){     
            collection.find(query).toArray(function(err, items){
                res.send(items);
                console.log('Found all of your businesses');
            });
        });

};

exports.findBusinessById = function(req,res){
    console.log('finding business by id');
    
    var business_id = req.params.business_id;

    db.collection('businesses', function(err,collection){
        collection.findOne({'id':parseInt(business_id)}, function(err, item){
             res.send(item);
        });

    });
};

exports.findAllCuisines = function(req,res){
    console.log('finding cuisines');

    db.collection('businesses', function(err,collection){
        collection.distinct('cuisine', function(err, item){
            item.sort();
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


