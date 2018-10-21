var md5 = require('md5');
var request = require('request');

var publicKey = 'c15ef0d1a88a996980a054a9cc28a7ab';
var privateKey = 'b69559945c9403fe0109082e377f0271c1d540e6';
var ts = '1';
var hash = md5(ts + privateKey + publicKey);

function getEvents(numEvents, callback)
{
    var requestStr = 'https://gateway.marvel.com/v1/public/events?'+
                    '&limit=' + numEvents +
                    '&ts=' + ts +
                    '&apikey=' + publicKey +
                    '&hash=' + hash;

    request(requestStr, {json:true}, function (error, response, body) {

        callback(body.data.results);
    });
}

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
                results.push(
                    {"canonicalForm": body.data.results[i].title,
                    "list":[]}
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

function trainGetEvent(callback) {
    jsonResults = []
    getEvents(30, function(results) {
        for (var i = 0; i < results.length; i++){
            var start = "what happens in ".length;
            console.log(results[i].title)
            jsonResults.push({
                "text": "what happens in " + results[i].title + " event",
                "intent": "GetEvent",
                "entities":
                [
                    {
                        "entity": "Event",
                        "startPos": start,
                        "endPos": start + results[i].title.length
                    }
                ]

            });
        }
         callback(jsonResults);
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
                    {"canonicalForm": body.data.results[i].name,
                    "list":[]}
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


function getAllComics(offset, cumulativeComics, callback)
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
            getAllComics(offset+100, data.comics, callback);
        else
            callback(data.comics);
    });
}


exports.trainGetEvent = trainGetEvent;
exports.getAllEvents = getAllEvents;
exports.getAllCharacters = getAllCharacters;
exports.getAllComics = getAllComics;