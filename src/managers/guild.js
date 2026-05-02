import { ChannelManager } from './channel.js';

class GuildRoleManager {
    constructor(client, guildId, roleId) {
        this.client = client;
        this.guildId = guildId;
        this.roleId = roleId;
    }

    edit(data) {
        return this.client.request(
            'PATCH',
            `/api/v1/guilds/${this.guildId}/roles/${this.roleId}`,
            data
        );
    }

    delete() {
        return this.client.request(
            'DELETE',
            `/api/v1/guilds/${this.guildId}/roles/${this.roleId}`
        );
    }
}

class GuildRoleCollection {
    constructor(client, guildId) {
        this.client = client;
        this.guildId = guildId;
    }

    list() {
        return this.client.request('GET', `/api/v1/guilds/${this.guildId}/roles`);
    }

    create(data) {
        return this.client.request('POST', `/api/v1/guilds/${this.guildId}/roles`, data);
    }

    get(roleId) {
        return new GuildRoleManager(this.client, this.guildId, roleId);
    }
}

class GuildMemberRoleManager {
    constructor(client, guildId, userId) {
        this.client = client;
        this.guildId = guildId;
        this.userId = userId;
    }

    add(roleId) {
        return this.client.request(
            'PUT',
            `/api/v1/guilds/${this.guildId}/members/${this.userId}/roles/${roleId}`
        );
    }

    remove(roleId) {
        return this.client.request(
            'DELETE',
            `/api/v1/guilds/${this.guildId}/members/${this.userId}/roles/${roleId}`
        );
    }
}

class GuildMemberManager {
    constructor(client, guildId, userId) {
        this.client = client;
        this.guildId = guildId;
        this.userId = userId;
        this.roles = new GuildMemberRoleManager(client, guildId, userId);
    }

    fetch() {
        return this.client.request('GET', `/api/v1/guilds/${this.guildId}/members/${this.userId}`);
    }

    addRole(roleId) {
        return this.roles.add(roleId);
    }

    removeRole(roleId) {
        return this.roles.remove(roleId);
    }
}

class GuildMemberCollection {
    constructor(client, guildId) {
        this.client = client;
        this.guildId = guildId;
    }

    list({ limit, after } = {}) {
        const params = new URLSearchParams();
        if (limit !== undefined) params.set('limit', String(limit));
        if (after !== undefined) params.set('after', String(after));
        const query = params.toString();
        const suffix = query ? `?${query}` : '';
        return this.client.request('GET', `/api/v1/guilds/${this.guildId}/members${suffix}`);
    }

    get(userId) {
        return new GuildMemberManager(this.client, this.guildId, userId);
    }
}

class GuildChannelCollection {
    constructor(client, guildId) {
        this.client = client;
        this.guildId = guildId;
    }

    list() {
        return this.client.request('GET', `/api/v1/guilds/${this.guildId}/channels`);
    }

    get(channelId) {
        return new ChannelManager(this.client, channelId);
    }
}

export class GuildManager {
    constructor(client, guildId) {
        this.client = client;
        this.guildId = guildId;
        this.members = new GuildMemberCollection(client, guildId);
        this.roles = new GuildRoleCollection(client, guildId);
        this.channels = new GuildChannelCollection(client, guildId);
    }

    fetch() {
        return this.client.request('GET', `/api/v1/guilds/${this.guildId}`);
    }

    member(userId) {
        return this.members.get(userId);
    }
}
