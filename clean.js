/**
 * Script de nettoyage des caractères invisibles
 * Usage: node clean.js
 * ⚠️ Fait une sauvegarde du dossier avant d'exécuter
 */

const fs = require('fs');
const path = require('path');

// Caractères à supprimer (code points Unicode)
const BAD_CHARS = [
  '\uFEFF',   // BOM
  '\u200B',   // Zero-width space
  '\u200C',   // Zero-width non-joiner
  '\u200D',   // Zero-width joiner
  '\u2060',   // Word joiner
  '\u180E',   // Mongolian vowel separator
  '\u200E',   // Left-to-right mark
  '\u200F',   // Right-to-left mark
];

const BAD_REGEX = new RegExp(BAD_CHARS.join('|'), 'g');

// Extensions à traiter
const EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.json', '.css', '.mjs'];

// Dossiers à ignorer
const IGNORE_DIRS = ['node_modules', '.next', '.git', 'out', 'dist', 'build'];

// État global
let totalFiles = 0;
let cleanedFiles = 0;
let totalCharsRemoved = 0;

function shouldProcess(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return EXTENSIONS.includes(ext);
}

function shouldIgnoreDir(dirName) {
  return IGNORE_DIRS.includes(dirName);
}

function cleanFile(filePath) {
  const original = fs.readFileSync(filePath, 'utf8');

  // Compte les caractères à supprimer
  const matches = original.match(BAD_REGEX);
  const removedCount = matches ? matches.length : 0;

  if (removedCount === 0) {
    return; // Rien à faire
  }

  // Nettoie
  const cleaned = original.replace(BAD_REGEX, '');

  // Écrit
  fs.writeFileSync(filePath, cleaned, 'utf8');

  totalFiles++;
  cleanedFiles++;
  totalCharsRemoved += removedCount;

  console.log(`✅ ${filePath} — ${removedCount} caractère(s) supprimé(s)`);
}

function walkDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (!shouldIgnoreDir(entry.name)) {
        walkDir(fullPath);
      }
    } else if (entry.isFile() && shouldProcess(fullPath)) {
      totalFiles++;
      try {
        cleanFile(fullPath);
      } catch (err) {
        console.error(`❌ Erreur sur ${fullPath}:`, err.message);
      }
    }
  }
}

console.log('🧹 Nettoyage des caractères invisibles...\n');

const srcDir = path.join(__dirname, 'src');
if (!fs.existsSync(srcDir)) {
  console.error('❌ Dossier src/ introuvable. Lance le script depuis la racine du projet.');
  process.exit(1);
}

walkDir(srcDir);

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`📁 Fichiers analysés : ${totalFiles}`);
console.log(`✨ Fichiers nettoyés : ${cleanedFiles}`);
console.log(`🗑️  Caractères retirés : ${totalCharsRemoved}`);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

if (cleanedFiles === 0) {
  console.log('✅ Aucun caractère suspect détecté.');
} else {
  console.log('🎯 Terminé ! Redémarre ton serveur dev (npm run dev).');
}