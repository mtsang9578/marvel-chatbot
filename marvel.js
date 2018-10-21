var md5 = require('md5');
var request = require('request');

var SpellChecker = require('simple-spellchecker');

var Character = require('./models').Character;
var Event = require('./models').Event;

var publicKey = 'c15ef0d1a88a996980a054a9cc28a7ab';
var privateKey = 'b69559945c9403fe0109082e377f0271c1d540e6';
var ts = '1';
var hash = md5(ts + privateKey + publicKey);

async function loadCharactersDictionary()
{
	promise = new Promise(function(resolve, reject) {
		Character.find({}, "name", function(err, characters)
		{
			var words = characters.map((char) => char.name);

			SpellChecker.getDictionary("en-US", "node_modules/simple-spellchecker/dict/", function(err, result) {
				var dictionary = result;

				dictionary.setWordlist(words);

				resolve(dictionary);
			});
		});
	});

	result = await promise;

	return result;
}

async function loadEventsDictionary()
{
	promise = new Promise(function(resolve, reject) {
		Event.find({}, "title", function(err, events)
		{
			var words = events.map((event) => event.title);

			SpellChecker.getDictionary("en-US", "node_modules/simple-spellchecker/dict/", function(err, result) {
				var dictionary = result;

				dictionary.setWordlist(words);

				resolve(dictionary);
			});
		});
	});

	result = await promise;

	return result;
}

function getBio(character, callback)
{
	var requestStr = 'https://gateway.marvel.com/v1/public/characters?name=' + character +
					'&ts=' + ts +
					'&apikey=' + publicKey +
					'&hash=' + hash;

	request(requestStr, {json:true}, function (error, response, body) {
		callback(body.data.results[0].description);
	});
}

function getCharacterByName(character, callback) {
	var requestStr = 'https://gateway.marvel.com/v1/public/characters?name=' + character +
					'&ts=' + ts +
					'&apikey=' + publicKey +
					'&hash=' + hash;

	request(requestStr, {json:true}, function (error, response, body) {
		console.log(body.data);
		callback(body.data.results[0]);
	});
}


function getEventByName(event, callback){

}

function getSeriesByName(series, callback){

}




function getComic(callback) {
	var requestStr = 'https://gateway.marvel.com/v1/public/comics?offset=' + 0 +
				'&limit=100' +
				'&ts=' + ts +
				'&apikey=' + publicKey +
				'&hash=' + hash;

	request(requestStr, {json:true}, function (error, response, body)
	{
		callback(response);
	});

}

function getAssociatedCharacters2(character, callback)
{
	var requestStr = 'https://gateway.marvel.com/v1/public/characters?name=' + character +
				'&ts=' + ts +
				'&apikey=' + publicKey +
				'&hash=' + hash;

	request(requestStr, {json: true}, function(error, response, body)
	{
		var allEvents = body.data.results[0].events.collectionURI + '?limit=100' +
				'&ts=' + ts +
				'&apikey=' + publicKey +
				'&hash=' + hash;

		request(allEvents, {json: true}, function(error, response, body)
		{
			promises = [];
			for (var i = 0; i < body.data.count; i++)
			{
				promises.push(new Promise((resolve, reject) => {
					var event = Event.findOne({ "id": body.data.results[i].id }, "characters", (err, result) =>
					{
						resolve(result.characters);
					});
				}));
			}

			var masterCharacters = {};

			Promise.all(promises).then((values) => {
				for (var i = 0; i < values.length; i++)
				{
					value = values[i];
					for (var j = 0; j < value.length; j++)
					{
						charName = value[j];

						if (charName in masterCharacters)
							masterCharacters[charName] += 1;
						else
							masterCharacters[charName] = 1;
					}
				}

				var charactersByAppearance = Object.keys(masterCharacters).sort((a,b) => masterCharacters[b] - masterCharacters[a]);

				callback(charactersByAppearance);
			});
		});
	});

	/*Person.findOne({ 'name': character }, 'name occupation', function (err, person) {
		if (err) return handleError(err);
		// Prints "Space Ghost is a talk show host".
		console.log('%s %s is a %s.', person.name.first, person.name.last,
		person.occupation);
	});*/
}

function getAssociatedCharacters(character, callback)
{
	var requestStr = 'https://gateway.marvel.com/v1/public/characters?name=' + character +
				'&ts=' + ts +
				'&apikey=' + publicKey +
				'&hash=' + hash;

	request(requestStr, {json: true}, function(error, response, body)
	{
		var allEvents = body.data.results[0].events.collectionURI + '?limit=100' +
				'&ts=' + ts +
				'&apikey=' + publicKey +
				'&hash=' + hash;

		request(allEvents, {json: true}, function(error, response, body)
		{
			var promises = [];

			for (var i = 0; i < body.data.count; i++)
			{
				eventURI = body.data.results[i].characters.collectionURI + '?limit=100' +
				'&ts=' + ts +
				'&apikey=' + publicKey +
				'&hash=' + hash;

				promises.push(new Promise((resolve, reject) =>
				{
					var characters = {};

					request(eventURI, {json: true}, function(error, response, body)
					{
						console.log("Processing...");
						for (var j = 0; j < body.data.count; j++)
						{
							var charName = body.data.results[j].name;

							if (charName in characters)
								characters[charName] += 1;
							else
								characters[charName] = 1;
						}

						resolve(characters);
					});
				}));
			}

			Promise.all(promises).then((values) => {
				var masterCharacters = {};

				for (var k = 0; k < values.length; k++)
				{
					for (var charName in values[k])
					{
						if (charName in masterCharacters)
							masterCharacters[charName] += values[k][charName];
						else
							masterCharacters[charName] = values[k][charName];
					}
				}

				var charactersByAppearance = Object.keys(masterCharacters).sort((a,b) => masterCharacters[b] - masterCharacters[a]);

				callback(charactersByAppearance);
			});
		});
	});
}


exports.getBio = getBio;
exports.getComic = getComic;

exports.getCharacterByName = getCharacterByName;
exports.loadCharactersDictionary = loadCharactersDictionary;
exports.loadEventsDictionary = loadEventsDictionary;


exports.getAssociatedCharacters = getAssociatedCharacters2;


