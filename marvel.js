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
exports.getComic = getComic;