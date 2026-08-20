import fs from 'node:fs/promises';
import  { readdir, writeFile } from 'fs/promises';
import path from 'node:path';

// Adds a new file to json with its content
export async function appendToFile(title, date, content) {
    try {

        const id = await readDirectory('./json');

        let newFile = {
            id: id,
            articleTitle: title,
            articleDate: date,
            articleContent: content
        }

        await fs.appendFile(`./json/article${id}.json`, JSON.stringify(newFile, null, 2), 'utf-8');
        console.log("Entry added");

        return id;

    } catch (err) {
        console.error('Error appending to file', err);
    }
}

export async function updateFile(id, title, date, content) {
    try {
        
        let updatedFile = {
            id: id,
            articleTitle: title,
            articleDate: date,
            articleContent: content
        }

        await writeFile(`./json/article${id}.json`, JSON.stringify(updatedFile, null, 2), 'utf-8');
        console.log("Entry updated");
    } catch (err) {
            console.error('Error updating file', err);  
    }
}

export async function readFile(id) {
    try {
        const data = await fs.readFile(`json/article${id}.json`, 'utf8')
        console.log('File Content: ', data);
        return data;
    } catch (err) {
        console.error('Error reading file: ', err);
        return 0;
    }
}

export async function readAllFiles() {
    try {

        const JSON_DIR = './json';
        const files = await readdir(JSON_DIR); // Returns an array with all the file names
        let articleList = [];
        
        for (const file of files) {

            // Read the article
            const filePath = path.join(JSON_DIR, file);
            const fileData = await fs.readFile(filePath, 'utf-8');

            // Convert text to JSON Object
            const article = JSON.parse(fileData);

            articleList.push({
                id: article.id,
                title: article.articleTitle,
                date: article.articleDate,
                content: article.articleContent
            });
        }   

        console.log(articleList);
        return articleList;

    } catch (err) {
        console.error('Error reading directory', err);
        return [];        
    }
}

// Counts the amount of JSON Files in the JSON Directory
async function readDirectory(path) {
    try {
        let counter = 0;
        const files = await readdir(path);

        for (const file of files) {
            console.log(file)
            counter++;
        }

        return counter; 

    } catch (err) {
        console.error('Error reading directory', err);
        return 0;
    }
}

export async function deleteArticleFile(articleID) {
    const filePath = path.join(`./json/article${articleID}.json`);

    await fs.unlink(filePath);
}