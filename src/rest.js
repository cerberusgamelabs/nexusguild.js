import { NexusGuildApiError } from './errors.js';

export class RestClient {
    constructor({ token, baseUrl, fetchImpl = globalThis.fetch }) {
        if (!token) throw new Error('NexusGuildClient requires a bot token');
        if (!baseUrl) throw new Error('NexusGuildClient requires a baseUrl');
        if (typeof fetchImpl !== 'function') throw new Error('NexusGuildClient requires fetch support');

        this.token = token;
        this.baseUrl = baseUrl.replace(/\/+$/, '');
        this.fetchImpl = fetchImpl;
    }

    async request(method, path, body) {
        const response = await this.fetchImpl(`${this.baseUrl}${path}`, {
            method,
            headers: {
                'Authorization': `Bot ${this.token}`,
                'Content-Type': 'application/json'
            },
            body: body === undefined ? undefined : JSON.stringify(body)
        });

        if (response.status === 204) {
            return null;
        }

        const text = await response.text();
        let data = null;

        if (text) {
            try {
                data = JSON.parse(text);
            } catch {
                data = text;
            }
        }

        if (!response.ok) {
            throw new NexusGuildApiError(
                data?.message || data?.error || `Request failed with status ${response.status}`,
                { status: response.status, data }
            );
        }

        return data;
    }
}
