var express = require('express');
var path = require('path');
var router = express.Router();
var db = require(path.join(__dirname, '..', 'config', 'db_init'));
var _ = require("underscore");
var Client = require('coinbase').Client;

router.get('/show/:id', function(req, res, next) {
  retrieveAccount(req.params.id, function(account) {
    authorizedClient(req.session.id, function(err, client) {
      if (err) {
        res.redirect('/coinbase/authorize');
        return;
      }

      // display the current market value of portfolio
      // update account value
      _.each(account.assets, function(asset) {
        // skip over wallets that aren't available
        if (!asset.wallet) {
          return;
        }

        client.getAccount(asset.wallet, function(err, coinbaseAcct) {
          var payload = _.clone(account);
          payload.balance = coinbaseAcct.balance;
          if (req.query.message) {
            payload.message = req.query.message;
          }
          if(!req.accepts('*/*') && req.accepts('application/json')) {
            renderJson(res, payload);
          } else {
            res.render('accounts/show', payload);
          }
        });
      });
    });
  });
});

router.post('/:id/trade', function(req, res, next) {
  var deposit = req.body.amount;
  // buy crypto at the rate requested
  retrieveAccount(req.params.id, function(account) {
    authorizedClient(req.session.id, function(err, client) {
      if (err) {
        res.redirect('/coinbase/authorize');
        return;
      }

      //issueBuys(account, client, deposit);

      if(!req.accepts('*/*') && req.accepts('application/json')) {
        renderJson(res, account);
      } else {
        var message = "Trade has been successfully made";
        res.redirect(`/accounts/show/${account.id}?message=${escape(message)}`);
      }
    });
  });
});

router.post('/create', function(req, res, next) {
  buildAccount(req.body.portfolio, function(account) {
    authorizedClient(req.session.id, function(err, client) {
      if (err) {
        res.redirect('/coinbase/authorize');
        return;
      }

      // set wallets to account object
      setWallets(account, client, function() {
        account.save(function(err, record) {
          if (err) {
            console.log(err);
            return;
          }

          console.log(record);
          res.redirect(`/accounts/show/${record.id}`);
        });
      });
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

function authorizedClient(sessionId, cb) {
  var access_credentials = db.access_credentials.findOne({session_id: sessionId})
    .exec(function(err, record) {
      if (err || !record) {
        console.log(err);
        cb(true, null);
        return;
      }

      var client = new Client({'accessToken': record.access_token, 'refreshToken': record.refresh_token});
      cb(null, client);
    });
};

function setWallets(account, client, cb) {
  // set bookvalue to 0
  _.each(account.assets, function(asset) {
    asset.bookvalue = 0;
  });

  // set wallets
  client.getAccounts({}, function(err, accounts) {
    _.each(accounts, function(coinbaseAcct) {
      switch(coinbaseAcct.currency.code) {
        case 'BTC':
          updateAssetWallet(account, coinbaseAcct, 'bitcoin');
          break;
        case 'ETH':
          updateAssetWallet(account, coinbaseAcct, 'ethereum');
          break;
        case 'LTC':
          updateAssetWallet(account, coinbaseAcct, 'litecoin');
          break;
      }
    });
    cb(accounts);
  });
}

function updateAssetWallet(account, coinbaseAcct, cryptoCoinName) {
  var assets = account.assets;
  _.map(assets, function(asset) {
    if (asset.name.toLowerCase() == cryptoCoinName) {
      asset.wallet = coinbaseAcct.id;
    }
    return asset;
  });
}

function retrieveAccount(accountId, cb) {
  db.account.findById(accountId).exec(function(err, record) {
    if(err) {
      console.log(err);
      return;
    }

    cb(record);
  });
}

function issueBuys(account, client, deposit) {
  var assets = _.filter(account.assets, function(asset) { return !!asset.wallet })
  _.each(assets, function(asset) {
    var amountToBuy = deposit * (asset.allocation / 100);
    client.getAccount(asset.wallet, function(err, coinbaseAcct) {
      client.getBuyPrice({'currency': 'USD'}, function(err, buyPrice) {
        if (parseFloat(buyPrice['amount']) <= amountToBuy) {
          coinbaseAcct.buy({'amount': '1', 'currency': 'BTC'}, function(err, buy) {
            console.log(buy);
          });
        }
      });
    });
  });
}

module.exports = router;
