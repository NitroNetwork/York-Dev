const Moderation = require('../../base/Moderation.js');

class Kick extends Moderation {
  constructor(client) {
    super(client, {
      name: 'kick',
      description: 'Kicks a nominated user.',
      usage: 'kick <@mention|userid> [reason]',
      extended: 'This kicks the nominated user, with or without a reason.',
      aliases: ['toss', 'boot', 'throw'],
      botPerms: ['KICK_MEMBERS', 'EMBED_LINKS']
    });
  }

  async run(message, args, level) { // eslint-disable-line no-unused-vars
    const settings = this.client.getSettings(message.guild.id);      
    const channel  = message.guild.channels.exists('name', settings.modLogChannel);
    if (!channel)    throw `${message.author}, I cannot find the \`${settings.modLogChannel}\` channel.`;
    const target   = await this.verifyUser(args[0]);
    if (!target)     throw `${message.author} |\`❌\`| Invalid command usage, You must mention someone to use this command.`;
    const modLevel = this.modCheck(message, args[0], level);
    if (typeof modLevel === 'string') return message.reply(modLevel);
    const reason   = args.splice(1, args.length).join(' ');
    try {
      await message.guild.member(target).kick({reason: reason.length < 1 ? 'No reason supplied.': reason});
      await this.buildModLog(this.client, message.guild, 'ki', target, message.author, reason);
      await message.channel.send(`\`${target.tag}\` was successfully kicked.`);
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Kick;