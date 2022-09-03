import * as fs from 'fs';
import {Config} from '../model/config/Config';

export class ConfigService {

    public getConfigObject(path: string): Config {
        let configBody = fs.readFileSync(path).toString();
        return JSON.parse(configBody);
    }
}