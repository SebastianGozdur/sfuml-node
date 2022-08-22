import {Constructors} from "./Constructors";
import {Method} from "./Method";
import {Property} from "./Property";
import {Variable} from "./Variable";

export interface InnerClass {

    constructors: Constructors[];
    id: string;
    name: string;
    methods: Method[];
    properties: Property[];
    variables: Variable[];
}