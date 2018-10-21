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
  marvel.loadEventsDictionary().then(function(dictionary)
  {
    var suggest = dictionary.getSuggestions("spider - man", 5, 5);
    res.send(suggest);
  });
});

router.get('/submitQuery', function (req, res) {
  var url = require('url');
  var url_parts = url.parse(req.url, true);
  var query = url_parts.query;
  console.log(query);

  //TODO: SPELL CHECK



  //var query = "who is Spider-Man"
  query = query.text.replace(' ', '+');
  request('https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/8dbc2125-1d25-4183-92f6-0fda50b5c440?subscription-key=a8b41509fd9b4a7c9326106cf91203e3&timezoneOffset=-360&q='
    + query, {json:true}, function(error, response, body) {
      var topIntent = body.topScoringIntent;
      var entity = body.entities[0];
      console.log(entity);

      if (topIntent.intent == 'GetBio') {
        var entity = '';
        for (var i = 0; i < body.entities.length; i++) {
          if(body.entities[i].type == "CharacterList") {
            entity = body.entities[i].resolution.values[0];
          }
        }
        console.log("passing the entity: " + entity);

        marvel.getCharacterByName(entity, function(result) {
          console.log("got charactersByName");
          console.log(result);
          res.send({type:"character", results:result});
        });
      }
  });


});

module.exports = router;
