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

    if(!req.accepts('*/*') && req.accepts('application/json')) {
      renderJson(res, record);
    } else {
      res.render('accounts/show', record);
    }
  });
});

router.post('/:id/trade', function(req, res, next) {
  var deposit = req.amount;
  // buy BTC at the rate requested
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

function renderJson(res, body) {
  res.type('json');
  res.send(JSON.stringify(body));
}

module.exports = router;
