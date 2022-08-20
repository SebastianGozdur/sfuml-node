import * as fs from 'fs';
import * as path from 'path';
import {TextService} from './TextService';

export class FileService {

    public static findMdFiles(directory: string): string[] {
        let files = fs.readdirSync(directory);
        let allFiles: string[] = [];

        files.forEach(file => {
            let path = TextService.connectStrings(directory, file);
            let isDirectory = fs.statSync(path).isDirectory();

            if (isDirectory) {
                allFiles = allFiles.concat(FileService.findMdFiles(path));
            }

            if (!file.includes('.md')) {
                return;
            }

            allFiles.push(path);
        });

        return allFiles;
    }

    public static saveFile(directory: string, body: string) {
        fs.writeFile(directory, body,
            function (err) {
                if (err) {
                    throw err;
                }
            }
        );
    }
}