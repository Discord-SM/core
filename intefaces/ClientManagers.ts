import UtilsManager from '../classes/managers/UtilsManager';
import LoggerManager from '../classes/managers/LoggerManager';
import ModulesManager from '../classes/managers/ModulesManager';

export default interface ClientManagers {
    utils: UtilsManager;
    logger: LoggerManager;
    modules: ModulesManager;
}