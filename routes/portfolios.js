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

    var payload = {
      title: 'List of portfolios',
      portfolios: records,
    };
    if(!req.accepts('*/*') && req.accepts('application/json')) {
      renderJson(res, payload);
    } else {
      res.render('portfolios/index', payload);
    }
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

    if(!req.accepts('*/*') && req.accepts('application/json')) {
      renderJson(res, record);
    } else {
      res.render('portfolios/show', record);
    }
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

    if(!req.accepts('*/*') && req.accepts('application/json')) {
      renderJson(res, record);
    } else {
      res.redirect(`/portfolios/show/${record.id}`);
    }
  });
});

function validatePortfolio(params) {
  var assets = _.map(params.assets, function(asset) { return parseInt(asset.allocation); });
  var assetTotal = _.reduce(assets, function(memo, num) {
    return memo + num;
  }, 0);
  if (assetTotal != 100) {
    return false;
  }

  return true;
}

function renderJson(res, body) {
  res.type('json');
  res.send(JSON.stringify(body));
}

module.exports = router;
