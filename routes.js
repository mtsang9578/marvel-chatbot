"use strict";

// Routes, with inline controllers for each route.
var express = require('express');
var router = express.Router();
var Project = require('./models').Project;
var strftime = require('strftime');
var md5 = require('md5');
const https = require('https');
const request = require('request');

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
  // YOUR CODE HERE
  var publicKey = 'c15ef0d1a88a996980a054a9cc28a7ab';
  var privateKey = 'b69559945c9403fe0109082e377f0271c1d540e6';
  var ts = '1';
  var hash = md5(ts + privateKey + publicKey);
  request('https://gateway.marvel.com/v1/public/comics?ts=' + ts + '&apikey=' + publicKey + '&hash=' + hash, {json:true}, function (error, response, body) {
    console.log(body.data);
    res.render('index', {results: body.data});
  });

  // Project.find().then(projects => {
  //     res.render('index', {projects: projects})
  // });

});


// Part 2: Create project
// Implement the GET /new endpoint
router.get('/new', function(req, res) {
  // YOUR CODE HERE
  res.render('new')
});

// Part 2: Create project
// Implement the POST /new endpoint
router.post('/new', function(req, res) {
  var project = new Project({
    title: req.body.title,
    goal: req.body.goal,
    description: req.body.description,
    start: req.body.start,
    end: req.body.end
  });
  project.save(function(error){
    if (error) {
      // var title = req.body.title || error.errors['title'].message;
      // var goal = req.body.goal || error.errors['goal'].message;
      // var description = req.body.description || error.errors['description'].message;
      // var start = req.body.start || error.errors['start'].message;
      // var end = req.body.end || error.errors['end'].message;

      // res.render('new', {
      //   title: title,
      //   goal: goal,
      //   description: description,
      //   start: start,
      //   end: end
      // });
      res.render('new', {
        title: req.body.title,
        goal: req.body.goal,
        description: req.body.description,
        start: req.body.start,
        end: req.body.end,
        contributions: req.body.contributions,
        errors: error.errors
      });


    } else {
      Project.find().then(projects => {
        res.render('index', {projects: projects})
      });
    }
  });

});

// Part 3: View single project
// Implement the GET /project/:projectid endpoint
router.get('/project/:projectid', function(req, res) {

  Project.findById(req.params['projectid']).then(project => {
    if (project) {
       console.log(req.params['projectid'])
        res.render('project', {project: project});
    } else {
      res.send("no project found with the id ");
    }

  });
  // YOUR CODE HERE
});

// Part 4: Contribute to a project
// Implement the GET /project/:projectid endpoint
router.post('/project/:projectid', function(req, res) {
  //res.send(req.params['projectid']);
  Project.findById(req.params['projectid']).then(project => {
    if (project) {
      project.contributions.push({name: req.body.name, amount:req.body.amount});
      project.save(function(err) {
         res.render('project', {project: project});
      });
    }
  });
});

// Part 6: Edit project
// Create the GET /project/:projectid/edit endpoint
// Create the POST /project/:projectid/edit endpoint

module.exports = router;
