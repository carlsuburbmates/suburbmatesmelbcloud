import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

/**
 * SSOT Terminology Audit
 * Goal: Ensure forbidden terms are never present in the codebase.
 * 
 * This test scans source files for restricted terminology that violates
 * the CANONICAL_TERMINOLOGY.md contract.
 */

const FORBIDDEN_TERMS = [
    'Clinical Sanctuary',
    'clinicalSanctuary',
    'clinical_sanctuary',
    // Add any other restricted terms here
];

const SOURCE_DIRS = [
    'app',
    'components',
    'lib',
];

const ALLOWED_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.md'];

function getAllFiles(dirPath: string, arrayOfFiles: string[] = []): string[] {
    const files = fs.readdirSync(dirPath);

    files.forEach((file) => {
        const fullPath = path.join(dirPath, file);
        if (fs.statSync(fullPath).isDirectory()) {
            // Skip node_modules and .next
            if (!file.startsWith('.') && file !== 'node_modules') {
                getAllFiles(fullPath, arrayOfFiles);
            }
        } else {
            const ext = path.extname(file);
            if (ALLOWED_EXTENSIONS.includes(ext)) {
                arrayOfFiles.push(fullPath);
            }
        }
    });

    return arrayOfFiles;
}

test.describe('SSOT Terminology Audit', () => {

    test('Codebase contains no forbidden terminology', async () => {
        const projectRoot = path.resolve(__dirname, '../../');
        const violations: { file: string; term: string; line: number }[] = [];

        for (const dir of SOURCE_DIRS) {
            const dirPath = path.join(projectRoot, dir);

            if (!fs.existsSync(dirPath)) continue;

            const files = getAllFiles(dirPath);

            for (const file of files) {
                const content = fs.readFileSync(file, 'utf-8');
                const lines = content.split('\n');

                lines.forEach((line, index) => {
                    for (const term of FORBIDDEN_TERMS) {
                        if (line.toLowerCase().includes(term.toLowerCase())) {
                            violations.push({
                                file: path.relative(projectRoot, file),
                                term,
                                line: index + 1,
                            });
                        }
                    }
                });
            }
        }

        if (violations.length > 0) {
            console.error('SSOT Violations Found:');
            violations.forEach((v) => {
                console.error(`  ${v.file}:${v.line} - Contains "${v.term}"`);
            });
        }

        expect(violations).toHaveLength(0);
    });

});
