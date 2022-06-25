import config from '../configs/client.config.json';
import locales from '../configs/client.locales.json';
import servers from '../configs/client.servers.json';
import statuses from '../configs/client.statuses.json';

export default interface DefaultConfig {
    main: typeof config;
    locales: typeof locales;
    servers: typeof servers;
    statuses: typeof statuses;
}