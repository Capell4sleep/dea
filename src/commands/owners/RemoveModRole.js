const db = require('../../database');
const patron = require('patron.js');
const util = require('../../utility');

class RemoveModRole extends patron.Command {
  constructor() {
    super({
      names: ['removemodrole', 'removemod'],
      groupName: 'owners',
      description: 'Remove a mod role.',
      args: [
        new patron.Argument({
          name: 'role',
          key: 'role',
          type: 'role',
          example: 'Moderator',
          remainder: true
        })
      ]
    });
  }

  async run(msg, args) {
    if (!msg.dbGuild.roles.mod.some((role) => role.id === args.role.id)) {
      return util.Messenger.replyError(msg.channel, msg.author, 'You may not remove a moderation role that has no been set.');
    }

    await db.guildRepo.upsertGuild(msg.guild.id, new db.updates.Pull('roles.mod', { id: args.role.id }));

    return util.Messenger.reply(msg.channel, msg.author, 'You have successfully removed the mod role ' + args.role + '.');
  }
}

module.exports = new RemoveModRole();
