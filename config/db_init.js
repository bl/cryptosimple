var mongoose = require('mongoose');
var _ = require("underscore");

function init() {
  mongoose.connect('mongodb://localhost/cryptosimple');
  var Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

  var PortfolioSchema = new Schema({
    name: String,
    assets: [{
      name: String,
      allocation: Number 
    }],
  });
  var Portfolio = mongoose.model('Portfolio', PortfolioSchema);

  var AccountSchema = new Schema({
    name: String,
    assets: [{
      name: String,
      allocation: Number,
      wallet: String,
      bookvalue: Number,
      amount: Number,
    }],
  });
  AccountSchema.methods.amount = function(cb) {
    var amount = _.map(this.assets, function(asset) { return parseInt(asset.amount); });
    cb(amount);
  };

  var Account = mongoose.model('Account', AccountSchema);

  var AccessCredentialsSchema = new Schema({
    session_id: String,
    access_token: String,
    token_type: String,
    expires: Date,
    refresh_token: String,
    scope: [String]
  });

  var AccessCredentials = mongoose.model('AccessCredentials', AccessCredentialsSchema);

  return {
    portfolio: Portfolio,
    account: Account,
    access_credentials: AccessCredentials
  }
};

module.exports = init();
