const Moderation = require('../../base/Moderation.js');

class Blacklist extends Moderation {
  constructor(client) {
    super(client, {
      name: 'blacklist',
      description: 'Blacklists a nominated user.',
      usage: 'blacklist <add|remove> <mention/userid> [list|view]',
      category: 'Moderation',
      extended: 'This is a global blacklist, any user on this list cannot use the bot at all.',
      botPerms: [],
      permLevel: 'Bot Admin'
    });
  }

  async run(message, args, level) {
    if (!args[0] && !message.flags.length) message.flags.push('list');
    if (!message.flags.length) {
      throw `${message.author} |\`❌\`| Invalid command usage, \`${this.help.usage}\`.`;
    }

    const blacklist = this.client.blacklist.get('list');
    
    switch (message.flags[0]) {
      case ('add'): {
        const author = message.mentions.users.first() || await this.client.fetchUser(args[0]);
        const member = message.guild.member(author);
        const reason   = args.splice(1, args.length).join(' ');        
        if (!author) return message.channel.send('You must supply a user id or mention to blacklist them.');
        if (blacklist.includes(author.id)) return message.reply('That user is already blacklisted.');
        if (message.author.id === author.id) return message.reply('You cannot blacklist yourself. ~~idiot~~');
        const msg = { author:author, member:member, guild: message.guild, client: this.client, channel: message.channel };
        if (level <= this.client.permlevel(msg)) return message.reply('You cannot black list someone of equal, or a higher permission level.');
        blacklist.push(author.id);
        this.client.blacklist.set('list', blacklist);
        await this.buildModLog(this.client, message.guild, 'bl', await this.client.fetchUser(author), message.author, reason);
        await message.channel.send('User successfully added to blacklist.');
        break;
      }

      case ('remove'): {
        const author = message.mentions.users.first() || await this.client.fetchUser(args[0]);
        if (!author) return message.channel.send('You must supply a user id or mention to blacklist them.');
        if (!blacklist.includes(author.id)) return message.reply('That user is not blacklisted.');
        blacklist.remove(author.id);
        this.client.blacklist.set('list', blacklist);
        message.channel.send('User successfully removed from blacklist.');
        break;
      }

      case ('view'):
      case ('list'): {
        if (blacklist.length < 1) return message.channel.send('No one is blacklisted.');
        const a = blacklist;
        const fetch = Promise.all(a.map(r => this.client.fetchUser(r).then(u => `${u.tag} (${u.id})`)));
        fetch.then(r => message.channel.send(`**❯ Blacklisted:**\n${r.join('\n')}`));
        break;
      }
    }
  }
}

module.exports = Blacklist;