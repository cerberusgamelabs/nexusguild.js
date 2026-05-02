# NexusGuild.js

Node.js wrapper for the NexusGuild bot API with a modular, beginner-friendly interface.

## Goals

- Make common bot tasks easy to discover
- Hide raw REST paths behind clear method names
- Keep the SDK modular so advanced users can still work close to the API

## Install

This repo is currently local scaffolding. Once published, the intended usage is:

```bash
npm install nexusguild.js
```

## Publishing Notes

This package is being structured for npm publication.

Current publishing assumptions:

- npm package name: `nexusguild.js`
- branding: `NexusGuild.js`
- license: `MIT`
- JavaScript-first release with no TypeScript requirement

Still undecided:

- final GitHub repository URL

Recommended first publish flow:

```bash
npm login
npm publish --access public
```

## Quick Start

```js
import { NexusGuildClient } from 'nexusguild.js';

const client = new NexusGuildClient({
  token: process.env.NEXUSGUILD_BOT_TOKEN,
  baseUrl: process.env.NEXUSGUILD_BASE_URL
});
```

The package also exports named constants so beginners do not need to memorize magic numbers.

If you also want to manage bots, slash commands, or webhook subscriptions from the developer side, use the portal client:

```js
import { NexusGuildPortalClient } from 'nexusguild.js';

const portal = new NexusGuildPortalClient({
  baseUrl: process.env.NEXUSGUILD_BASE_URL,
  sessionCookie: process.env.NEXUSGUILD_SESSION_COOKIE
});
```

## Beginner Examples

### Give a member a role

```js
await client
  .guild('2254403363506491392')
  .member('1234567890123456789')
  .addRole('2262212733099315200');
```

### Remove a role

```js
await client
  .guild('2254403363506491392')
  .member('1234567890123456789')
  .removeRole('2262212733099315200');
```

### Send a message

```js
await client
  .channel('2255000000000000000')
  .send('Hello from my bot');
```

### Send a message with buttons

```js
await client.channel(channelId).messages.create({
  content: 'Choose a role',
  components: [
    {
      type: 1,
      components: [
        {
          type: 2,
          style: ButtonStyles.PRIMARY,
          label: 'Get Updates',
          custom_id: 'role_updates'
        }
      ]
    }
  ]
});
```

With imports:

```js
import { ButtonStyles } from 'nexusguild.js';
```

### Add a reaction as the bot

```js
await client
  .channel(channelId)
  .messages
  .get(messageId)
  .reactions
  .addMe('👍');
```

### Reply to an interaction

```js
await client
  .interaction(interaction.id, interaction.token)
  .reply('Pong!');
```

### Use the gateway like a beginner-friendly bot client

```js
const gateway = client.gateway();

gateway.onReady(({ bot }) => {
  console.log(`Connected as ${bot.name}`);
});

gateway.onMemberJoin(async (member) => {
  if (member.guild_id === '2254403363506491392') {
    await client
      .guild(member.guild_id)
      .member(member.user.id)
      .addRole('2262212733099315200');
  }
});

gateway.connect();
```

### Handle member role and nickname updates

```js
const gateway = client.gateway();

gateway.onMemberUpdate((member) => {
  if (member.added_roles?.length) {
    console.log('Roles added:', member.added_roles);
  }

  if (member.removed_roles?.length) {
    console.log('Roles removed:', member.removed_roles);
  }

  if (member.nick_change) {
    console.log(`Nickname changed from ${member.nick_change.old} to ${member.nick_change.new}`);
  }
});

gateway.connect();
```

### Handle a slash command without parsing raw interaction payloads

```js
const gateway = client.gateway();

gateway.onCommand('ping', async (ctx) => {
  await ctx.reply('Pong!');
});

gateway.connect();
```

### Handle a button click with a clean helper

```js
const gateway = client.gateway();

gateway.onButton('role_updates', async (ctx) => {
  await client
    .guild(ctx.guildId)
    .member(ctx.member.id)
    .addRole('2262212733099315200');

  await ctx.reply('Role assigned.');
});

gateway.connect();
```

### Defer, then follow up

```js
const interactionClient = client.interaction(interaction.id, interaction.token);

await interactionClient.defer();
await interactionClient.followup('Done!');
```

### Register a slash command from the portal side

```js
await portal
  .bot(botId)
  .commands(serverId)
  .upsert({
    name: 'ping',
    description: 'Replies with pong',
    options: []
  });
```

### Create a webhook subscription for an offline bot

```js
const { subscription } = await portal
  .bot(botId)
  .subscriptions()
  .upsert({
    webhook_url: 'https://mybot.example.com/nexus-events',
    events: ['MESSAGE_CREATE', 'MESSAGE_UPDATE', 'REACT_ADD', 'REACT_REMOVE']
  });
```

### Verify webhook payload signatures

```js
import { verifyWebhookSignature } from 'nexusguild.js';

const isValid = verifyWebhookSignature(rawBody, signatureHeader, signingKey);
```

## Current API Surface

### Client

- `client.me()`
- `client.guild(guildId)`
- `client.channel(channelId)`
- `client.interaction(interactionId, interactionToken)`
- `client.gateway()`

### Portal Client

- `portal.eligibleServers()`
- `portal.bots().create(data)`
- `portal.bots().list()`
- `portal.bot(botId).fetch()`
- `portal.bot(botId).update(data)`
- `portal.bot(botId).delete()`
- `portal.bot(botId).token()`
- `portal.bot(botId).regenerateToken()`
- `portal.bot(botId).servers().list()`
- `portal.bot(botId).servers(serverId).add(data)`
- `portal.bot(botId).servers(serverId).remove()`
- `portal.bot(botId).commands(serverId).list()`
- `portal.bot(botId).commands(serverId).upsert(data)`
- `portal.bot(botId).commands(serverId).delete(commandId)`
- `portal.bot(botId).subscriptions().fetch()`
- `portal.bot(botId).subscriptions().upsert(data)`
- `portal.bot(botId).subscriptions().delete()`
- `portal.webhooks(serverId).list()`
- `portal.webhooks(serverId).create(data)`
- `portal.webhook(webhookId).update(data)`
- `portal.webhook(webhookId).delete()`

### Public Client

- `publicClient.bot(botId)`
- `publicClient.executeWebhook(webhookId, token, data)`

### Guilds

- `client.guild(id).fetch()`
- `client.guild(id).channels.list()`
- `client.guild(id).members.list()`
- `client.guild(id).members.get(userId)`
- `client.guild(id).member(userId)`
- `client.guild(id).roles.list()`
- `client.guild(id).roles.create(data)`
- `client.guild(id).roles.get(roleId).edit(data)`
- `client.guild(id).roles.get(roleId).delete()`

### Members

- `member.fetch()`
- `member.addRole(roleId)`
- `member.removeRole(roleId)`
- `member.roles.add(roleId)`
- `member.roles.remove(roleId)`

### Gateway

- `gateway.connect()`
- `gateway.disconnect()`
- `gateway.heartbeat()`
- `gateway.onReady(handler)`
- `gateway.onInteraction(handler)`
- `gateway.onCommand(name, handler)`
- `gateway.onButton(customId, handler)`
- `gateway.onMemberJoin(handler)`
- `gateway.onMemberLeave(handler)`
- `gateway.onMemberUpdate(handler)`
- `gateway.onMessageCreate(handler)`
- `gateway.onReactAdd(handler)`
- `gateway.onReactRemove(handler)`
- `gateway.onGuildCreate(handler)`
- `gateway.on('GUILD_MEMBER_UPDATE', handler)`
- `gateway.on('guildMemberUpdate', handler)`

### Channels

- `client.channel(id).fetch()`
- `client.channel(id).send(content, options)`
- `client.channel(id).messages.list()`
- `client.channel(id).messages.create(data)`
- `client.channel(id).messages.get(messageId).edit(content)`
- `client.channel(id).messages.get(messageId).delete()`
- `client.channel(id).messages.bulkDelete(messageIds)`
- `client.channel(id).messages.get(messageId).reactions.addMe(emoji)`
- `client.channel(id).messages.get(messageId).reactions.removeMe(emoji)`
- `client.channel(id).pins.list()`
- `client.channel(id).pins.add(messageId)`
- `client.channel(id).pins.remove(messageId)`

### Gateway

- `const gateway = client.gateway()`
- `gateway.connect()`
- `gateway.disconnect()`
- `gateway.heartbeat()`
- `gateway.onReady(handler)`
- `gateway.onInteraction(handler)`
- `gateway.onCommand(name, handler)`
- `gateway.onButton(customId, handler)`
- `gateway.onMemberJoin(handler)`
- `gateway.onMemberLeave(handler)`
- `gateway.onMessageCreate(handler)`
- `gateway.onReactAdd(handler)`
- `gateway.onReactRemove(handler)`
- `gateway.onGuildCreate(handler)`
- `gateway.on('MESSAGE_CREATE', handler)`
- `gateway.on('messageCreate', handler)`

### Interaction Context

Gateway interaction helpers receive an `InteractionContext` instead of the raw payload.

- `ctx.isCommand(name?)`
- `ctx.isButton(customId?)`
- `ctx.commandName`
- `ctx.customId`
- `ctx.options`
- `ctx.option(name, fallback)`
- `ctx.reply(content, options)`
- `ctx.defer(options)`
- `ctx.followup(content, options)`

### Utilities

- `verifyWebhookSignature(rawBody, signature, signingKey)`
- `signWebhookBody(rawBody, signingKey)`

### Constants

- `ButtonStyles`
- `ChannelTypes`
- `CommandOptionTypes`
- `InteractionCallbackTypes`
- `MessageFlags`
- `GatewayEvents`
- `WebhookEvents`

## Design Notes

This SDK is a wrapper over the existing HTTP API. It does not require a new API version to become useful.

That means:

- Better ergonomics can ship now
- The underlying REST API stays stable
- Future `v2` work can remain focused on protocol changes instead of syntax sugar

## Coverage Status

Current package coverage now includes:

- bot-token REST API under `/api/v1`
- interaction callback and followup helpers
- gateway connection and event helpers
- portal/session-auth bot management helpers
- slash command management helpers
- offline bot webhook subscription helpers
- webhook execution and signature verification helpers

Remaining work is mostly polish and release-readiness rather than missing endpoint coverage.
