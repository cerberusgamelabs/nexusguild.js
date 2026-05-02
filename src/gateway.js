import { EventEmitter } from 'node:events';
import { io } from 'socket.io-client';
import { InteractionContext } from './interaction-context.js';

const GATEWAY_NAMESPACE = '/bot-gateway';

export class NexusGuildGateway extends EventEmitter {
    constructor({ token, baseUrl, socketFactory = io }) {
        super();

        if (!token) throw new Error('NexusGuildGateway requires a bot token');
        if (!baseUrl) throw new Error('NexusGuildGateway requires a baseUrl');
        if (typeof socketFactory !== 'function') throw new Error('NexusGuildGateway requires a socket factory');

        this.token = token;
        this.baseUrl = baseUrl.replace(/\/+$/, '');
        this.socketFactory = socketFactory;
        this.socket = null;
        this.ready = false;
        this.bot = null;
        this.client = null;
    }

    connect() {
        if (this.socket) return this;

        this.socket = this.socketFactory(`${this.baseUrl}${GATEWAY_NAMESPACE}`, {
            auth: { token: this.token },
            transports: ['websocket', 'polling']
        });

        this.socket.on('connect', () => {
            this.emit('connect');
        });

        this.socket.on('disconnect', (reason) => {
            this.ready = false;
            this.emit('disconnect', reason);
        });

        this.socket.on('connect_error', (error) => {
            this.emit('error', error);
        });

        this.socket.on('READY', (payload) => {
            this.ready = true;
            this.bot = payload?.bot || null;
            this.emit('ready', payload);
        });

        this.socket.on('HEARTBEAT_ACK', () => {
            this.emit('heartbeatAck');
        });

        const passThroughEvents = [
            'GUILD_CREATE',
            'MESSAGE_CREATE',
            'MESSAGE_UPDATE',
            'MESSAGE_DELETE',
            'REACT_ADD',
            'REACT_REMOVE',
            'MEMBER_JOIN',
            'MEMBER_LEAVE',
            'CHANNEL_CREATE',
            'CHANNEL_UPDATE',
            'CHANNEL_DELETE',
            'ROLE_UPDATE',
            'INTERACTION_CREATE',
            'GUILD_MEMBER_UPDATE'
        ];

        for (const eventName of passThroughEvents) {
            this.socket.on(eventName, (payload) => {
                if (eventName === 'INTERACTION_CREATE') {
                    const context = new InteractionContext(this.client, payload);
                    this.emit('interaction', context);
                    this.emit('interactionCreate', context);
                    this.emit('INTERACTION_CREATE', context);
                    return;
                }
                this.emit(eventName, payload);
                this.emit(this.#toFriendlyEventName(eventName), payload);
            });
        }

        return this;
    }

    disconnect() {
        if (!this.socket) return this;
        this.socket.disconnect();
        this.socket = null;
        this.ready = false;
        return this;
    }

    heartbeat() {
        this.socket?.emit('HEARTBEAT');
        return this;
    }

    onReady(handler) {
        this.on('ready', handler);
        return this;
    }

    onInteraction(handler) {
        this.on('interactionCreate', handler);
        return this;
    }

    onCommand(name, handler) {
        this.on('interactionCreate', async (context) => {
            if (context.isCommand(name)) {
                await handler(context);
            }
        });
        return this;
    }

    onButton(customId, handler) {
        this.on('interactionCreate', async (context) => {
            if (context.isButton(customId)) {
                await handler(context);
            }
        });
        return this;
    }

    onMemberJoin(handler) {
        this.on('memberJoin', handler);
        return this;
    }

    onMemberLeave(handler) {
        this.on('memberLeave', handler);
        return this;
    }

    onMemberUpdate(handler) {
        this.on('guildMemberUpdate', handler);
        return this;
    }

    onMessageCreate(handler) {
        this.on('messageCreate', handler);
        return this;
    }

    onReactAdd(handler) {
        this.on('reactAdd', handler);
        return this;
    }

    onReactRemove(handler) {
        this.on('reactRemove', handler);
        return this;
    }

    onGuildCreate(handler) {
        this.on('guildCreate', handler);
        return this;
    }

    #toFriendlyEventName(eventName) {
        return eventName
            .toLowerCase()
            .split('_')
            .map((part, index) => index === 0 ? part : part.charAt(0).toUpperCase() + part.slice(1))
            .join('');
    }
}
