import { RestClient } from './rest.js';
import { NexusGuildGateway } from './gateway.js';
import { ChannelManager } from './managers/channel.js';
import { GuildManager } from './managers/guild.js';
import { InteractionClient } from './managers/interaction.js';

export class NexusGuildClient {
    constructor(options) {
        this.rest = new RestClient(options);
        this.options = options;
    }

    request(method, path, body) {
        return this.rest.request(method, path, body);
    }

    me() {
        return this.request('GET', '/api/v1/users/@me');
    }

    guild(guildId) {
        return new GuildManager(this, guildId);
    }

    channel(channelId) {
        return new ChannelManager(this, channelId);
    }

    interaction(interactionId, interactionToken) {
        return new InteractionClient(this, interactionId, interactionToken);
    }

    gateway() {
        const gateway = new NexusGuildGateway(this.options);
        gateway.client = this;
        return gateway;
    }
}
