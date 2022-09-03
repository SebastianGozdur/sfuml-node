import {PlantUmlService} from '../service/PlantUmlService';

export class SUmlRunner {

    public generateUml(target: string, bearerKey: string, instanceUrl: string, configPath: string) {
        try {
            new PlantUmlService().generateUmlAndSaveFile(target, bearerKey, instanceUrl, configPath);
        } catch (error) {
            console.error(error);
        }
    }
}