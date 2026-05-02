export class InteractionClient {
    constructor(client, interactionId, interactionToken) {
        this.client = client;
        this.interactionId = interactionId;
        this.interactionToken = interactionToken;
    }

    callback(body) {
        return this.client.request(
            'POST',
            `/api/interactions/${this.interactionId}/${this.interactionToken}/callback`,
            body
        );
    }

    reply(content, options = {}) {
        return this.callback({ type: 4, content, ...options });
    }

    defer(options = {}) {
        return this.callback({ type: 5, ...options });
    }

    followup(content, options = {}) {
        return this.client.request(
            'POST',
            `/api/interactions/${this.interactionId}/${this.interactionToken}/followup`,
            { content, ...options }
        );
    }
}
