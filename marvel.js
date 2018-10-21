var md5 = require('md5');
var request = require('request');

var publicKey = 'c15ef0d1a88a996980a054a9cc28a7ab';
var privateKey = 'b69559945c9403fe0109082e377f0271c1d540e6';
var ts = '1';
var hash = md5(ts + privateKey + publicKey);

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

function getCharacters(offset, cumulativeNames, callback)
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
					{"canonicalForm": body.data.results[i].name,
					"list":[]}
				);
			}

			resolve({continue: count == 100, names: cumulativeNames})
		});
	});

	promise.then((data) =>{
		if (data.continue)
			getCharacters(offset+100, data.names, callback);
		else
			callback(data.names);
	});
}

function getComics(offset, cumulativeComics, callback)
{
	var promise = new Promise((resolve, reject) =>
	{
		console.log("promise started " + offset);
		var requestStr = 'https://gateway.marvel.com/v1/public/comics?offset=' + offset +
				'&limit=100' +
				'&ts=' + ts +
				'&apikey=' + publicKey +
				'&hash=' + hash;

		request(requestStr, {json:true}, function (error, response, body) {

			count = body.data.count;
			for (var i = 0; i < count; i++)
			{
				cumulativeComics.push(
					{"canonicalForm": body.data.results[i].title,
					"list":[]}
				);
			}

			resolve({continue: count == 100, comics: cumulativeComics})
		});
	});

	promise.then((data) =>{
		if (data.continue)
			getComics(offset+100, data.comics, callback);
		else
			callback(data.comics);
	});
}

function getComic(callback) {
	var requestStr = 'https://gateway.marvel.com/v1/public/comics?offset=' + 0 +
				'&limit=100' +
				'&ts=' + ts +
				'&apikey=' + publicKey +
				'&hash=' + hash;

		request(requestStr, {json:true}, function (error, response, body) {

			callback(response);
		});

}


exports.getBio = getBio;
exports.getCharacters = getCharacters;
exports.getComics = getComics;
exports.getComic = getComic;