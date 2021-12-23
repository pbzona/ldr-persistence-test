require('dotenv').config();
const Reporter = require('./src/Reporter');
const relayHost = process.argv[2];

// Client setup
const LaunchDarkly = require('launchdarkly-node-server-sdk');

const config = {
  baseUri: relayHost,
  streamUri: relayHost,
  logger: LaunchDarkly.basicLogger({ level: 'none' }),
}

const client = LaunchDarkly.init(process.env.LD_SDK_KEY, config);

// User setup
const ldUser = {
  key: 'anon',
  anonymous: true
}

// Set up new Reporter
const reporter = new Reporter(client, ldUser, relayHost);

// Listen for flag changes
const main = async () => {
  try {
    await client.waitForInitialization();
    await reporter.getAllFlagsState(true);
    reporter.printFullReport();

    // Print any updates
    client.on('update', () => {
      reporter.updateReport();
    });

  } catch (err) {
    console.error(err);
  }
}

main();