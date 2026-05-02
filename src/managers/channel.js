class ChannelMessageReactionManager {
    constructor(client, channelId, messageId) {
        this.client = client;
        this.channelId = channelId;
        this.messageId = messageId;
    }

    addMe(emoji) {
        const encodedEmoji = encodeURIComponent(emoji);
        return this.client.request(
            'PUT',
            `/api/v1/channels/${this.channelId}/messages/${this.messageId}/reactions/${encodedEmoji}/@me`
        );
    }

    removeMe(emoji) {
        const encodedEmoji = encodeURIComponent(emoji);
        return this.client.request(
            'DELETE',
            `/api/v1/channels/${this.channelId}/messages/${this.messageId}/reactions/${encodedEmoji}/@me`
        );
    }
}

class ChannelMessageManager {
    constructor(client, channelId, messageId) {
        this.client = client;
        this.channelId = channelId;
        this.messageId = messageId;
        this.reactions = new ChannelMessageReactionManager(client, channelId, messageId);
    }

    edit(content) {
        return this.client.request(
            'PATCH',
            `/api/v1/channels/${this.channelId}/messages/${this.messageId}`,
            { content }
        );
    }

    delete() {
        return this.client.request(
            'DELETE',
            `/api/v1/channels/${this.channelId}/messages/${this.messageId}`
        );
    }
}

class ChannelMessageCollection {
    constructor(client, channelId) {
        this.client = client;
        this.channelId = channelId;
    }

    list({ limit, before, after } = {}) {
        const params = new URLSearchParams();
        if (limit !== undefined) params.set('limit', String(limit));
        if (before !== undefined) params.set('before', String(before));
        if (after !== undefined) params.set('after', String(after));
        const query = params.toString();
        const suffix = query ? `?${query}` : '';
        return this.client.request('GET', `/api/v1/channels/${this.channelId}/messages${suffix}`);
    }

    create({ content, components } = {}) {
        return this.client.request(
            'POST',
            `/api/v1/channels/${this.channelId}/messages`,
            { content, components }
        );
    }

    get(messageId) {
        return new ChannelMessageManager(this.client, this.channelId, messageId);
    }

    bulkDelete(messageIds) {
        return this.client.request(
            'DELETE',
            `/api/v1/channels/${this.channelId}/messages/bulk-delete`,
            { messages: messageIds }
        );
    }
}

class ChannelPinsManager {
    constructor(client, channelId) {
        this.client = client;
        this.channelId = channelId;
    }

    list() {
        return this.client.request('GET', `/api/v1/channels/${this.channelId}/pins`);
    }

    add(messageId) {
        return this.client.request('PUT', `/api/v1/channels/${this.channelId}/pins/${messageId}`);
    }

    remove(messageId) {
        return this.client.request('DELETE', `/api/v1/channels/${this.channelId}/pins/${messageId}`);
    }
}

export class ChannelManager {
    constructor(client, channelId) {
        this.client = client;
        this.channelId = channelId;
        this.messages = new ChannelMessageCollection(client, channelId);
        this.pins = new ChannelPinsManager(client, channelId);
    }

    fetch() {
        return this.client.request('GET', `/api/v1/channels/${this.channelId}`);
    }

    send(content, options = {}) {
        return this.messages.create({ content, ...options });
    }
}
