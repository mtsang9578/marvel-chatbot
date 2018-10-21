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

function trainGetEvent(callback) {
    jsonResults = []
    getEvents(30, function(results) {
        for (var i = 0; i < results.length; i++){
            var start = "what happens in ".length;
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


exports.trainGetEvent = trainGetEvent;
