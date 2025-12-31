#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import readline from 'readline';

// Récupérer l'argument module ou demander à l'utilisateur
const MODULE_NAME = process.argv[2] || await new Promise((resolve) => {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    rl.question('Nom de module: ', (answer) => {
        rl.close();
        if (!answer) {
            console.error('Erreur: Le nom du module est requis.');
            process.exit(1);
        }
        resolve(answer);
    });
});

const TEMPLATE_DIR = path.resolve('templates');
const MODULE_DIR = path.resolve('src/modules', MODULE_NAME);
const LAMBDA_DIR = path.resolve('src/lambdas');

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function generateFile(templateFile, outputFile) {
    const template = fs.readFileSync(templateFile, 'utf-8');
    const content = template
        .replace(/{{name}}/g, MODULE_NAME)
        .replace(/{{Name}}/g, capitalize(MODULE_NAME));
    fs.writeFileSync(outputFile, content, 'utf-8');
}

// Création des dossiers
fs.mkdirSync(MODULE_DIR, { recursive: true });
fs.mkdirSync(LAMBDA_DIR, { recursive: true });

console.log(`📦 Création du module '${MODULE_NAME}'...`);

// Génération des fichiers
generateFile(path.join(TEMPLATE_DIR, 'controller.tpl'), path.join(MODULE_DIR, `${MODULE_NAME}.controller.ts`));
generateFile(path.join(TEMPLATE_DIR, 'service.tpl'), path.join(MODULE_DIR, `${MODULE_NAME}.service.ts`));
generateFile(path.join(TEMPLATE_DIR, 'types.tpl'), path.join(MODULE_DIR, `${MODULE_NAME}.types.ts`));
generateFile(path.join(TEMPLATE_DIR, 'lambda.tpl'), path.join(LAMBDA_DIR, `${MODULE_NAME}-lambda.ts`));

console.log(`✅ Module '${MODULE_NAME}' généré !`);
