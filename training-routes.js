var express = require('express');
var router = express.Router();
var trainer = require('./trainer');


router.get('/getAllCharacters', function(req, res) {
  trainer.getAllCharacters(0,[], (str) => {
    res.send(str);
  });

});


router.get('/getAllEvents', function(req,res) {
  trainer.getAllEvents(0, [], function(results) {
    res.send(results);
  });
});

router.get('/getAllSeries', function(req,res) {
  trainer.getAllSeries(0, [], function(results) {
    res.send(results);
  });
});


router.get('/getAllComics', function(req, res) {
  trainer.getAllComics(0,[], (str) => {
    console.log(str);
    res.send(str);
  });

});

router.get('/trainEvent', function(req, res) {
  trainer.trainGetEvent(function(results) {
    res.send(results);
  });
});

router.get('/trainFriends', function(req, res) {
  trainer.trainFriends(function(results) {
    res.send(results);
  });
});

router.get('/trainMoreInfo', function(req, res) {
  trainer.trainMoreInfo(function(results) {
    res.send(results);
  });
});

router.get('/getComic',function(req, res) {
  marvel.getComic(function(response){
    res.send(response.data);
  });

});

module.exports = router;
