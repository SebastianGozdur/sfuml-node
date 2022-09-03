import {PlantUmlGenerator} from '../runner/PlantUmlGenerator';

export class PlantUmlService {

    public generateUmlAndSaveFile(target: string, bearerKey: string, instanceUrl: string, configPath: string): void {
        new PlantUmlGenerator().communicateWithToolingAPI(bearerKey, instanceUrl, target, configPath);
    }
}