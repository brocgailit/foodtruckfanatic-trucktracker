module.exports = function(app) {
  // Module dependencies.
  var mongoose = require('mongoose'),
      Truck = mongoose.models.Truck,
      Restaurant = mongoose.models.Truck,
      api = {};


  // ALL
  api.trucks = function (req, res) {

    Truck.find(req.query, function(err, trucks) {
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
    Truck.findOne({ '_id': id }, function(err, truck) {

      if (err) {
        //res.json(404, err);
        res.status(404).json(err)
      } else {

          Restaurant.findOne({'_id': truck.business_id}, function(err, restaurant){
              if (err) {
                  //res.json(404, err);
                  res.status(404).json(err)
              }else{
                  console.log("found truck");
                  truck.business = restaurant;
                  console.log(truck.business);
                  res.status(200).json({truck: truck});
              }
          })


      }
    });
  };

  // POST
  api.addTruck = function (req, res) {
    
    var truck;
      
    if(typeof req.body.truck == 'undefined'){
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
    
      if(typeof req.body.truck["business_id"] != 'undefined'){
        truck["business_id"] = req.body.truck["business_id"];
      }
    
      if(typeof req.body.truck["description"] != 'undefined'){
        truck["description"] = req.body.truck["description"];
      }  
    
      if(typeof req.body.truck["phone"] != 'undefined'){
        truck["phone"] = req.body.truck["phone"];
      }  
    
      if(typeof req.body.truck["schedule"] != 'undefined'){
        truck["schedule"] = req.body.truck["schedule"];
      }  
    

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
    return Truck.findById(id, function (err, truck) {
      return truck.remove(function (err) {
        if (!err) {
          console.log("removed truck");
          return res.send(204);
        } else {
          console.log(err);
          return res.json(500, err);
        }
      });
    });

  };


  app.get('/api/trucks', api.trucks);
  app.get('/api/trucks/:id', api.truck);
  app.post('/api/trucks', api.addTruck);
  app.put('/api/trucks/:id', api.editTruck);
  app.delete('/api/trucks/:id', api.deleteTruck);
};