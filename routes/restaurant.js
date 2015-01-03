module.exports = function(app) {
  // Module dependencies.
  var mongoose = require('mongoose'),
      Restaurant = mongoose.models.Restaurant,
      api = {};

  // ALL
  api.restaurants = function (req, res) {

      if(req.query.name){
          req.query.name = new RegExp(req.query.name, "i");
      }

    Restaurant.find(req.query, function(err, restaurants) {
      if (err) {
        res.json(500, err);
      } else {    
        res.json({restaurants: restaurants});
      }
    });
  };

  // GET
  api.restaurant = function (req, res) {
    var id = req.params.id;
    Restaurant.findOne({ '_id': id }, function(err, restaurant) {
      if (err) {
        res.json(404, err);
      } else {
        res.json({restaurant: restaurant});
      }
    });
  };

  // POST
  api.addRestaurant = function (req, res) {
    
    var restaurant;
      
    if(typeof req.body.restaurant == 'undefined'){
         res.status(500);
         return res.json({message: 'restaurant is undefined'});
    }

    restaurant = new Restaurant(req.body.restaurant);

    restaurant.save(function (err) {
      if (!err) {
        console.log("created restaurant");
        return res.json(201, restaurant.toObject());
      } else {
        return res.json(500, err);
      }
    });

  };

  // PUT
  api.editRestaurant = function (req, res) {
    var id = req.params.id;

    Restaurant.findById(id, function (err, restaurant) {


    
      if(typeof req.body.restaurant["name"] != 'undefined'){
        restaurant["name"] = req.body.restaurant["name"];
      }  
    
      if(typeof req.body.restaurant["address"] != 'undefined'){
        restaurant["address"] = req.body.restaurant["address"];
      }  
    
      if(typeof req.body.restaurant["city"] != 'undefined'){
        restaurant["city"] = req.body.restaurant["city"];
      }  
    
      if(typeof req.body.restaurant["state"] != 'undefined'){
        restaurant["state"] = req.body.restaurant["state"];
      }  
    
      if(typeof req.body.restaurant["zip"] != 'undefined'){
        restaurant["zip"] = req.body.restaurant["zip"];
      }  
    
      if(typeof req.body.restaurant["phone"] != 'undefined'){
        restaurant["phone"] = req.body.restaurant["phone"];
      }  
    
      if(typeof req.body.restaurant["email"] != 'undefined'){
        restaurant["email"] = req.body.restaurant["email"];
      }  
    
      if(typeof req.body.restaurant["website"] != 'undefined'){
        restaurant["website"] = req.body.restaurant["website"];
      }  
    
      if(typeof req.body.restaurant["cuisine"] != 'undefined'){
        restaurant["cuisine"] = req.body.restaurant["cuisine"];
      }  
    

      return restaurant.save(function (err) {
        if (!err) {
          console.log("updated restaurant");
          return res.json(200, restaurant.toObject());        
        } else {
         return res.json(500, err);
        }
        return res.json(restaurant);
      });
    });

  };

  // DELETE
  api.deleteRestaurant = function (req, res) {
    var id = req.params.id;
    return Restaurant.findById(id, function (err, restaurant) {
      return restaurant.remove(function (err) {
        if (!err) {
          console.log("removed restaurant");
          return res.send(204);
        } else {
          console.log(err);
          return res.json(500, err);
        }
      });
    });

  };


  app.get('/api/restaurants', api.restaurants);
  app.get('/api/restaurants/:id', api.restaurant);
  app.post('/api/restaurants', api.addRestaurant);
  app.put('/api/restaurant/:id', api.editRestaurant);
  app.delete('/api/restaurant/:id', api.deleteRestaurant);
};