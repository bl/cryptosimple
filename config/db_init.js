var mongoose = require('mongoose');

function init() {
  mongoose.connect('mongodb://localhost/cryptosimple');
  var Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

  var PortfolioSchema = new Schema({
    name: String,
    assets: [{
      name: String,
      quantity: Number 
    }],
  });
  var Portfolio = mongoose.model('Portfolio', PortfolioSchema);

  return {
    portfolio: Portfolio,
  }
};

module.exports = init();
