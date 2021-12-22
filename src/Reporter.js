const chalk = require('chalk');
const Table = require('cli-table');
// What to show:
//   Initial state
//   Updates: 
//   - only updates
//   - every n seconds
//   Timeline view
//   - only updates
//   - every n seconds
// Print modes
// - raw (JSON.stringify)
// - pretty (formatted as report)

class Reporter {
  constructor(client, user, options) {
    this._client = client;
    this._user = user;
    this._options = options;

    this._initialState = {};
    this._prevState = {};
    this._currentState = {}
    this._defaultValue = chalk.bold.red('<DEFAULT>');
  }

  async getAllFlagsState(isInitialRequest) {
    const allFlags = await this._client.allFlagsState(this._user, { withReasons: true });
    const flags = allFlags.allValues();

    this._initialState = isInitialRequest ? flags : this._initialState;
    this._prevState = this._currentState;
    this._currentState = flags;

    return this._currentState;
  }
  
  async printAllFlagsState(flagState) {
    const keys = Object.keys(flagState);
    if (keys.length < 1) {
      console.error('No flags found for this environment');
      return;
    }

    console.log(await this._getFlagReport(flagState, 'pretty'));
  }

  async printFullReport() {
    const heading = chalk.bold.white;
    console.clear();

    console.log(heading('\nINITIAL FLAG STATE'));
    this._divider();
    console.log(await this._getFlagReport(this._initialState));
    this._addSpace();

    console.log(heading('PREVIOUS FLAG STATE'));
    this._divider();
    console.log(await this._getFlagReport(this._prevState));
    this._addSpace();

    console.log(heading('CURRENT FLAG STATE'));
    this._divider();
    console.log(await this._getFlagReport(this._currentState));
    this._addSpace();
  }

  async updateReport() {
    await this.getAllFlagsState();
    this.printFullReport();
  }

  async _getFlagReport(state, mode) {
    const modeNormalized = mode ? mode.toLowerCase() : '';
    switch (modeNormalized) {
      case 'raw':
        return this._makeRawReport(state);
      case 'pretty':
        return this._makeTable(state);
      default:
        return this._makeTable(state);
    }
  }

  async _makeRawReport(flagData) {
    let rawReport = []
    const keys = Object.keys(flagData);
    
    for (let key of keys) {
      let variation = await this._client.variationDetail(key, this._user, this._defaultValue);
      rawReport.push(key.toUpperCase() + '\n' + JSON.stringify(variation));
    }
    return rawReport.join('\n');
  }

  async _makeTable(flagData) {
    const keys = Object.keys(flagData);
    
    let table = new Table({
      head: [chalk.bold('Flag Key'), chalk.bold('Value')],
      style: { 'padding-left': 8, 'padding-right': 8 }
    });

    for (let key of keys) {
      table.push([ key, flagData[key] ]);
    }

    return table.toString();
  }

  _divider() {
    console.log('=======================');
  }

  _addSpace() {
    console.log('\n');
  }
}



module.exports = Reporter;