var md5 = require('md5');
var request = require('request');
var Event = require('./models').Event;

var publicKey = 'c15ef0d1a88a996980a054a9cc28a7ab';
var privateKey = 'b69559945c9403fe0109082e377f0271c1d540e6';
var ts = '1';
var hash = md5(ts + privateKey + publicKey);

// Only handles <100 events
function getAllEvents(callback) {
	var requestStr = 'https://gateway.marvel.com/v1/public/events?' +
			'&limit=100' +
			'&ts=' + ts +
			'&apikey=' + publicKey +
			'&hash=' + hash;

	request(requestStr, {json: true}, function(error, response, body)
	{
		console.log("promise successful");
		promises = [];

		for (var i = 0; i < body.data.count; i++)
		{
			eventURI = body.data.results[i].resourceURI + '/characters?' +
					'&limit=100' +
					'&ts=' + ts +
					'&apikey=' + publicKey +
					'&hash=' + hash;

			promises.push(new Promise(function(resolve, reject) {
				var id = body.data.results[i].id;
				var title = body.data.results[i].title;

				request(eventURI, {json: true}, function(error, response, body)
				{
					var names = [];

					for (var j = 0; j < body.data.count; j++)
					{
						names.push(body.data.results[j].name);
					}

					resolve( {id: id, title: title, characters: names} );
				});
			}));
		}

		Promise.all(promises).then(function(results)
		{
			for (var i = 0; i < results.length; i++) {
				var event = new Event(results[i]);
				event.save(function(err) {
					if (err) {
						callback(err);
					} else {
						console.log("event saved");
					}
				});
			}
			callback("Successfully added events.");
		}).catch(function(error)
		{
			console.log(error);
			callback(error);
		});
	});
}

function getAllCharacters(offset, cumulativeNames, callback)
{
	var promise = new Promise((resolve, reject) =>
	{
		console.log("promise started " + offset);
		var requestStr = 'https://gateway.marvel.com/v1/public/characters?offset=' + offset +
				'&limit=100' +
				'&ts=' + ts +
				'&apikey=' + publicKey +
				'&hash=' + hash;

		request(requestStr, {json:true}, function (error, response, body) {

			count = body.data.count;
			for (var i = 0; i < count; i++)
			{
				cumulativeNames.push(
					{"name": body.data.results[i].name,
					"id": body.data.results[i].id,
					"picture": body.data.results[i].thumbnail.path + '.' + body.data.results[i].thumbnail.path}
				);
			}

			resolve({continue: count == 100, names: cumulativeNames})
		});
	});

	promise.then((data) =>{
		if (data.continue)
			getAllCharacters(offset+100, data.names, callback);
		else
			callback(data.names);
	});
}


exports.getAllCharacters = getAllCharacters;
exports.getAllEvents = getAllEvents;
