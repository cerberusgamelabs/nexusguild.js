export class InteractionContext {
    constructor(client, interaction) {
        this.client = client;
        this.interaction = interaction;
        this.id = interaction?.id || null;
        this.token = interaction?.token || null;
        this.type = interaction?.type || null;
        this.guildId = interaction?.guild_id || null;
        this.channelId = interaction?.channel_id || null;
        this.member = interaction?.member || null;
        this.data = interaction?.data || {};
        this.messageId = interaction?.message_id || null;
    }

    get commandName() {
        return this.data?.name || null;
    }

    get customId() {
        return this.data?.custom_id || null;
    }

    get options() {
        return Array.isArray(this.data?.options) ? this.data.options : [];
    }

    isCommand(name = null) {
        if (this.type !== 1) return false;
        if (name === null) return true;
        return this.commandName === name;
    }

    isButton(customId = null) {
        if (this.type !== 3) return false;
        if (customId === null) return true;
        return this.customId === customId;
    }

    option(name, fallback = undefined) {
        const match = this.options.find((entry) => entry?.name === name);
        return match ? match.value : fallback;
    }

    reply(content, options = {}) {
        return this.client
            .interaction(this.id, this.token)
            .reply(content, options);
    }

    defer(options = {}) {
        return this.client
            .interaction(this.id, this.token)
            .defer(options);
    }

    followup(content, options = {}) {
        return this.client
            .interaction(this.id, this.token)
            .followup(content, options);
    }
}
