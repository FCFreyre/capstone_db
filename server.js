var express = require('express');
var mongodb = require('mongodb');
var cors = require('cors');
var bodyParser = require('body-parser');
var MongoClient = require('mongodb').MongoClient,
    format = require('util').format;

const app = express();
app.use(bodyParser.json())
app.use(cors())
const dbUrl = process.env.MONGODB_URI ||'mongodb://Coach123:coach@ds157682.mlab.com:57682/heroku_2hznvmql';

function validate(data) {
  let errors = {};
  if(data.title === '') errors.title = "Can't be empty";
  if(data.cover === '') errors.cover = "Can't be empty";
  const isValid = Object.keys(errors).length === 0
  return { errors, isValid };
}

mongodb.MongoClient.connect(dbUrl, function(err, db) {


  app.get('/api/plays', (req, res) => {
    db.collection('plays').find({}).toArray((err, plays) => {
      res.json({ plays });
    });
  });

  app.post('/api/plays', (req, res) => {
    const { errors, isValid } = validate(req.body);
    if (isValid){
      const { title, cover } = req.body
      db.collection('plays').insert({ title, cover }, (err, result) => {
        if (err) {
          res.status(500).json({ errors: { global: "Something went wrong"}})
        } else {
          res.json({ plays: result.ops[0] })
        }
      })
    } else {
      res.status(400).json({ errors });
    }
  })

  app.put('/api/plays/:_id', (req, res) => {
    const { errors, isValid } = validate(req.body);

    if(isValid) {
      const { title, cover } = req.body
      db.collection('plays').findOneAndUpdate(
        { _id: new mongodb.ObjectId(req.params._id) },
        { $set: {title, cover} },
        { returnOriginal: false },
        (err, result) => {
          if (err) { res.status(500).json({ errors: {global: err}}); return; }

          res.json({ play: result.value });
        }
      )
    } else {
      res.status(400).json({ errors });
    }
  })

  app.get('/api/plays/:_id', (req, res) => {
    db.collection('plays').findOne({ _id: new mongodb.ObjectId(req.params._id) }, (err, play) => {
      res.json({ play });
    })
  })

  app.delete('/api/plays/:_id', (req, res) => {
    db.collection('plays').deleteOne({ _id: new mongodb.ObjectId(req.params._id) }, (err, r) => {
      if (err) { res.status(500).json({ errors: { global: err}}); return; }

      res.json({})
    })
  })


  app.use((req, res) => {
    res.status(404).json({
      errors: {
        global: "Still working on it. Please try again later when we implement it."
      }
    })
  })


  app.listen(process.env.PORT || 8080, () => console.log('Server is running on 8080'));

});
