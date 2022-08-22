"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlantUmlGenerator = void 0;
const FileService_1 = require("../service/FileService");
const ConfigService_1 = require("../service/ConfigService");
const QueryService_1 = require("../service/QueryService");
const CommandExecutorService_1 = require("../service/CommandExecutorService");
const { exec } = require("child_process");
var request = require('request');
class PlantUmlGenerator {
    communicateWithToolingAPI(bearerKey, instanceUrl, target) {
        let config = new ConfigService_1.ConfigService().getConfigObject();
        let query;
        let queryService = new QueryService_1.QueryService()
            .initiateQuery()
            .withFields(['Name,SymbolTable'])
            .withObject('ApexClass');
        if (config.generateUMLForClasses && config.generateUMLForClasses.length > 0) {
            query = queryService
                .withWhere()
                .withFieldCondition('Name')
                .withListFilters(config.generateUMLForClasses)
                .getUrlyFormattedQuery();
        }
        else {
            query = queryService.getUrlyFormattedQuery();
        }
        request({
            headers: {
                'Authorization': 'Bearer ' + bearerKey,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            uri: instanceUrl + '/services/data/v54.0/tooling/query/?q=' + query,
            method: 'GET'
        }, function (err, res, jsonBody) {
            let jsonObject = JSON.parse(jsonBody);
            let toolingApiResponse = jsonObject;
            new PlantUmlGenerator().processToolingApiResponse(toolingApiResponse, target);
        });
    }
    processToolingApiResponse(toolingApiResponse, target) {
        let plantUmlGenerator = new PlantUmlGenerator();
        let interfaces = plantUmlGenerator.extractInterfaces(toolingApiResponse);
        let innerClasses = plantUmlGenerator.extractInnerClasses(toolingApiResponse);
        let body = plantUmlGenerator.generatePlantUmlBody(toolingApiResponse, interfaces, innerClasses);
        FileService_1.FileService.saveFile(__dirname + '\\..\\..\\uml_description\\result.txt', body);
        new CommandExecutorService_1.CommandExecutorService().executeCommand('java -jar \".\\libs\\jar\\plantuml-1.2022.4.jar\" \".\\uml_description\\result.txt\" -tsvg -o \"' + target + '\"', function (error, stdout, stderr) {
        });
    }
    extractInterfaces(toolingApiResponse) {
        let interfacesFromResponse = [];
        toolingApiResponse.records.forEach(element => {
            var _a, _b, _c;
            if (((_a = element === null || element === void 0 ? void 0 : element.SymbolTable) === null || _a === void 0 ? void 0 : _a.interfaces) && ((_c = (_b = element === null || element === void 0 ? void 0 : element.SymbolTable) === null || _b === void 0 ? void 0 : _b.interfaces) === null || _c === void 0 ? void 0 : _c.length)) {
                interfacesFromResponse = interfacesFromResponse.concat(element.SymbolTable.interfaces);
            }
        });
        return new Set(interfacesFromResponse);
    }
    extractInnerClasses(toolingApiResponse) {
        let innerClassesByParentName = new Map;
        toolingApiResponse.records.forEach(element => {
            var _a, _b, _c, _d;
            if (((_a = element === null || element === void 0 ? void 0 : element.SymbolTable) === null || _a === void 0 ? void 0 : _a.innerClasses) && ((_c = (_b = element === null || element === void 0 ? void 0 : element.SymbolTable) === null || _b === void 0 ? void 0 : _b.innerClasses) === null || _c === void 0 ? void 0 : _c.length)) {
                if (!innerClassesByParentName.has(element.Name)) {
                    innerClassesByParentName.set(element.Name, (_d = element === null || element === void 0 ? void 0 : element.SymbolTable) === null || _d === void 0 ? void 0 : _d.innerClasses);
                }
            }
        });
        return innerClassesByParentName;
    }
    generatePlantUmlBody(toolingApiResponse, interfaces, innerClasses) {
        let body = this.generateForRegularClasses(toolingApiResponse, interfaces);
        body += this.generateForInnerClasses(innerClasses);
        return body;
    }
    generateForRegularClasses(toolingApiResponse, interfaces) {
        let body = this.startUml();
        toolingApiResponse.records.forEach(element => {
            if (element.SymbolTable) {
                body += this.addClassOrInterface(interfaces, element.SymbolTable.name) + element.SymbolTable.name;
                body += this.processExtension(element.SymbolTable.parentClass);
                body += this.processInterfaces(element.SymbolTable.interfaces);
                body += this.openBracket();
                body += this.processProperties(element.SymbolTable.properties);
                body += this.processMethods(element.SymbolTable.methods);
                body += this.closeBracket();
            }
        });
        return body;
    }
    generateForInnerClasses(innerClasses) {
        let body = '';
        if (innerClasses.size > 0) {
            for (let [key, value] of innerClasses) {
                value.forEach(singleInnerClass => {
                    body += this.addClassOrInterface(new Set(), singleInnerClass.name) + singleInnerClass.name;
                    body += this.openBracket();
                    body += this.processProperties(singleInnerClass.properties);
                    body += this.processMethods(singleInnerClass.methods);
                    body += this.closeBracket();
                    body += this.addParentChildRelation(key, singleInnerClass.name);
                });
            }
        }
        body += this.finishUml();
        return body;
    }
    addClassOrInterface(interfaces, entityName) {
        if (interfaces.has(entityName)) {
            return 'interface ';
        }
        return 'class ';
    }
    openBracket() {
        return '{' + this.newLine();
    }
    processProperties(properties) {
        let body = '';
        if (properties) {
            properties.forEach(property => {
                body += property.modifiers.sort(this.sortModifiers).join(' ') + ' ';
                body += property.type + ' ' + property.name;
                body += '\n';
            });
        }
        return body;
    }
    processMethods(methods) {
        let body = '';
        methods.forEach(method => {
            body += method.modifiers.sort(this.sortModifiers).join(' ') + ' ';
            body += method.returnType + ' ';
            body += method.name + '(';
            if (method.parameters) {
                body += this.processParameters(method.parameters);
            }
            body += ')\n';
        });
        return body;
    }
    closeBracket() {
        return '}' + this.newLine();
    }
    addParentChildRelation(parentName, childName) {
        return parentName + '+--' + childName + this.newLine();
    }
    sortModifiers(a, b) {
        if ((a === 'public' || a === 'private') && (b == 'static' || b === 'final')) {
            return -1;
        }
        else if ((b === 'public' || b === 'private') && (a == 'static' || a === 'final')) {
            return 1;
        }
        else if ((a === 'final') && (b == 'static')) {
            return 1;
        }
        else if ((a === 'static') && (b == 'final')) {
            return -1;
        }
        return 0;
    }
    processExtension(parentClass) {
        if (parentClass) {
            return ' extends ' + parentClass;
        }
        return '';
    }
    processInterfaces(interfacesNames) {
        if (interfacesNames.length) {
            return ' implements ' + interfacesNames.join(',');
        }
        return '';
    }
    processParameters(parameters) {
        let parametersLines = [];
        parameters.forEach(parameter => {
            parametersLines.push(parameter.type + ' ' + parameter.name);
        });
        return parametersLines.join(',');
    }
    startUml() {
        return '@startuml' + this.newLine();
    }
    finishUml() {
        return '@enduml';
    }
    newLine() {
        return '\n';
    }
}
exports.PlantUmlGenerator = PlantUmlGenerator;
