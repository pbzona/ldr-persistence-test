# LDR Persistent Store Testing

This project is a simple setup for testing the LaunchDarkly Relay Proxy with a persistent data store, specifically scenarios dealing with network errors.

It can also be used to simulate connectivity issues between Relay and LaunchDarkly.

## Overview

The Docker compose file includes 5 containers: a Relay Proxy, a Redis instance, and three proxies that can be used to simulate issues at different layers of the network.

There is also a simple NodeJS script that acts as an SDK client. It logs flag details to the console upon initialization as well as on every update.

## Setup

### Prerequisites

1. Copy the `.env.example` file to a new file called `.env`
2. Add your (server side) SDK key to the `LD_SDK_KEY` field in your new `.env` file
3. Configure the `sdkKey` property in the `relay-data/ld-relay.conf` file
4. Optionally, make any other changes you want to the Relay configuration

### Relay-Redis Network

1. Start all containers with `docker compose up`. Be sure to run this from the root of this project directory structure - running it from a different location will cause things not to work

### Node Client

1. Install dependencies with `npm install`
2. Connect to the Relay Proxy by running `node client.js http://localhost:8030`. In this command, the URL argument is used by the SDK to configure its streaming and base URIs.

## Simulating Network Errors

### Client connectivity

Instead of connecting directly to the Relay Proxy, you can simulate a client connectivity issue by connecting to the proxy between the client and Relay:

```
node client.js http://localhost:8031
```

To cut off the connection, stop the running container for the `proxy-to-ldrelay` service. You can find this by running `docker container ls` and finding the container with `proxy-to-ldrelay` in its name. Stop it with `docker stop <container name>`.

### Relay Proxy/Redis connectivity

To simulate a failed connection between Relay Proxy and Redis, the process is almost identical. The only difference is the container to stop will be the one corresponding to the `proxy-to-redis` service.

Stopping this container will prevent Relay Proxy from connecting to the Redis instance as long as it is down. You can also start it back up to restore the connection.

### Relay Proxy/LD connectivity

The Relay Proxy, by default, will connect to LaunchDarkly via a proxy container called `proxy-to-launchdarkly`. You can simulate broken connections in much the same way as the previous sections - stop that container.

This operation can be illustrative of a few scenarios:

1. LaunchDarkly is down
2. The user's network is unable to connect to LaunchDarkly for some other reason
3. Transient network errors that can potentially have cascading effects, depending on what else happens at the same time