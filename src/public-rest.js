import { NexusGuildApiError } from './errors.js';

export class PublicRestClient {
    constructor({ baseUrl, fetchImpl = globalThis.fetch }) {
        if (!baseUrl) throw new Error('NexusGuildPublicClient requires a baseUrl');
        if (typeof fetchImpl !== 'function') throw new Error('NexusGuildPublicClient requires fetch support');

        this.baseUrl = baseUrl.replace(/\/+$/, '');
        this.fetchImpl = fetchImpl;
    }

    async request(method, path, body) {
        const response = await this.fetchImpl(`${this.baseUrl}${path}`, {
            method,
            headers: {
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
