/* NPM Packages */
import { Client, Collection, GatewayIntentBits, Partials } from 'discord.js';

/* Client Configurations */
import config from '../configs/client.config.json';
import locales from '../configs/client.locales.json';
import servers from '../configs/client.servers.json';
import statuses from '../configs/client.statuses.json';

/* Client Managers */
import LoggerManager from './managers/LoggerManager';
import UtilsManager from './managers/UtilsManager';
import ModulesManager from './managers/ModulesManager';

/* Client Interfaces */
import ClientModule from '../intefaces/ClientModule';
import DefaultConfig from '../intefaces/DefaulConfig';
import ClientCommand from '../intefaces/ClientCommand';
import ClientManagers from '../intefaces/ClientManagers';

/* Client Locales */
import English from '../locales/English.json';
import Russian from '../locales/Russian.json';
import Ukrainian from '../locales/Ukrainian.json';

export default class DiscordSM<T> extends Client {
    private features: { [key: string]: T } = Object.create(null);

    public configs: DefaultConfig = {
        main: config,
        locales: locales,
        servers: servers,
        statuses: statuses
    }

    public cooldowns: Collection<string, number> = new Collection();
    public commands: Collection<string, ClientCommand> = new Collection();
    public phrases: typeof English = require(`../locales/${this.configs.locales.find(locale => locale.tag === this.configs.main.defaultLocale)?.name || 'English'}.json`);

    public managers: ClientManagers = {
        utils: new UtilsManager(this),
        logger: new LoggerManager(),
        modules: new ModulesManager(this)
    }
    
    constructor() {
        super({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildBans,
                GatewayIntentBits.GuildEmojisAndStickers,
                GatewayIntentBits.GuildIntegrations,
                GatewayIntentBits.GuildInvites,
                GatewayIntentBits.GuildMembers,
                GatewayIntentBits.GuildMessageReactions,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.GuildPresences,
                GatewayIntentBits.GuildVoiceStates
            ],

            partials: [
                Partials.Channel,
                Partials.GuildMember,
                Partials.Message,
                Partials.Reaction,
                Partials.User
            ],

            rest: {
                offset: 0
            }
        })
    }

    /**
     * Method for launching DiscordSM initialization
    */
    public start(): void {
        this.managers.utils.initialClient();
    }

    /**
     * Method for registering a new module in the DiscordSM core
     * 
     * @param {String} key Module Key
     * @param {any} value Module Data
    */
    public registerFeature(key: string, value: T): void {
        if(this.getFeature(key)) return this.managers.logger.warn(this.phrases.features.alreadyRegistered.replace('{feature}', key));

        this.features[key] = value;
    }

    /**
     * Method for getting data from a registered DiscordSM module
     * 
     * @param {String} key Module Key
     * 
     * @returns {any} Module Data
    */
    public getFeature(key: string): T {
        return this.features[key];
    }

    /**
     * Method for removing a module from the DiscordSM core
     * 
     * @param key Module Key
    */
    public unregisterFeature(key: string): void {
        if(!this.getFeature(key)) return this.managers.logger.warn(this.phrases.features.notRegistered.replace('{feature}', key));

        delete this.features[key];
    }
}