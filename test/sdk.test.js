import test from 'node:test';
import assert from 'node:assert/strict';

import {
    ButtonStyles,
    CommandOptionTypes,
    GatewayEvents,
    MessageFlags,
    NexusGuildClient,
    NexusGuildGateway,
    NexusGuildPortalClient,
    NexusGuildPublicClient,
    NexusGuildApiError,
    signWebhookBody,
    verifyWebhookSignature
} from '../src/index.js';

function createJsonResponse(status, data) {
    return {
        ok: status >= 200 && status < 300,
        status,
        async text() {
            return JSON.stringify(data);
        }
    };
}

function createEmptyResponse(status = 204) {
    return {
        ok: status >= 200 && status < 300,
        status,
        async text() {
            return '';
        }
    };
}

test('bot REST client sends correct role assignment request', async () => {
    const calls = [];
    const client = new NexusGuildClient({
        token: 'bot-token',
        baseUrl: 'https://example.test',
        fetchImpl: async (url, options) => {
            calls.push({ url, options });
            return createEmptyResponse(204);
        }
    });

    const result = await client.guild('guild1').member('user1').addRole('role1');

    assert.equal(result, null);
    assert.equal(calls.length, 1);
    assert.equal(calls[0].url, 'https://example.test/api/v1/guilds/guild1/members/user1/roles/role1');
    assert.equal(calls[0].options.method, 'PUT');
    assert.equal(calls[0].options.headers.Authorization, 'Bot bot-token');
});

test('bot REST client sends message create request with components', async () => {
    const calls = [];
    const client = new NexusGuildClient({
        token: 'bot-token',
        baseUrl: 'https://example.test',
        fetchImpl: async (url, options) => {
            calls.push({ url, options });
            return createJsonResponse(200, { id: 'message1' });
        }
    });

    const data = await client.channel('channel1').messages.create({
        content: 'hello',
        components: [{ type: 1, components: [] }]
    });

    assert.equal(data.id, 'message1');
    assert.equal(calls[0].url, 'https://example.test/api/v1/channels/channel1/messages');
    assert.deepEqual(JSON.parse(calls[0].options.body), {
        content: 'hello',
        components: [{ type: 1, components: [] }]
    });
});

test('portal client wraps bot command registration route', async () => {
    const calls = [];
    const portal = new NexusGuildPortalClient({
        baseUrl: 'https://example.test',
        sessionCookie: 'ng_sess=abc123',
        fetchImpl: async (url, options) => {
            calls.push({ url, options });
            return createJsonResponse(200, { command: { id: 'cmd1', name: 'ping' } });
        }
    });

    const response = await portal.bot('bot1').commands('guild1').upsert({
        name: 'ping',
        description: 'Replies with pong',
        options: []
    });

    assert.equal(response.command.name, 'ping');
    assert.equal(calls[0].url, 'https://example.test/api/bots/bot1/servers/guild1/commands');
    assert.equal(calls[0].options.headers.Cookie, 'ng_sess=abc123');
    assert.equal(calls[0].options.method, 'PUT');
});

test('public client wraps webhook execution route', async () => {
    const calls = [];
    const publicClient = new NexusGuildPublicClient({
        baseUrl: 'https://example.test',
        fetchImpl: async (url, options) => {
            calls.push({ url, options });
            return createEmptyResponse(204);
        }
    });

    const response = await publicClient.executeWebhook('webhook1', 'token1', {
        content: 'hello'
    });

    assert.equal(response, null);
    assert.equal(calls[0].url, 'https://example.test/api/webhooks/webhook1/token1');
    assert.equal(calls[0].options.method, 'POST');
});

test('gateway emits friendly interaction context for commands and buttons', async () => {
    const socketHandlers = new Map();
    let lastConnectionUrl = null;
    let emittedHeartbeat = null;

    const fakeSocket = {
        on(event, handler) {
            socketHandlers.set(event, handler);
        },
        emit(event) {
            emittedHeartbeat = event;
        },
        disconnect() {}
    };

    const gateway = new NexusGuildGateway({
        token: 'bot-token',
        baseUrl: 'https://example.test',
        socketFactory: (url) => {
            lastConnectionUrl = url;
            return fakeSocket;
        }
    });

    const client = new NexusGuildClient({
        token: 'bot-token',
        baseUrl: 'https://example.test',
        fetchImpl: async () => createJsonResponse(200, { success: true })
    });
    gateway.client = client;

    let readyBotName = null;
    let commandName = null;
    let buttonId = null;
    let memberUpdate = null;
    let reactAdd = null;
    let reactRemove = null;

    gateway.onReady(({ bot }) => {
        readyBotName = bot.name;
    });
    gateway.onCommand('ping', async (ctx) => {
        commandName = ctx.commandName;
    });
    gateway.onButton('role_updates', async (ctx) => {
        buttonId = ctx.customId;
    });
    gateway.onMemberUpdate((payload) => {
        memberUpdate = payload;
    });
    gateway.onReactAdd((payload) => {
        reactAdd = payload;
    });
    gateway.onReactRemove((payload) => {
        reactRemove = payload;
    });

    gateway.connect();

    assert.equal(lastConnectionUrl, 'https://example.test/bot-gateway');

    socketHandlers.get('READY')({ bot: { id: 'bot1', name: 'TestBot' }, v: 1 });
    assert.equal(readyBotName, 'TestBot');

    await socketHandlers.get('INTERACTION_CREATE')({
        id: 'int1',
        token: 'tok1',
        type: 1,
        guild_id: 'guild1',
        channel_id: 'channel1',
        member: { id: 'user1' },
        data: { name: 'ping', options: [] }
    });

    await socketHandlers.get('INTERACTION_CREATE')({
        id: 'int2',
        token: 'tok2',
        type: 3,
        guild_id: 'guild1',
        channel_id: 'channel1',
        member: { id: 'user1' },
        data: { custom_id: 'role_updates', component_type: 2 }
    });

    socketHandlers.get('GUILD_MEMBER_UPDATE')({
        guild_id: 'guild1',
        user: { id: 'user1', username: 'Alice' },
        nick: 'AliceTheGreat',
        nick_change: { old: 'Ali', new: 'AliceTheGreat' },
        roles: ['role1'],
        added_roles: ['role1'],
        removed_roles: [],
        joined_at: '2026-01-01T00:00:00.000Z'
    });

    socketHandlers.get('REACT_ADD')({
        message_id: 'msg1',
        channel_id: 'channel1',
        guild_id: 'guild1',
        emoji: '🔥',
        user: { id: 'user1', username: 'Alice' }
    });

    socketHandlers.get('REACT_REMOVE')({
        message_id: 'msg1',
        channel_id: 'channel1',
        guild_id: 'guild1',
        emoji: '🔥',
        user: { id: 'user1', username: 'Alice' }
    });

    gateway.heartbeat();

    assert.equal(commandName, 'ping');
    assert.equal(buttonId, 'role_updates');
    assert.equal(emittedHeartbeat, 'HEARTBEAT');
    assert.deepEqual(memberUpdate.nick_change, { old: 'Ali', new: 'AliceTheGreat' });
    assert.deepEqual(memberUpdate.added_roles, ['role1']);
    assert.equal(reactAdd?.emoji, '🔥');
    assert.equal(reactAdd?.user?.id, 'user1');
    assert.equal(reactRemove?.message_id, 'msg1');
});

test('webhook signing helpers verify signatures', () => {
    const rawBody = JSON.stringify({ event: GatewayEvents.MESSAGE_CREATE, data: { id: '1' } });
    const signingKey = 'secret-key';
    const signature = signWebhookBody(rawBody, signingKey);

    assert.equal(verifyWebhookSignature(rawBody, signature, signingKey), true);
    assert.equal(verifyWebhookSignature(rawBody, 'bad-signature', signingKey), false);
});

test('constants expose stable beginner-friendly values', () => {
    assert.equal(ButtonStyles.PRIMARY, 1);
    assert.equal(CommandOptionTypes.ROLE, 8);
    assert.equal(MessageFlags.EPHEMERAL, 64);
    assert.equal(GatewayEvents.INTERACTION_CREATE, 'INTERACTION_CREATE');
});

test('API errors preserve response details', async () => {
    const client = new NexusGuildClient({
        token: 'bot-token',
        baseUrl: 'https://example.test',
        fetchImpl: async () => createJsonResponse(403, { message: 'Missing Permissions' })
    });

    await assert.rejects(
        () => client.guild('guild1').roles.create({ name: 'Role' }),
        (error) => {
            assert.ok(error instanceof NexusGuildApiError);
            assert.equal(error.status, 403);
            assert.equal(error.message, 'Missing Permissions');
            return true;
        }
    );
});
