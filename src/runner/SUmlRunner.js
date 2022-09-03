"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SUmlRunner = void 0;
const PlantUmlService_1 = require("../service/PlantUmlService");
class SUmlRunner {
    generateUml(target, bearerKey, instanceUrl, configPath) {
        try {
            new PlantUmlService_1.PlantUmlService().generateUmlAndSaveFile(target, bearerKey, instanceUrl, configPath);
        }
        catch (error) {
            console.error(error);
        }
    }
}
exports.SUmlRunner = SUmlRunner;
