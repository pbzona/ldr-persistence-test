require('dotenv').config();
const relayHost = process.argv[2];

// Client setup
const LaunchDarkly = require('launchdarkly-node-server-sdk');

const config = {
  baseUri: relayHost,
  streamUri: relayHost
}

const client = LaunchDarkly.init(process.env.LD_SDK_KEY, config);

// User setup
const ldUser = {
  key: 'anon',
  anonymous: true
}

const printFlags = async () => {
  let allFlags = await client.allFlagsState(ldUser, { withReasons: true });

  printDetails(allFlags.allValues());
}

const printDetails = async (flagObj) => {
  const keys = Object.keys(flagObj);

  for (key of keys) {
    let variation = await client.variationDetail(key, ldUser, false);
    console.log(key.toUpperCase() + '\n' + JSON.stringify(variation));
  }
}

// Listen for flag changes
const main = async () => {
  try {
    await client.waitForInitialization();
    printFlags();

    // Print any updates
    client.on('update', () => {
      console.log('===================');
      printFlags();
    });

  } catch (err) {
    console.error(err);
  }
}

main();