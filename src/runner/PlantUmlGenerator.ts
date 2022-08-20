import * as fs from 'fs';
import * as path from 'path';
import {ToolingApiResponse} from '../model/ToolingApiResponse';
import {Method} from '../model/Method';
import {Parameter} from '../model/Parameter';
import {Property} from '../model/Property';
import {Config} from '../model/config/Config';
import {FileService} from '../service/FileService';
import {ConfigService} from '../service/ConfigService';
import {QueryService} from '../service/QueryService';
import {CommandExecutorService} from '../service/CommandExecutorService';

const {exec} = require("child_process");
var request = require('request');

export class PlantUmlGenerator {

    public communicateWithToolingAPI(bearerKey: string, instanceUrl: string, target: string): void {
        let toolingApiResponseBody;
        let config: Config = new ConfigService().getConfigObject();
        console.log('RETRIEVED CONFIG');
        console.log(config.generateUMLForClasses);
        let query;
        let queryService: QueryService = new QueryService()
            .initiateQuery()
            .withFields(['Name,SymbolTable'])
            .withObject('ApexClass');

        if (config.generateUMLForClasses && config.generateUMLForClasses.length > 0) {
            query = queryService
                .withWhere()
                .withFieldCondition('Name')
                .withListFilters(config.generateUMLForClasses)
                .getUrlyFormattedQuery();
        } else {
            query = queryService.getUrlyFormattedQuery();
        }

        console.log(instanceUrl + '/services/data/v54.0/tooling/query/?q=SELECT+Name,SymbolTable+FROM+ApexClass');

        request({
            headers: {
                'Authorization': 'Bearer ' + bearerKey,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            uri: instanceUrl + '/services/data/v54.0/tooling/query/?q=' + query,
            method: 'GET'
        }, function (err: any, res: any, jsonBody: string) {
            console.log(jsonBody);
            let jsonObject: any = JSON.parse(jsonBody);
            let toolingApiResponse: ToolingApiResponse = <ToolingApiResponse>jsonObject;
            console.log(jsonBody);

            new PlantUmlGenerator().processToolingApiResponse(toolingApiResponse, target);
        });
    }

    public processToolingApiResponse(toolingApiResponse: ToolingApiResponse, target: string) {
        let plantUmlGenerator: PlantUmlGenerator = new PlantUmlGenerator();
        let interfacesFromResponse: string[] = [];
        let interfaces = plantUmlGenerator.extractInterfaces(toolingApiResponse);
        let body: string = plantUmlGenerator.generatePlantUmlBody(toolingApiResponse, interfaces);

        FileService.saveFile(__dirname + '\\..\\..\\uml_description\\result.txt', body);
        new CommandExecutorService().executeCommand('java -jar \".\\libs\\jar\\plantuml-1.2022.4.jar\" \".\\uml_description\\result.txt\" -tsvg -o \"' + target + '\"', function (error: any, stdout: any, stderr: any) {
            console.log('generate uml');
        });
    }

    public extractInterfaces(toolingApiResponse: ToolingApiResponse): Set<string> {
        let interfacesFromResponse: string[] = [];
        toolingApiResponse.records.forEach(element => {
            if (element?.SymbolTable?.interfaces && element?.SymbolTable?.interfaces?.length) {
                interfacesFromResponse = interfacesFromResponse.concat(element.SymbolTable.interfaces);
            }
        });

        return new Set<string>(interfacesFromResponse);
    }

    public generatePlantUmlBody(toolingApiResponse: ToolingApiResponse, interfaces: Set<string>): string {
        let body: string = this.startUml();

        //TO DO: add inner classes handling

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
        body += this.finishUml();

        return body;
    }

    public processProperties(properties: Property[]): string {
        let body = '';

        if (properties) {
            properties.forEach(property => {
                console.log('sortedModifiers ', property.modifiers.sort(this.sortModifiers));
                body += property.modifiers.sort(this.sortModifiers).join(' ') + ' ';
                body += property.type + ' ' + property.name;
                body += '\n';
            });
        }

        return body;
    }

    private sortModifiers(a: string, b: string): number {
        if ((a === 'public' || a === 'private') && (b == 'static' || b === 'final')) {
            return -1;
        } else if ((b === 'public' || b === 'private') && (a == 'static' || a === 'final')) {
            return 1;
        } else if ((a === 'final') && (b == 'static')) {
            return 1;
        } else if ((a === 'static') && (b == 'final')) {
            return -1;
        }
        return 0;
    }


    public processExtension(parentClass: string): string {
        if (parentClass) {
            return ' extends ' + parentClass;
        }

        return '';
    }

    public processInterfaces(interfacesNames: string[]): string {
        if (interfacesNames.length) {
            return ' implements ' + interfacesNames.join(',');
        }

        return '';
    }

    public processMethods(methods: Method[]) {
        let body: string = '';

        methods.forEach(method => {
            body += method.returnType + ' ';
            body += method.name + '(';
            if (method.parameters) {
                body += this.processParameters(method.parameters);
            }
            body += ')\n';
        });

        return body;
    }

    public processParameters(parameters: Parameter[]) {
        let parametersLines: string[] = [];

        parameters.forEach(parameter => {
            parametersLines.push(parameter.type + ' ' + parameter.name);
        });

        return parametersLines.join(',');
    }

    public startUml(): string {
        return '@startuml' + this.newLine();
    }

    public finishUml(): string {
        return '@enduml';
    }

    public newLine(): string {
        return '\n';
    }

    public addClassOrInterface(interfaces: Set<String>, entityName: string): string {
        if (interfaces.has(entityName)) {
            return 'interface ';
        }

        return 'class ';
    }

    public openBracket(): string {
        return '{' + this.newLine();
    }

    public closeBracket(): string {
        return '}' + this.newLine();
    }
}