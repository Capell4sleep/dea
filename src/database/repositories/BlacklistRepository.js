const BaseRepository = require('./BaseRepository.js');
const PushUpdate = require('../updates/PushUpdate.js');
const BlacklistQuery = require('../queries/BlacklistQuery.js');
const Blacklist = require('../models/Blacklist.js');

class BlacklistRepository extends BaseRepository {
  constructor(collection) { 
    super(collection);
  }

  anyBlacklist(userId) {
    return this.any(new BlacklistQuery(userId));
  }

  findBlacklist(userId) {
    return this.findOne(new BlacklistQuery(userId));
  }

  insertBlacklist(userId, username, avatarURL) {
    return this.insertOne(new Blacklist(userId, username, avatarURL));
  }

  addGuild(userId, newGuildId) {
    return this.updateOne(new BlacklistQuery(userId), new PushUpdate('guildIds', newGuildId));
  }
}

module.exports = BlacklistRepository;