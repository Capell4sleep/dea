const BaseRepository = require('./BaseRepository.js');
const IncMoneyUpdate = require('../updates/IncMoneyUpdate.js');
const UserQuery = require('../queries/UserQuery.js');
const User = require('../models/User.js');
const RankService = require ('../../services/RankService.js');

class UserRepository extends BaseRepository {
  constructor(collection) { 
    super(collection);
  }

  anyUser(userId, guildId) {
    return this.any(new UserQuery(userId, guildId));
  }

  async getUser(userId, guildId) {
    const fetchedUser = await this.findOne(new UserQuery(userId, guildId));

    return fetchedUser !== null ? fetchedUser : this.insertOne(new User(userId, guildId));
  }

  updateUser(userId, guildId, update) {
    return this.updateOne(new UserQuery(userId, guildId), update);
  }

  findUserAndUpdate(userId, guildId, update) {
    return this.findOneAndUpdate(new UserQuery(userId, guildId), update);
  }

  async upsertUser(userId, guildId, update) {
    if (await this.anyUser(userId, guildId)) {
      return this.updateUser(userId, guildId, update);
    } else {
      return this.updateOne(new User(userId, guildId), update, true);
    }
  }

  async findUserAndUpsert(userId, guildId, update) {
    if (await this.anyUser(userId, guildId)) {
      return this.findUserAndUpdate(userId, guildId, update);
    } else {
      return this.findOneAndUpdate(new User(userId, guildId), update, true);
    }
  }

  async modifyCash(dbGuild, member, change) {
    const newDbUser = await this.findUserAndUpsert(member.id, dbGuild.guildId, new IncMoneyUpdate('cash', change));

    RankService.handle(newDbUser, dbGuild, member);

    return newDbUser;
  }

  deleteUser(userId, guildId) {
    return this.deleteOne(new UserQuery(userId, guildId));
  }

  deleteUsers(guildId) {
    return this.deleteMany({ guildId: guildId });
  }
}

module.exports = UserRepository;
