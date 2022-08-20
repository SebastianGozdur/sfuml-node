import { PlantUmlService } from '../service/PlantUmlService';

export class SUmlRunner {

    public generateUml(target : string, bearerKey : string, instanceUrl : string) {
        try {
            new PlantUmlService().generateUmlAndSaveFile(target, bearerKey, instanceUrl);
        } catch (error) {
            console.error(error);
        }
    }

}