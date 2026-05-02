export class NexusGuildApiError extends Error {
    constructor(message, { status = null, data = null } = {}) {
        super(message);
        this.name = 'NexusGuildApiError';
        this.status = status;
        this.data = data;
    }
}
