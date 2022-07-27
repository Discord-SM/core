import DiscordSM from '../classes/Client';

export default interface ClientModule {
    name: string;
    author: string;
    version: string;
    description: string;

    requires: {
        core: string;
    }
    
    init?: ModuleInit;
    initEvents?: ModuleInitEvents;
    initCommands?: ModuleInitCommands;
}

type ModuleInit = (client?: DiscordSM<any>) => any | Promise<any>;
type ModuleInitEvents = (client?: DiscordSM<any>) => any | Promise<any>;
type ModuleInitCommands = (client?: DiscordSM<any>) => any | Promise<any>;