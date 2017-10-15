const cheerio = require('cheerio'),
      snekfetch = require('snekfetch'),
      querystring = require('querystring'),
      Command = require('../base/Command.js');

class Google extends Command {
    constructor(client) {
        super(client, {
            name: 'search',
            description: 'Searches something on Google.',
            extended: 'Searches Google for your question.',
            category: 'Utilities',
            usage: 'google [search]',
            botPerms: ['SEND_MESSAGES'],
            permLevel: 'User'
        })
    }

    async run(message, level) {
            const searchMessage = await message.reply('Searching... Please wait.');
            const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(message.content)}`;
            return snekfetch.get(searchUrl).then((result) => {
                const $ = cheerio.load(result.text);
                let googleData = $('.r').first().find('a').first().attr('href');
                googleData = querystring.parse(googleData.replace('/url?', ''));
                searchMessage.edit(`Result found!\n${googleData.q}`);
            }).catch((err) => {
                searchMessage.edit('No results found.');
        })
    }
}

module.exports = Google;