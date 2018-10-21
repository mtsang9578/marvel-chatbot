"use strict";

// Routes, with inline controllers for each route.
var express = require('express');
var router = express.Router();
var Project = require('./models').Project;
var strftime = require('strftime');
var md5 = require('md5');
const https = require('https');
const request = require('request');

const marvel = require('./marvel.js');
const trainer = require('./trainer.js');

var trainingRoutes = require('./training-routes');

// Example endpoint
router.get('/create-test-project', function(req, res) {
  var project = new Project({
    title: 'I am a test project'
  });
  project.save(function(err) {
    if (err) {
      res.status(500).json(err);
    } else {
      res.send('Success: created a Project object in MongoDb');
    }
  });
});

// Part 1: View all projects
// Implement the GET / endpoint.
router.get('/', function(req, res) {
  res.render("index");
});

router.get("/test", function(req, res)
{
  marvel.test((data) => {
    res.send(data);
  });
});

router.get('/submitQuery', function (req, res) {
  //var query = req.body.query;
  var query = "who is Spider-Man"
  query = query.replace(' ', '+');
  request('https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/8dbc2125-1d25-4183-92f6-0fda50b5c440?subscription-key=a8b41509fd9b4a7c9326106cf91203e3&timezoneOffset=-360&q='
    + query, {json:true}, function(error, response, body) {
      var topIntent = body.topScoringIntent;
      var entity = body.entities[0];

      console.log(entity);


      if (topIntent.intent == 'GetBio') {
        var entity = '';
        for (var i = 0; i < body.entities.length; i++) {
          if(body.entities[i].type == "CharacterList") {
            entity = body.entities[i].entity;
          }
        }

        marvel.getCharacterByName(entity, function(result) {


        })




      }
      res.send();



  });
});

module.exports = router;
