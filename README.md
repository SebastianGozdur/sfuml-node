# Sf-uml

### About
Script created to generate UML diagram from apex classes.

### Prerequisites
Newest version of node.

### Installation
> npm install sfuml -g

### Usage
> sfuml --instanceurl "https://sample-instance.salesforce.com" --bearer "4fsadase43242" --target "C:\outputDirectory"

For specified config:
> sfuml --instanceurl "https://sample-instance.salesforce.com" --bearer "4fsadase43242" --target "C:\outputDirectory" --configpath "C:\inputConfig\config.json"

config.json

`{"generateUMLForClasses": ["SampleClassName"]}`