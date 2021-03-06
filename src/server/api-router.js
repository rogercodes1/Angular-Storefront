const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const checkJwt = require('express-jwt');
const mongoDB = require('mongodb')

function apiRouter(database) {
  const router = express.Router();

  router.post('/users', (req, res) => {
    const user = req.body;
    if (user.password) {
      user.password = bcrypt.hashSync(user.password, 10);
    }
    const usersCollection = database.collection('users');

    usersCollection.insertOne(user, (err, result) => {

      result = result.ops[0]
      if (!result) {
        return res.status(404).json({ error: 'Unable to Create user'})
      }

      const payload = {
        username: result.username,
        password: result.password
      }
      const  token = jwt.sign(payload, process.env.JWT_SECRET, {expiresIn: '9h'});
      return res.json({
        message: 'sucessfully logged in!!!',
        id: result._id,
        vendor: result.vendor,
        token: token
      });
    });
  });
// verify users with JWT
  router.use(
      checkJwt({ secret: process.env.JWT_SECRET }).unless({ path: '/api/authenticate'})
  );

  router.use((err, req, res, next) => {
    if (err.name === 'UnauthorizedError') {
      res.status(401).send({ error: err.message });
    }
  });
  router.get('/products', (req, res) => {
    console.log("Products loaded successfully...");
    const productsCollection = database.collection('products');

    productsCollection.find({}).toArray((err, docs) => {
      return res.json(docs)
    });

  });
  router.post('/products', (req, res) => {
    const user = req.body;
    console.log("post here");
    const productsCollection = database.collection('products');

    productsCollection.insertOne(user, (err, r) => {
      if (err) {
        return res.status(500).json({ error: 'Error inserting new record.' })
      }
      const newRecord = r.ops[0];

      return res.status(201).json(newRecord);
    });
  });

  router.post('/coupons', (req, res) => {
    const user = req.body;
    console.log("coupon being created");
    const couponsCollection = database.collection('coupons');

    couponsCollection.insertOne(user, (err, r) => {
      if (err) {
        return res.status(500).json({ error: 'Error inserting new coupon.' })
      }
      const newCoupon = r.ops[0];

      return res.status(201).json(newCoupon);
    });
  });
  // start of cart
  router.get('/cart', (req, res) => {
    console.log("Products loaded successfully...");
    const cartCollection = database.collection('cart');

    cartCollection.find({}).toArray((err, docs) => {
      return res.json(docs)
    });
  });
  router.post('/cart', (req, res) => {
    const user = req.body;
    console.log("Add to cart session");
    const cartCollection = database.collection('cart');

    cartCollection.insertOne(user, (err, r) => {
      if (err) {
        return res.status(500).json({ error: 'Error adding item to cart.' })
      }
      const newRecord = r.ops[0];

      return res.status(201).json(newRecord);
    });
  });
  // users with :id
  router.get('/users/:id', (req, res) => {
    const user_id = req.params.id;
    const id = new mongoDB.ObjectID(user_id);

    const usersCollection = database.collection('users');

    usersCollection.findOne({ _id: id })
    .then(userFound => {
      if (!userFound){ return res.status(404).end(); }
      return res.status(200).json(userFound)
    })
    .catch(err => console.log(err));

  });
  // add product to cart/session
  router.post('/users/:id', (req, res) => {
    const user_id = req.params.id;
    const id = new mongoDB.ObjectID(user_id);
    const newProduct = req.body
    const usersCollection = database.collection('users');

    usersCollection.findOneAndUpdate({ _id: id },{
      "$push": {
        cart: newProduct }
      },
        (err, r) => {
      if (err) {
        return res.status(500).json({ error: 'Error adding to cart' })
      }
      const newRecord = r.value.cart;

      return res.status(201).json(newRecord);
    });
  });

  // add product to cart/session
  router.put('/users/:id/cart', (req, res) => {
    const user_id = req.params.id;
    const item_id = req.body._id
    const id = new mongoDB.ObjectID(user_id);
    const productID = new mongoDB.ObjectID(item_id);
    // const newProduct = req.body

    const usersCollection = database.collection('users');
    usersCollection.findOneAndUpdate({
      "_id": id},{
      $pull:{ cart:{ "_id": item_id } }
      },
      {multi:true},
        (err, r) => {
      if (err) {
        return res.status(500).json({ error: 'Error adding to cart' })
      }
      const newRecord = r;

      return res.status(201).json(newRecord);
    });

  });

  router.post(`/coupons/:coupon`, (req, res) => {
    const coupon = req.params.coupon

    const couponsCollection = database.collection('coupons');

    couponsCollection.findOne({couponValue: coupon},
      (req, result)=>{
        if (!result) {
          // alert("Coupon not valid!!!")
          return res.status(204).json({ error: 'coupon not found'})
        }

        return res.status(201).json({
          message: "Success Coupon found!",
          couponCode: result.couponValue,
          discountValue: result.discountValue,
          discountType: result.discountType,
          couponID: result._id,
          vendorUsername: result.vendorUsername,
          data: result
        })

    });

  });

  router.get('/coupons', (req, res) => {
    console.log("Getting coupons loaded successfully...");
    const couponsCollection = database.collection('coupons');

    couponsCollection.find({}).toArray((err, docs) => {
      return res.json(docs)
    });

  });

  router.post('/authenticate', (req, res) => {
    const user = req.body;
    console.log("Authenticated!!!");
    const usersCollection = database.collection('users');

    usersCollection
      .findOne({ username: user.username }, (err, result)=>{
        if (!result) {
          // alert("User not found. Try signing up or resetting pw!");
          return res.status(204).json({ error: 'User not found'})
        }
        if (!bcrypt.compareSync(user.password, result.password)) {
          return res.status(401).json({ error: 'incorrect password'})
        }

        const payload = {
          username: result.username,
          admin: result.vendor
        }
        const  token = jwt.sign(payload, process.env.JWT_SECRET, {expiresIn: '9h'});
        return res.json({
          message: 'sucessfully logged in!!!',
          id: result._id,
          username: result.username,
          vendor: result.vendor,
          token: token
        });
      });
  })


  return router
}

module.exports = apiRouter
