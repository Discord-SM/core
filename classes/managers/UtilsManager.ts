import DiscordSM from '../Client';

import { APIEmbed } from 'discord-api-types/v10';
import { EmbedBuilder } from '@discordjs/builders';

import { existsSync, mkdirSync, readdirSync } from 'fs';
import { query, QueryResult, Type } from 'gamedig';
import { ApplicationCommandOptionData, GuildMember, resolveColor } from 'discord.js';

import ClientEvent from '../../intefaces/ClientEvent';
import ClientCommand from '../../intefaces/ClientCommand';

export default class UtilsManager {
    private client: DiscordSM<any>;

    constructor(client: DiscordSM<any>) {
        /**
         * Discord Client
         * 
         * @type {DiscordSM}
         * @private
        */
        this.client = client;
    }

    /**
     * Method for launching DiscordSM client initialization
    */
    public initialClient(): void {
        const clientEvents = readdirSync('./events/client').filter(file => file.endsWith('ts') || file.endsWith('js'));

        clientEvents.forEach(clientEvent => {
            const event: ClientEvent = require(`../../events/client/${clientEvent}`).default;

            this.client.on(event.name || clientEvent.replace('.ts', '').replace('.js', ''), event.run.bind(null, this.client));
        })

        const clientCommands = readdirSync('./commands').filter(file => file.endsWith('ts') || file.endsWith('js'));

        clientCommands.forEach(clientCommand => {
            const command: ClientCommand = require(`../../commands/${clientCommand}`).default;

            this.client.commands.set(command.name, command);
        })

        this.client.login(this.client.configs.main.token);
    }

    /**
     * Method for delayed start of initialization of DiscordSM modules
    */
    public initialModules(): void {
        if(!existsSync('./modules')) mkdirSync('./modules');
        if(!existsSync('./modules/disabled')) mkdirSync('./modules/disabled');

        setTimeout(async() => {
            this.client.managers.modules.init();
            this.client.managers.utils.registerCommands();
        }, 5000)
    }

    /**
     * Method for launching DiscordSM client activities initialization
    */
    public initialStatuses(): void {
        if(this.client.configs.statuses.length < 1) return;

        setInterval(async () => {
            const statusID = Math.floor(Math.random() * this.client.configs.statuses.length);
            const statusData = this.client.configs.statuses[statusID];
            const onlineData = await this.getServersOnline();

            this.client.user.setActivity({ type: statusData.type, name: statusData.text.replace('{projectsCount}', this.client.configs.servers.length.toString()).replace('{playersCount}', onlineData.players.toString()).replace('{slotsCount}', onlineData.slots.toString()), url: statusData.url });
        }, this.client.configs.main.statusChangeInterval)
    }

    /**
     * Method to run initialization and register DiscordSM client commands
    */
    public registerCommands(): void {
        if(this.client.commands.size < 1) return;

        let commandsArray: Array<{ name: string, description: string, options: ApplicationCommandOptionData[] | null }> = [];

        this.client.commands.forEach(command => {
            commandsArray.push({ name: command.name, description: command.description, options: command.options ? command.options : null });
        })

        this.client.application.commands.set(commandsArray);
    }

    /**
     * DiscordSM method for simplified assembly of Embed messages
     * 
     * @param {APIEmbed} options Embed Options
     * @param {GuildMember | null} member Guild Member
     * @param {Boolean} footer Embed has a footer?
     * @param {Boolean} timestamp Embed has a timestamp?
     *
     * @returns {EmbedBuilder} Embed ready to send a message
    */
    public buildEmbed(options: APIEmbed, member: GuildMember | null, footer?: boolean, timestamp?: boolean): EmbedBuilder {
        const embed = new EmbedBuilder();
        
        embed.setColor(resolveColor(options?.color || 'Random'));

        if(options?.title) embed.setTitle(options.title);
        if(options?.author) embed.setAuthor({ name: options.author.name, iconURL: options.author.icon_url });

        if(options?.url) embed.setURL(options.url);
        if(options?.image) embed.setImage(options.image.url);
        if(options?.thumbnail) embed.setThumbnail(options.thumbnail.url);

        if(options?.description === '-') embed.data.description = null;
        else embed.setDescription(options.description.replace('{e}', '❌').replace('{s}', '✔').replace('{w}', '⌛').replace('{i}', '❗'));

        if(options.fields) {
            options.fields.forEach(field => {
                embed.addFields([{ name: field.name, value: field.value, inline: field?.inline || false }]);
            })
        }
        
        if(footer && options?.footer) embed.setFooter({ text: options.footer.text, iconURL: options.footer.icon_url });
        else if(member && footer && !options?.footer) embed.setFooter({ text: this.client.phrases.requested.replace('{uTag}', member.user.tag), iconURL: member.user.avatarURL() });

        if(timestamp) embed.setTimestamp();

        return embed;
    }

    /**
     * Method for number formatting
     * 
     * @param data Array with numbers
     * 
     * @returns {Array<String>} Array with formatted numbers as strings
    */
    public formatNumbers(data: Array<number>): Array<string> {
        let formattedArray: Array<string> = [];

        data.forEach((number: any) => {
            if(number < 10) {
                number = '0' + number;
            }

            formattedArray.push(String(number));
        })

        return formattedArray;
    }

    /**
     * Method for calculating the total online on servers
     * 
     * @returns {Promise<{ slots: Number, players: Number }>} Object with total number of slots and players
    */
    public getServersOnline(): Promise<{ slots: number, players: number }> {
        return new Promise(async (resolve, reject) => {
            let playersCount: number = 0, slotsCount: number = 0;
            
            for(let i = 0; i < this.client.configs.servers.length; i++) {
                const server = this.client.configs.servers[i];

                const serverValue = server.value;
                const serverData = serverValue.split('|');

                const serverType = serverData[0];
                const serverIP = serverData[1];
                const serverPort = Number(serverData[2]);

                const serverOnlineData = await query({ type: serverType as Type, host: serverIP, port: serverPort, maxAttempts: 1, attemptTimeout: 10000, socketTimeout: 1000 }).catch((error: Error) => { return }) as QueryResult;

                slotsCount += serverOnlineData?.maxplayers || 0;
                playersCount += serverOnlineData?.players?.length || 0;
            }

            return resolve({ slots: slotsCount, players: playersCount });
        })
    }
}