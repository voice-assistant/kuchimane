'use strict'

const HelloIntent = function() {
  this.response.speak('Hello! Good day.');
  this.response.listen('Hello! Good day.');
  this.emit(":responseReady");
};

const ByeIntent = function() {
  this.response.speak('See you!');
  this.emit(":responseReady");
};

const LaunchRequest = function() {
  this.response.speak('Welocome to GreetingBot');
  this.response.listen('Welocome to GreetingBot');
  this.emit(":responseReady");
};

export { LaunchRequest, HelloIntent, ByeIntent };
