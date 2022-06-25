import ClientEvent from '../../intefaces/ClientEvent';

export default {
    run: async(client) => {
        client.managers.utils.initialModules();
        client.managers.utils.initialStatuses();
        
        return client.managers.logger.log(`${client.user.tag} ready!`);
    }
} as ClientEvent;