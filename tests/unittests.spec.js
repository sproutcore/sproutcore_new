// this file discovers the tests in this directory and runs them in parallel

// what should happen is that every js file found should be in loaded in a html file
// that html file should have qunit and the js file should be loaded in a script tag
// I see two options: one is generating html files on the server
// the other is have a template html file which loads the js file given as get parameter

// the best would be to generate the test cases here
// so the playwright test runner will see them
import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

// // recursively find all js files in the directory
// function findFiles(dir) {
//   const files = fs.readdirSync(dir);

//   return files.reduce((acc, file) => {
//     const filePath = path.join(dir, file);
//     const stat = fs.statSync(filePath);
//     if (stat.isDirectory()) {
//       return acc.concat(findFiles(filePath));
//     }
//     if (stat.isFile() && file.endsWith('.js') && !file.endsWith('.spec.js')) {
//       return acc.concat(filePath);
//     }
//     return acc;
//   }, []);
// }

// const testFiles = findFiles(__dirname);

/*
How this should work:
- we generate a test.describe for every directory
- that test.describe takes the second argument, which should be a function
- that function generates a function which contains the calls to test for every script
*/

const skipPaths = [
    'node_modules',
    'test_suites'
];

function shouldSkipPath (filePath) {
    return skipPaths.some(skipPath => skipPath.includes(filePath));
}


function generateTests (dir) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory() && !shouldSkipPath(filePath)) {
            test.describe(file, () => {
                generateTests(filePath);
            });
        } 
        else if (stat.isFile() && file.endsWith('.js') && !file.endsWith('.spec.js')) {
            test(file, async ({ page, baseURL }) => {
                await page.goto(baseURL + '/testrunner?script=' + path.relative(projectRoot, filePath));
                await page.waitForFunction(() => window.global_test_results);
                const results = await page.evaluate(() => window.global_test_results);
                // global tests results is an object with the following properties:
                // all: 0,
                // bad: 0,
                // testCount: 0
                expect(results.bad).toBe(0);
            });
        }
    });
}

generateTests(__dirname);
