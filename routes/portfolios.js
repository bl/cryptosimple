var path = require('path');
var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var db = require(path.join(__dirname, '..', 'config', 'db_init'));
var _ = require("underscore");

router.get('/', function(req, res, next) {
  db.portfolio.find().exec(function(err, records) {
    if (err) {
      console.log(err);
      return;
    }
    res.render('portfolios/index', {
      title: 'List of portfolios',
      portfolios: records,
    })
  });
});

router.get('/new', function(req, res, next) {
  var response = {
    title: 'Test this',
    assets: [
      { name: 'Bitcoin' },
      { name: 'Ethereum' }
    ]
  };
  if (req.query.error) {
    response.error = req.query.error;
  }

  res.render('portfolios/new', response);
});

router.get('/show/:id', function(req, res, next) {
  db.portfolio.findById(req.params.id).exec(function(err, record) {
    if(err) {
      console.log(err);
      return;
    }

    res.render('portfolios/show', record);
  });
});

router.post('/create', function(req, res, next) {
  var portfolio = new db.portfolio(req.body);
  if (!validatePortfolio(req.body)) {
    var errorMessage = "Assets provided are invalid";
    res.redirect(`new?error=${escape(errorMessage)}`);
    return;
  }

  portfolio.save(function(err, record) {
    if (err) {
      console.log(err);
      return;
    }

    res.redirect(`/portfolios/show/${record.id}`);
  });
});

function validatePortfolio(params) {
  var assets = _.map(params.assets, function(asset) { return parseInt(asset.quantity); });
  var assetTotal = _.reduce(assets, function(memo, num) {
    return memo + num;
  }, 0);
  if (assetTotal != 100) {
    return false;
  }

  return true;
}
module.exports = router;
