const fs = require('fs');
const path = require('path');

function walk(dir, callback) {
  if (!fs.existsSync(dir)) return;
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    if (fs.statSync(dirPath).isDirectory()) walk(dirPath, callback);
    else callback(dirPath);
  });
}

walk('src', (file) => {
  if (!file.endsWith('.jsx') && !file.endsWith('.js')) return;
  let code = fs.readFileSync(file, 'utf8');
  let original = code;

  // 1. catch (e) { -> catch { (if e not used in the next 150 chars or before next })
  code = code.replace(/catch\s*\((e|err|error)\)\s*{\s*([^}]+)}/g, (match, v, body) => {
    if (!body.includes(v)) {
      return `catch { ${body}}`;
    }
    return match;
  });

  // 2. (e) => { ... } -> () => { ... } if e not used in next 50 chars? (Risky, skipped for now)

  // 3. Remove unused React imports
  code = code.replace(/import React from ['"]react['"];?\r?\n?/g, '');
  code = code.readFileSync ? code : code.replace(/import React,\s*{/g, 'import {');

  if (code !== original) {
    fs.writeFileSync(file, code);
    console.log('Fixed:', file);
  }
});
