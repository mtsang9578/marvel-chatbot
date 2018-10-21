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

router.get('/', function(req, res) {
	res.render("index");
});

router.get("/test", function(req, res)
{
	marvel.getAssociatedCharacters("Thor", function(result) {
		res.send(result);
	});
});

router.get('/submitQuery', function (req, res) {
	var url = require('url');
	var url_parts = url.parse(req.url, true);
	var query = url_parts.query;
	console.log(query);

	query = query.text.replace(' ', '+');
	request('https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/8dbc2125-1d25-4183-92f6-0fda50b5c440?subscription-key=a8b41509fd9b4a7c9326106cf91203e3&timezoneOffset=-360&q='
		+ query, {json:true}, function(error, response, body)
	{

    var topIntent = body.topScoringIntent;
      var entity;
      console.log("detected entity " + body.entities);

		marvel.loadCharactersDictionary().then(function(dictionary)
		{
			var topIntent = body.topScoringIntent;
      var entity;


			if (body.entities.length == 0)
			{
				console.log("No entity detected");
				entity == null;
			}
			else if (body.entities.length == 1)
			{
				entity = body.entities[0];
			}
			else // Only case should be Character and CharacterList - return the other
			{
				if (body.entities[0].type == "Character")
				{
					entity = body.entities[1];
				}
				else
				{
					entity = body.entities[0];
				}
			}

			if (entity != null)
			{
				if (entity.type == "Character")
				{
					entity = dictionary.getSuggestions(entity.entity, 1, 2)[0];
				}
				else if (entity.type == "SeriesList")
				{
					entity = entity.resolution.values[0].split(" (")[0];
				}
				else
				{
					entity = entity.resolution.values[0];
				}
			}

			console.log(topIntent);
			console.log(entity);
			console.log(body.entities);

			if (entity == null)
			{
				res.send({type: "unknown", results: "I'm not sure what you're asking. Please try again!"});
			}
			else if (topIntent.intent == 'GetBio')
			{
				marvel.getCharacterByName(entity, function(result)
				{
					console.log("got charadtersByName");
					console.log(result);
					res.send({type:"character", results:result});
				});
			}
			else if (topIntent.intent == 'GetAppearance')
			{
				marvel.getCharacterAppearance(entity, function(result)
				{
					console.log("got character apperances");
					console.log(result);
					res.send({type:"image", results:result});
				});
			}
			else if (topIntent.intent == 'GetFriends')
			{
				marvel.getAssociatedCharacters(entity, function(result) {
					var names = result.slice(1, Math.min(result.length, 5));
					names = entity + "'s friends are " +
							names.slice(0, names.length - 1).join(", ") +
							", and " + names[names.length - 1];

					console.log("got getAssociatedCharacters");
					console.log(result);
					res.send({type:"friends", results:names});
				});
			}



      else if (topIntent.intent == 'GetMoreInfo') {
        marvel.getCharacterByName(entity, function(result) {
          console.log("got more info");
          console.log(result.urls[0].url);
          res.send({type:"links", results:result.urls[0].url});
        });
      }





      else if (topIntent.intent == 'GetEvent') {
        marvel.getEventByName(entity, function(result) {
          console.log("getting event");
          res.send({type:"event", results:result});
        });
      }


      else if (topIntent.intent == 'GetComicCover') {
        console.log("getting comic cover");
        marvel.getComicCover(entity, function(result) {
          res.send({type:"comicCover", results:result});
        });
      }

      else if (topIntent.intent == 'GetComicsByName') {
        marvel.getEventByName(entity, function(result) {
          console.log("getting comic by Name");
          res.send({type:"comic", results:result});
        });
      }


	    else if (topIntent.intent == 'GetSeries') {
	        marvel.getSeriesByName(entity, function(result) {
	          	res.send({type:"series", results:result});
	        });
	    }

		});
	});
});

module.exports = router;
