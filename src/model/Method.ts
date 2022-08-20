import {Parameter} from '../model/Parameter';

export interface Method {

    modifiers: string[];
    name: string;
    parameters: Parameter[];
    returnType: string;
}