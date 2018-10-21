"use strict";

// Project model
var mongoose = require('mongoose');

var Character = mongoose.model('Character', {
  name: {
    type: String,
    required: true
  },
   id: {
    type: String,
    required: true
  },
   picture: {
    type: String
  },
  sentiment: {
    type: Number
  }
});


var Event = mongoose.model('Event', {
  title: {
    type: String,
    required: true
  },
   id: {
    type: String,
    required: true
  },
  characters: [String]
});

module.exports = {
  Event: Event,
  Character: Character
}
