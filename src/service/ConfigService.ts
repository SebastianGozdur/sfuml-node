import * as fs from 'fs';
import {Config} from '../model/config/Config';

export class ConfigService {

    public getConfigObject(): Config {
        let configBody = fs.readFileSync(__dirname + '\\..\\..\\config\\config.json').toString();
        let config: Config = JSON.parse(configBody);

        return config;
    }
}