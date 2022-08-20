import * as path from 'path';

export class TextService {

    public static capitalizeFirstLetter(text: string): string {
        return text.charAt(0).toUpperCase() + text.slice(1);
    }

    public static connectStrings(...paths: string[]): string {
        return path.join(...paths);
    }
}