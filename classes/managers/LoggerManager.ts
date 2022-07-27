import chalk from 'chalk';

export default class LoggerManager {
    /**
     * Method for sending log using DiscordSM
     * 
     * @param {String} message Log Message
    */
    public log(message: string): void {
        return console.log(`${chalk.cyan('[DiscordSM]')} ${chalk.green(message)}`);
    }

    /**
     * Method for sending warn using DiscordSM
     * @param message Warn Message
    */
    public warn(message: string): void {
        return console.log(`${chalk.cyan('[DiscordSM::Warn]')} ${chalk.yellow(message)}`);
    }

    /**
     * Method for submitting an error message using DiscordSM
     * 
     * @param {String} message Error Message
    */
    public error(message: string): void {
        return console.log(`${chalk.cyan('[DiscordSM::Error]')} ${chalk.red(message)}`);
    }
}