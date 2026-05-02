import { PublicRestClient } from './public-rest.js';

export class NexusGuildPublicClient {
    constructor(options) {
        this.rest = new PublicRestClient(options);
    }

    request(method, path, body) {
        return this.rest.request(method, path, body);
    }

    bot(botId) {
        return this.request('GET', `/api/bots/${botId}/public`);
    }

    executeWebhook(webhookId, token, data) {
        return this.request(
            'POST',
            `/api/webhooks/${webhookId}/${token}`,
            data
        );
    }
}
