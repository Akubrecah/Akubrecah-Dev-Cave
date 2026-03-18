const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  try {
    fs.readdirSync(dir).forEach(f => {
      let dirPath = path.join(dir, f);
      let isDirectory = fs.statSync(dirPath).isDirectory();
      isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
  } catch (e) {
    // Ignore
  }
}

function processFile(filePath) {
  if (!filePath.endsWith('.ts') && !filePath.endsWith('.tsx')) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;
  
  // Replace syntax error pattern
  // Matches ",\s*, canvas: canvas" -> ", canvas: canvas"
  // Matches "\n      , canvas: canvas" -> ",\n      canvas: canvas"
  content = content.replace(/\s*,\s*canvas: canvas\}/g, ', canvas: canvas}');
  content = content.replace(/,\s*canvas:\s*canvas/g, ', canvas: canvas');
  // Specifically fix cases where we have something like "\n      , canvas: canvas"
  content = content.replace(/(\n\s*),\s*canvas:\s*canvas/g, ',$1canvas: canvas');
  content = content.replace(/viewport\s*,\s*canvas:\s*canvas/g, 'viewport, canvas: canvas');
  
  // But maybe the simplest is to just re-match the whole block and fix it.
  // We can just find `, canvas: canvas` and ensure there's no preceding comma like `,,` or newline then comma.
  content = content.replace(/,(\s*), canvas: canvas/g, ',$1canvas: canvas');
  content = content.replace(/([^,])(\s*), canvas: canvas/g, '$1,$2canvas: canvas');
  
  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Cleaned syntax in ${filePath}`);
  }
}

walkDir('./components', processFile);
