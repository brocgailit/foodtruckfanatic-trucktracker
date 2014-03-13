var mongo = require('mongodb');

var Server = mongo.Server,
    Db = mongo.Db,
    BSON = mongo.BSONPure;
    
var server = new Server('troup.mongohq.com',10033, {auto_reconnect:true});
var db = new Db('app22402441',server, {safe:false});

var cname = 'trucks'; //collection name

/* SAMPLE DATA */

var populateDB = function() {
    console.log('Populating database.');
    
    var business = [
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
            cuisine: ["Mediterranean"]
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
            cuisine: ["Vegetarian", "Middle Eastern", "Falafel"]
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
            longitude:-122.65488, 
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
            longitude:-122.637577, 
            latitude:45.521784 
            }
      },
      {
        id: 5,
        businessId: 3,
        business: "Wolf and Bears",
        truckName: "Southeast",
        locationName: "Southeast",
        phone: "5034532872",
        location: {
            longitude:-122.637577, 
            latitude: 45.521784
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
      }
    ];
        
    db.collection('trucks', function(err,collection){
       collection.remove();  //get rid of what's in there
       collection.insert(trucks, {safe:true}, function(err,result){
          if(err){
              console.log('Error populating database - '+err);
          }else{
              console.log('Populated database.');
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

var results = {truck:null};

/*
 * GET trucks
 */

exports.findAll = function(req,res) {
    if ( typeof req.query.loc !== 'undefined' && req.query.loc ){
        exports.findByLoc(req,res);
    }else{
        db.collection('trucks', function(err, collection){     
            collection.find().toArray(function(err, items){
                res.send(items);
                console.log('Found your trucks');
            });
        });
    }
};

exports.findByLoc = function(req,res) {

    var loc = [0,0];  
    var favorites = sanitizeFavorites(req);
    
    if ( typeof req.query.loc !== 'undefined' && req.query.loc ){
        loc = JSON.parse(req.query.loc);
    }else{
        loc = JSON.parse(req.params.loc);
    }

    
    db.collection('trucks', function(err, collection){
        
        collection.geoNear( loc[0],loc[1], {$maxDistance: 100000,spherical:true,distanceMultiplier:3959},function(err, items){
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
            console.log('Found your trucks');
        });
        
    });
};


exports.findById = function(req,res) {
    var id = req.params.id;
    var favorites = sanitizeFavorites(req);
    console.log('Retrieving truck: ' + id);
    db.collection('trucks', function(err,collection){
        collection.findOne({'_id':new BSON.ObjectID(id)}, function(err, item){
            item.favorite = isFavorite(favorites,item.id);
            res.send(item);
        });
    });
};

exports.findByBusinessId = function(req,res) {
    var business_id = req.params.business_id;
    var loc = [-122.681134,45.514413];  
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
            console.log('Found your trucks');
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


