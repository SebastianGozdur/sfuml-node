"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlantUmlService = void 0;
const PlantUmlGenerator_1 = require("../runner/PlantUmlGenerator");
class PlantUmlService {
    generateUmlAndSaveFile(target, bearerKey, instanceUrl) {
        new PlantUmlGenerator_1.PlantUmlGenerator().communicateWithToolingAPI(bearerKey, instanceUrl, target);
    }
}
exports.PlantUmlService = PlantUmlService;
