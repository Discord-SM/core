import DiscordSM from '../Client';

import ClientModule from '../../intefaces/ClientModule';

import { existsSync, readdirSync } from 'fs';

export default class ModulesManager {
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
     * Method for launching the initialization of DiscordSM modules
    */
    public init() {
        const clientVersion = require('../../package.json').version as string;
        const moduleFolders = readdirSync('./modules/', { withFileTypes: true });

        moduleFolders.forEach(moduleFolder => {
            if(moduleFolder.isFile()) return this.client.managers.logger.error(this.client.phrases.modules.invalidFile.replace('{file}', moduleFolder.name));
            
            if(moduleFolder.name != 'disabled') {
                if(!moduleFolder.name.startsWith('module_')) return this.client.managers.logger.error(this.client.phrases.modules.invalidFolder.replace('{old}', moduleFolder.name).replace('{new}', `module_${moduleFolder.name}`));
                if(!existsSync(`./modules/${moduleFolder.name}/index.js`)) return this.client.managers.logger.error(this.client.phrases.modules.invalidExecFile.replace('{folder}', moduleFolder.name));
                if(!existsSync(`./modules/${moduleFolder.name}/settings.json`)) return this.client.managers.logger.error(this.client.phrases.modules.invalidSettings.replace('{folder}', moduleFolder.name));

                const clientModule: ClientModule = require(`../../modules/${moduleFolder.name}/index.js`).default;

                if(clientModule?.name && clientModule?.author && clientModule?.description && clientModule?.version && clientModule?.requires) {
                    if(clientVersion >= clientModule.requires.core) {
                        if(clientModule.commands) {
                            clientModule.commands.forEach(clientCommand => {
                                if(!this.client.commands.get(clientCommand.name)) this.client.commands.set(clientCommand.name, clientCommand);
                            })
                        }

                        this.client.modules.set(`enabled.${moduleFolder.name}`, clientModule);
                        this.client.managers.logger.log(this.client.phrases.modules.moduleInitialized.replace('{name}', clientModule.name));

                        if(clientModule?.init) clientModule.init(this.client);
                    }else return this.client.managers.logger.error(this.client.phrases.invalidVersionCore.replace('{name}', clientModule.name).replace('{version}', clientVersion).replace('{require}', clientModule.requires.core));
                }else return this.client.managers.logger.error(this.client.phrases.modules.invalidModule.replace('{name}', moduleFolder.name));
            }
        })
    }
}