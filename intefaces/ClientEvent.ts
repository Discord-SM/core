import DiscordSM from '../classes/Client';

export default interface ClientEvent {
    name?: string;
    run: EventRun;
}

type EventRun = (client: DiscordSM<any>, ...args: any[]) => any | Promise<any>;