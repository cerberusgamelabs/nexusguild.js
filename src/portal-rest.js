import { NexusGuildApiError } from './errors.js';

export class PortalRestClient {
    constructor({ baseUrl, sessionCookie, headers = {}, fetchImpl = globalThis.fetch }) {
        if (!baseUrl) throw new Error('NexusGuildPortalClient requires a baseUrl');
        if (!sessionCookie) throw new Error('NexusGuildPortalClient requires a sessionCookie');
        if (typeof fetchImpl !== 'function') throw new Error('NexusGuildPortalClient requires fetch support');

        this.baseUrl = baseUrl.replace(/\/+$/, '');
        this.sessionCookie = sessionCookie;
        this.headers = headers;
        this.fetchImpl = fetchImpl;
    }

    async request(method, path, body) {
        const response = await this.fetchImpl(`${this.baseUrl}${path}`, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Cookie': this.sessionCookie,
                ...this.headers
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
