#!/usr/bin/env node
import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function fixImports(filePath) {
    let content = readFileSync(filePath, 'utf-8');
    let modified = false;

    // Fix relative imports that are missing .js extension
    // Matches: from '../path' or from './path' (without .js)
    const importRegex = /from\s+['"](\.\.[\/\\][^'"]+|\.\/[^'"]+)['"]/g;

    content = content.replace(importRegex, (match, importPath) => {
        // Skip if already has .js extension
        if (importPath.endsWith('.js')) {
            return match;
        }

        // Add .js extension
        modified = true;
        return match.replace(importPath, importPath + '.js');
    });

    if (modified) {
        writeFileSync(filePath, content, 'utf-8');
        console.log(`Fixed imports in: ${filePath}`);
        return true;
    }
    return false;
}

function processDirectory(dirPath) {
    const items = readdirSync(dirPath);
    let fixedCount = 0;

    for (const item of items) {
        const fullPath = join(dirPath, item);
        const stat = statSync(fullPath);

        if (stat.isDirectory()) {
            fixedCount += processDirectory(fullPath);
        } else if (item.endsWith('.js')) {
            if (fixImports(fullPath)) {
                fixedCount++;
            }
        }
    }

    return fixedCount;
}

console.log('=== Fixing .js extensions in compiled files ===');
const distPath = join(__dirname, 'dist');
const fixedCount = processDirectory(distPath);
console.log(`Fixed ${fixedCount} file(s)`);
console.log('Import fix completed!');
