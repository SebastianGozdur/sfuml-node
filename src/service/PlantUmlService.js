"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlantUmlService = void 0;
const PlantUmlGenerator_1 = require("../runner/PlantUmlGenerator");
class PlantUmlService {
    generateUmlAndSaveFile(target, bearerKey, instanceUrl, configPath) {
        new PlantUmlGenerator_1.PlantUmlGenerator().communicateWithToolingAPI(bearerKey, instanceUrl, target, configPath);
    }
}
exports.PlantUmlService = PlantUmlService;
