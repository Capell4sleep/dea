const db = require('../database');
const Constants = require('../utility/Constants.js');

module.exports = async (client) => {
  client.setInterval(async () => {
    const users = await db.userRepo.findMany();

    for (let i = 0; i < users.length; i++) {
      if (users[i].sponsorExpiresAt !== null && users[i].sponsorExpiresAt - Date.now() < 0) {
        await db.userRepo.updateById(users[i]._id, { $set: { sponsorExpiresAt: null } });

        const user = client.users.get(users[i].userId);

        if (user === undefined) {
          continue;
        }

        const guild = client.guilds.get(users[i].guildId);

        if (guild === undefined) {
          continue;
        }

        const member = guild.members.get(users[i].userId);

        if (member === undefined) {
          continue;
        }

        const dbGuild = await db.guildRepo.getGuild(guild.id);
        const role = guild.roles.get(dbGuild.roles.sponsor);

        if (role === undefined) {
          continue;
        }

        if (guild.me.hasPermission('MANAGE_ROLES') === false || role.position >= guild.me.highestRole.position) {
          continue;
        }

        await member.removeRole(role);
      }
    }
  }, Constants.config.intervals.removeSponsor);
};
