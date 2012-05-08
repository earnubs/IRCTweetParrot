console.log('Starting bot...');

var ircLib = require('irc'),
    http = require('http'),
    url = require('url'),

    config = {
      server: 'irc.perl.org',
      channel: '#cabal',
      name: 'twitterbot'
    },

    client = new ircLib.Client(config.server, config.name, {
      channels: [config.channel]
    }),

    reName = new RegExp('^' + config.name, 'i'),
    reUrl = /((?:http|https):\/\/[a-z0-9\/\?=_#&%~-]+(\.[a-z0-9\/\?=_#!&%~-]+)+)|(www(\.[a-z0-9\/\?=_#&%~-]+){2,})/gi,
    reTwitterId = /\/(\d+)$/;

console.log('server: ' + config.server);
console.log('channel: ' + config.channel);
console.log('botname: ' + config.name);

client.addListener('message', function(from, to, message) {
  console.log(from + ' => ' + to + ': ' + message);

  if (reName.test(message)) {

    var link = reUrl.exec(message);

    if (link && link.length) {
    console.log('got a link');

      //set link to the matched string 
console.log(link);
      link = link[1];

      var twitterUrl = new url.parse(link),
          id = reTwitterId.exec(link);

console.log(id);
      if (id && id.length) {
        console.log('got an id');
        id = id[1];

        var options = {
          host: 'api.twitter.com',
          port: twitterUrl.port,
          path: '/1/statuses/show/' + id + '.json'
        };

        var request = http.get(options, function(res) {
          var data = '';

          res.on('data', function(chunk) {
            data += chunk;
          });

          res.on('end', function() {
            var tweet = JSON.parse(data);
            //console.log(tweet);
            client.say(config.channel, 'Tweet from: ' + tweet.user.screen_name);
            client.say(config.channel, tweet.text);
          });

        });

      }
    }
  }

});

//don't die on exceptions..
process.on('uncaughtException', function(err) {
  console.log(err);
});

client.join(config.ircChannel);
