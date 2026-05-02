# NexusGuild.js

Beginner-friendly Node.js wrapper for the NexusGuild bot API and bot gateway.

It gives you:

- clean REST helpers for the current `/api/v1` bot API
- a gateway wrapper for `/bot-gateway`
- interaction helpers for slash commands and buttons
- portal-side helpers for bot management, commands, and webhook subscriptions

## Install

```bash
npm install nexusguild.js
```

## Requirements

- Node.js `18+`
- ESM imports
- a NexusGuild bot token for bot-runtime usage

## Quick Start

```js
import { NexusGuildClient } from 'nexusguild.js';

const client = new NexusGuildClient({
  token: process.env.NEXUSGUILD_BOT_TOKEN,
  baseUrl: process.env.NEXUSGUILD_BASE_URL
});

await client.channel('2255000000000000000').send('Hello from my bot');
```

## Core Examples

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
await client.channel(channelId).send('Hello from my bot');
```

### Send a message with buttons

```js
import { ButtonStyles } from 'nexusguild.js';

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

## Gateway

```js
const gateway = client.gateway();

gateway.onReady(({ bot }) => {
  console.log(`Connected as ${bot.name}`);
});

gateway.onCommand('ping', async (ctx) => {
  await ctx.reply('Pong!');
});

gateway.connect();
```

### Member updates

```js
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
```

### Reaction events

```js
gateway.onReactAdd((event) => {
  console.log('Reaction added:', event.message_id, event.emoji, event.user.username);
});

gateway.onReactRemove((event) => {
  console.log('Reaction removed:', event.message_id, event.emoji, event.user.username);
});
```

`REACT_ADD` and `REACT_REMOVE` include:

- `message_id`
- `channel_id`
- `guild_id`
- `emoji`
- `user`
  - `id`
  - `username`
  - `bot` when applicable

### Button interactions

```js
gateway.onButton('role_updates', async (ctx) => {
  await client
    .guild(ctx.guildId)
    .member(ctx.member.id)
    .addRole('2262212733099315200');

  await ctx.reply('Role assigned.');
});
```

### Defer, then follow up

```js
const interactionClient = client.interaction(interaction.id, interaction.token);

await interactionClient.defer();
await interactionClient.followup('Done!');
```

## Portal Client

Use the portal client for developer-side bot management flows.

```js
import { NexusGuildPortalClient } from 'nexusguild.js';

const portal = new NexusGuildPortalClient({
  baseUrl: process.env.NEXUSGUILD_BASE_URL,
  sessionCookie: process.env.NEXUSGUILD_SESSION_COOKIE
});
```

### Register a slash command

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

## API Surface

### Client

- `client.me()`
- `client.guild(guildId)`
- `client.channel(channelId)`
- `client.interaction(interactionId, interactionToken)`
- `client.gateway()`

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
- `gateway.on('MESSAGE_CREATE', handler)`
- `gateway.on('messageCreate', handler)`

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

### Interaction Context

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

## Notes

This SDK wraps the current NexusGuild HTTP API and gateway. It is designed to make common bot work easier without forcing you away from the underlying API model.
