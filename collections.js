var md5 = require('md5');
var request = require('request');

var publicKey = 'c15ef0d1a88a996980a054a9cc28a7ab';
var privateKey = 'b69559945c9403fe0109082e377f0271c1d540e6';
var ts = '1';
var hash = md5(ts + privateKey + publicKey);

function getAllEvents(offset, results, callback) {
    var promise = new Promise((resolve, reject) =>
    {
        console.log("promise started " + offset);
        var requestStr = 'https://gateway.marvel.com/v1/public/events?offset=' + offset +
                '&limit=100' +
                '&ts=' + ts +
                '&apikey=' + publicKey +
                '&hash=' + hash;

        request(requestStr, {json:true}, function (error, response, body) {
            count = body.data.count;
            for (var i = 0; i < count; i++)
            {
                var characters = body.data.results[i].characters.items;
                var characterNames = []
                for(var j = 0; j < characters.length; j++) {
                    characterNames.push(characters[j].name);
                }

                results.push(
                    {"title": body.data.results[i].title,
                    "id": body.data.results[i].id,
                    "characters": characterNames}
                );
            }
            resolve({continue: count == 100, results: results})
        });
    });

    promise.then((data) =>{
        if (data.continue)
            getAllEvents(offset+100, data.results, callback);
        else
            callback(data.results);
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
