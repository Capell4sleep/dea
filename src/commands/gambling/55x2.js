const patron = require('patron.js');
const gambling = require('../../services/GamblingService.js');

class FiftyFiveX2 extends patron.Command {
  constructor() {
    super({
      name: '55x2',
      group: 'gambling',
      description: 'Roll 52.50 or higher on a 100.00 sided die to win your bet.',
      args: [
        new patron.Argument({
          name: 'bet',
          key: 'bet',
          type: 'float',
          example: '500'
        })
      ]
    });
  }

  async run(msg, args) {
    return gambling.gamble(msg, args.bet, 55, 1);
  }
}

module.exports = new FiftyFiveX2();
