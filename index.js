#!/usr/bin/env node

var request = require('request');
var inquirer = require('inquirer');
var spawn = require('child_process').spawn;

var API = {
    dr: 'http://www.dr.dk/mu-online/api/1.1/channel/all-active-dr-tv-channels'
};

process.title = 'drcast';

request({
    method: 'GET',
    uri: API.dr
}, function(err, response, body) {

    if (err) {
        throw new Error('API query failure: ' + err.message);
    }

    var result = JSON.parse(body);
    var channels = result;

    inquirer.prompt([{
        name: 'channel',
        type: 'list',
        message: 'Please choose a channel',
        choices: channels.map(function(channel) {
            return {
                name: channel.Title,
                value: channel
            };
        })
    }], function(answers) {

        var options = [];
        var channel = answers.channel;
        var HLSstream = channel.StreamingServers.filter(function(item) {
            return item.LinkType === 'HLS';
        })[0];

        if(HLSstream) {
            var streamUrl = HLSstream.Server + '/' + HLSstream.Qualities[0].Streams[0].Stream;
            console.log('.. stream found', streamUrl);
            console.log('.. booting castnow');
            return spawn('node_modules/castnow/index.js', [streamUrl].concat(options), { stdio: 'inherit' });

        } else {
            console.error('.. stream not found');
        }
        
    });

});