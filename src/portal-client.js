import { PortalRestClient } from './portal-rest.js';

class PortalCommandManager {
    constructor(client, botId, serverId, commandId = null) {
        this.client = client;
        this.botId = botId;
        this.serverId = serverId;
        this.commandId = commandId;
    }

    list() {
        return this.client.request(
            'GET',
            `/api/bots/${this.botId}/servers/${this.serverId}/commands`
        );
    }

    upsert(data) {
        return this.client.request(
            'PUT',
            `/api/bots/${this.botId}/servers/${this.serverId}/commands`,
            data
        );
    }

    delete(commandId = this.commandId) {
        return this.client.request(
            'DELETE',
            `/api/bots/${this.botId}/servers/${this.serverId}/commands/${commandId}`
        );
    }
}

class PortalSubscriptionManager {
    constructor(client, botId) {
        this.client = client;
        this.botId = botId;
    }

    fetch() {
        return this.client.request('GET', `/api/bots/${this.botId}/subscriptions`);
    }

    upsert(data) {
        return this.client.request('PUT', `/api/bots/${this.botId}/subscriptions`, data);
    }

    delete() {
        return this.client.request('DELETE', `/api/bots/${this.botId}/subscriptions`);
    }
}

class PortalBotServerManager {
    constructor(client, botId, serverId = null) {
        this.client = client;
        this.botId = botId;
        this.serverId = serverId;
    }

    list() {
        return this.client.request('GET', `/api/bots/${this.botId}/servers`);
    }

    add(serverId = this.serverId, data = {}) {
        return this.client.request(
            'PUT',
            `/api/bots/${this.botId}/servers/${serverId}`,
            data
        );
    }

    remove(serverId = this.serverId) {
        return this.client.request(
            'DELETE',
            `/api/bots/${this.botId}/servers/${serverId}`
        );
    }
}

class PortalBotManager {
    constructor(client, botId = null) {
        this.client = client;
        this.botId = botId;
    }

    create(data) {
        return this.client.request('POST', '/api/bots', data);
    }

    list() {
        return this.client.request('GET', '/api/bots');
    }

    fetch(botId = this.botId) {
        return this.client.request('GET', `/api/bots/${botId}`);
    }

    update(data, botId = this.botId) {
        return this.client.request('PATCH', `/api/bots/${botId}`, data);
    }

    delete(botId = this.botId) {
        return this.client.request('DELETE', `/api/bots/${botId}`);
    }

    token(botId = this.botId) {
        return this.client.request('GET', `/api/bots/${botId}/token`);
    }

    regenerateToken(botId = this.botId) {
        return this.client.request('POST', `/api/bots/${botId}/token/regenerate`);
    }

    servers(serverId = null) {
        return new PortalBotServerManager(this.client, this.botId, serverId);
    }

    commands(serverId) {
        return new PortalCommandManager(this.client, this.botId, serverId);
    }

    subscriptions() {
        return new PortalSubscriptionManager(this.client, this.botId);
    }
}

class PortalWebhookManager {
    constructor(client, webhookId = null, serverId = null) {
        this.client = client;
        this.webhookId = webhookId;
        this.serverId = serverId;
    }

    list(serverId = this.serverId) {
        return this.client.request('GET', `/api/webhooks/servers/${serverId}`);
    }

    create(serverId = this.serverId, data) {
        return this.client.request('POST', `/api/webhooks/servers/${serverId}`, data);
    }

    update(data, webhookId = this.webhookId) {
        return this.client.request('PATCH', `/api/webhooks/${webhookId}`, data);
    }

    delete(webhookId = this.webhookId) {
        return this.client.request('DELETE', `/api/webhooks/${webhookId}`);
    }
}

export class NexusGuildPortalClient {
    constructor(options) {
        this.rest = new PortalRestClient(options);
    }

    request(method, path, body) {
        return this.rest.request(method, path, body);
    }

    bots(botId = null) {
        return new PortalBotManager(this, botId);
    }

    bot(botId) {
        return new PortalBotManager(this, botId);
    }

    eligibleServers() {
        return this.request('GET', '/api/bots/eligible-servers');
    }

    webhooks(serverId = null, webhookId = null) {
        return new PortalWebhookManager(this, webhookId, serverId);
    }

    webhook(webhookId) {
        return new PortalWebhookManager(this, webhookId);
    }
}
