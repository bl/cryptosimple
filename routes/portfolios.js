var path = require('path');
var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var db = require(path.join(__dirname, '..', 'config', 'db_init'));

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
  res.render('portfolios/new', {
    title: 'Test this',
    assets: [
      { name: 'Bitcoin', },
      { name: 'Ethereum' }
    ]
  });
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
  portfolio.save(function(err, record) {
    if (err) {
      console.log(err);
      return;
    }

    res.redirect(`/portfolios/show/${record.id}`);
  });
});

module.exports = router;
