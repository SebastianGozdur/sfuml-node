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
import {SymbolTable} from "../model/SymbolTable";
import {InnerClass} from "../model/InnerClass";

const {exec} = require("child_process");
var request = require('request');

export class PlantUmlGenerator {

    public communicateWithToolingAPI(bearerKey: string, instanceUrl: string, target: string, configPath: string): void {
        let config: Config = {generateUMLForClasses : []};
        if (configPath) {
            config = new ConfigService().getConfigObject(configPath);
        }
        let query;
        let queryService: QueryService = new QueryService()
            .initiateQuery()
            .withFields(['Name,SymbolTable'])
            .withObject('ApexClass');

        if (config != null && config.generateUMLForClasses && config.generateUMLForClasses.length > 0) {
            query = queryService
                .withWhere()
                .withFieldCondition('Name')
                .withListFilters(config.generateUMLForClasses)
                .getUrlyFormattedQuery();
        } else {
            query = queryService.getUrlyFormattedQuery();
        }

        request({
            headers: {
                'Authorization': 'Bearer ' + bearerKey,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            uri: instanceUrl + '/services/data/v54.0/tooling/query/?q=' + query,
            method: 'GET'
        }, function (err: any, res: any, jsonBody: string) {
            let jsonObject: any = JSON.parse(jsonBody);
            let toolingApiResponse: ToolingApiResponse = <ToolingApiResponse>jsonObject;
            new PlantUmlGenerator().processToolingApiResponse(toolingApiResponse, target);
        });
    }

    private processToolingApiResponse(toolingApiResponse: ToolingApiResponse, target: string) {
        let plantUmlGenerator: PlantUmlGenerator = new PlantUmlGenerator();
        let interfaces = plantUmlGenerator.extractInterfaces(toolingApiResponse);
        let innerClasses = plantUmlGenerator.extractInnerClasses(toolingApiResponse);
        let body: string = plantUmlGenerator.generatePlantUmlBody(toolingApiResponse, interfaces, innerClasses);

        FileService.saveFile(__dirname + '\\..\\..\\uml_description\\result.txt', body);
        new CommandExecutorService().executeCommand('java -jar \".\\libs\\jar\\plantuml-1.2022.4.jar\" \".\\uml_description\\result.txt\" -tsvg -o \"' + target + '\"', function (error: any, stdout: any, stderr: any) {

        });
    }

    private extractInterfaces(toolingApiResponse: ToolingApiResponse): Set<string> {
        let interfacesFromResponse: string[] = [];
        toolingApiResponse.records.forEach(element => {
            if (element?.SymbolTable?.interfaces && element?.SymbolTable?.interfaces?.length) {
                interfacesFromResponse = interfacesFromResponse.concat(element.SymbolTable.interfaces);
            }
        });

        return new Set<string>(interfacesFromResponse);
    }

    private extractInnerClasses(toolingApiResponse: ToolingApiResponse): Map<string, InnerClass[]> {
        let innerClassesByParentName: Map<string, InnerClass[]> = new Map<string, InnerClass[]>;

        toolingApiResponse.records.forEach(element => {
            if (element?.SymbolTable?.innerClasses && element?.SymbolTable?.innerClasses?.length) {
                if (!innerClassesByParentName.has(element.Name)) {
                    innerClassesByParentName.set(element.Name, element?.SymbolTable?.innerClasses);
                }
            }
        });

        return innerClassesByParentName;
    }

    public generatePlantUmlBody(toolingApiResponse: ToolingApiResponse, interfaces: Set<string>, innerClasses: Map<string, InnerClass[]>): string {
        let body: string = this.generateForRegularClasses(toolingApiResponse, interfaces);
        body += this.generateForInnerClasses(innerClasses);
        return body;
    }

    private generateForRegularClasses(toolingApiResponse: ToolingApiResponse, interfaces: Set<string>): string {
        let body: string = this.startUml();

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

    private generateForInnerClasses(innerClasses: Map<string, InnerClass[]>): string {
        let body: string = '';

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

    private addClassOrInterface(interfaces: Set<String>, entityName: string): string {
        if (interfaces.has(entityName)) {
            return 'interface ';
        }

        return 'class ';
    }

    private openBracket(): string {
        return '{' + this.newLine();
    }

    private processProperties(properties: Property[]): string {
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

    private processMethods(methods: Method[]) {
        let body: string = '';

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

    private closeBracket(): string {
        return '}' + this.newLine();
    }

    private addParentChildRelation(parentName: string, childName: string): string {
        return parentName + '+--' + childName + this.newLine();
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

    private processExtension(parentClass: string): string {
        if (parentClass) {
            return ' extends ' + parentClass;
        }

        return '';
    }

    private processInterfaces(interfacesNames: string[]): string {
        if (interfacesNames.length) {
            return ' implements ' + interfacesNames.join(',');
        }

        return '';
    }

    private processParameters(parameters: Parameter[]) {
        let parametersLines: string[] = [];

        parameters.forEach(parameter => {
            parametersLines.push(parameter.type + ' ' + parameter.name);
        });

        return parametersLines.join(',');
    }

    private startUml(): string {
        return '@startuml' + this.newLine();
    }

    private finishUml(): string {
        return '@enduml';
    }

    private newLine(): string {
        return '\n';
    }
}