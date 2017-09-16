var express = require('express');
var path = require('path');
var router = express.Router();
const querystring = require('querystring');
var request = require('request');
var db = require(path.join(__dirname, '..', 'config', 'db_init'));

const COINBASE_TOKEN_URL = 'https://api.coinbase.com/oauth/token/';
const REDIRECT_URL = 'http://localhost:3000/coinbase/callback/';

router.get('/callback', function(req, res, next) {
  const accessCredentialsOptions = {
    code: req.query.code,
    sessionId: req.session.id,
  };
  storeAccessCredentials(accessCredentialsOptions, function() {
    res.render('coinbase/authorized');
  });
});

router.get('/authorize', function(req, res, next) {
  query = {
    response_type: 'code',
    client_id: process.env.COINBASE_CLIENT_ID,
    state: randomHash(),
    scope: 'wallet:accounts:read',
    //redirect_uri: REDIRECT_URL // optional: if not provided, default one in app config is used
  };
  res.render('coinbase/authorize', {
    auth_url: `https://www.coinbase.com/oauth/authorize?${querystring.stringify(query)}`
  });
});

function randomHash() {
  return Math.random().toString(36).substring(7);
}

function storeAccessCredentials(opts, cb) {
  const params = {
    grant_type: 'authorization_code',
    code: opts.code,
    client_id: process.env.COINBASE_CLIENT_ID,
    client_secret: process.env.COINBASE_CLIENT_SECRET,
    redirect_uri: REDIRECT_URL
  };
  const requestOptions = {
    method: 'post',
    json: params,
    uri: COINBASE_TOKEN_URL
  };

  request(requestOptions, function(err, res, body) {
    if(err || res && res.statusCode >= 400) {
      console.log(err);
      console.log(res.statusCode);
      console.log(body);
      return;
    }
    console.log(body);

    // persist access credentials
    var expireTime = new Date();
    expireTime.setSeconds(expireTime.getSeconds() + body.expires_in);
    var creds = new db.access_credentials({
      session_id: opts.sessionId,
      access_token: body.access_token,
      token_type: body.token_type,
      expires: expireTime,
      refresh_token: body.refresh_token,
      scope: body.scope.split(' ')
    });

    creds.save(function(err, record) {
      if(err) {
        console.log(err);
        return;
      }

      cb();
    });
  });

}

module.exports = router;
