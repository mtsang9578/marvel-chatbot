"use strict";

// Routes, with inline controllers for each route.
var express = require('express');
var router = express.Router();
var Character = require('./models').Character;
var Event = require('./models').Event;
var strftime = require('strftime');
var md5 = require('md5');
const https = require('https');
const request = require('request');

const marvel = require('./marvel.js');
const collections = require('./collections.js');


// Example endpoint
router.get('/create-test-character', function(req, res) {
  var character = new Character({
    name: 'I am a test character',
    id:'31231'
  });
  character.save(function(err) {
    if (err) {
      res.status(500).json(err);
    } else {
      res.send('Success: created a characterc object in MongoDb');
    }
  });
});

router.get('/addAllCharacters', function(req,res) {
  collections.getAllCharacters(0, [], function(results) {
    for (var i = 0; i < results.length; i++) {
       var character = new Character(results[i]);
       character.save(function(err) {
        if (err) {
          console.log(err);
        } else {
          console.log("character saved");
        }
      });
    }

  });

});


router.get('/addAllEvents', function(req,res) {
  collections.getAllEvents((msg) => {
    res.send(msg);
  });
});


router.get('/create-test-character', function(req, res) {
  var character = new Character({
    name: 'I am a test character',
    id:'31231'
  });
  character.save(function(err) {
    if (err) {
      res.status(500).json(err);
    } else {
      res.send('Success: created a character object in MongoDb');
    }
  });
});




module.exports = router;
