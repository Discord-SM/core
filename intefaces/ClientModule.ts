import DiscordSM from '../classes/Client';

import ClientCommand from './ClientCommand';

export default interface ClientModule {
    name: string;
    author: string;
    version: string;
    description: string;

    requires: {
        core: string;
    }

    commands: Array<ClientCommand> | null;
    
    init?: ModuleInit;
}

type ModuleInit = (client?: DiscordSM<any>) => any | Promise<any>;