var express = require('express');
var path = require('path');
var router = express.Router();
var db = require(path.join(__dirname, '..', 'config', 'db_init'));
var _ = require("underscore");

router.get('/show/:id', function(req, res, next) {
  db.account.findById(req.params.id).exec(function(err, record) {
    if(err) {
      console.log(err);
      return;
    }

    res.render('accounts/show', record);
  });
});

router.post('/create', function(req, res, next) {
  buildAccount(req.body.portfolio, function(account) {
    // perform calls out to brokerage

    // update:
    //  wallet
    //  bookvalue
    account.save(function(err, record) {
      if (err) {
        console.log(err);
        return;
      }

      res.redirect(`/accounts/show/${record.id}`);
    });
  });
});

function buildAccount(portfolioId, cb) {
  getPortfolio(portfolioId, function(portfolio) {
    var accountParams = {
      name: `${portfolio.name} Account`,
      assets: _.clone(portfolio.assets),
    };
    var account = new db.account(accountParams);
    cb(account);
  });
}

function getPortfolio(portfolioId, cb) {
  db.portfolio.findById(portfolioId).exec(function(err, record) {
    if(err) {
      console.log(err);
      return;
    }
    
    cb(record);
  });
}

module.exports = router;
