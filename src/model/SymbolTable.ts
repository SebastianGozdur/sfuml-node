import {Constructors} from '../model/Constructors';
import {Method} from '../model/Method';
import {TableDeclaration} from '../model/TableDeclaration';
import {Variable} from '../model/Variable';
import {Property} from '../model/Property';
import {InnerClass} from "./InnerClass";

export interface SymbolTable {

    constructors: Constructors[];
    id: string;
    key: string;
    methods: Method[];
    name: string;
    tableDeclarations: TableDeclaration[];
    variables: Variable[];
    parentClass: string;
    interfaces: string[];
    properties: Property[];
    innerClasses: InnerClass[];
}