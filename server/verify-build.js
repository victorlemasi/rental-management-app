#!/usr/bin/env node
import { readFileSync } from 'fs';

// Check if the compiled users.js file has .js extensions in imports
try {
    const content = readFileSync('./dist/routes/users.js', 'utf-8');
    const lines = content.split('\n').slice(0, 5);
    console.log('=== First 5 lines of compiled users.js ===');
    lines.forEach((line, i) => console.log(`${i + 1}: ${line}`));

    const hasJsExtensions = content.includes("from '../models/User.js'");
    console.log('\n=== Verification ===');
    console.log(`Has .js extensions: ${hasJsExtensions}`);

    if (!hasJsExtensions) {
        console.error('ERROR: Compiled file missing .js extensions!');
        process.exit(1);
    }
    console.log('Build verification passed!');
} catch (error) {
    console.error('Error verifying build:', error.message);
    process.exit(1);
}
