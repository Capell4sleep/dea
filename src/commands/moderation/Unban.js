const patron = require('patron.js');
const util = require('../../utility');
const config = require('../../config.json');
const ModerationService = require('../../services/ModerationService.js');

class Unban extends patron.Command {
  constructor() {
    super({
      names: ['unban'],
      groupName: 'moderation',
      description: 'Lift the ban hammer on any member.',
      botPermissions: ['BAN_MEMBERS'],
      args: [
        new patron.Argument({
          name: 'username',
          key: 'username',
          type: 'string',
          example: '"Nig Nog Nag#8686"'
        }),
        new patron.Argument({
          name: 'reason',
          key: 'reason',
          type: 'string',
          example: 'mb he was actually a good apple',
          defaultValue: '',
          remainder: true
        })
      ]
    });
  }

  async run(msg, args) {
    const fetchedBans = await msg.guild.fetchBans();
    const lowerInput = args.username.toLowerCase();
    const matches = fetchedBans.filterValues((v) => (v.username + '#' + v.discriminator).toLowerCase().includes(lowerInput));

    if (matches.length === 1) {
      const user = matches[0];

      await msg.guild.unban(user);
      await util.Messenger.reply(msg.channel, msg.author, 'You have successfully unbanned ' + user.tag + '.');
      await ModerationService.tryModLog(msg.dbGuild, msg.guild, 'Unban', config.unbanColor, args.reason, msg.author, user);
      return ModerationService.tryInformUser(msg.guild, msg.author, 'unbanned', user, args.reason);
    } else if (matches.length > 5) {
      return util.Messenger.replyError(msg.channel, msg.author, 'Multiple matches found, please be more specific.');
    } else if (matches.length > 1) {
      return util.Messenger.replyError(msg.channel, msg.author, 'Multiple matches found: ' + util.StringUtil.formatUsers(matches) + '.');
    }

    return util.Messenger.replyError(msg.channel, msg.author, 'No matches found.');
  }
}

module.exports = new Unban();
