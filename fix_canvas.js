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
  
  // Replace single line cases: await page.render({ canvasContext: ctx, viewport: renderViewport }).promise;
  content = content.replace(/page\.render\(\{([^}]+)\}\)/g, (match, inner) => {
    if (inner.includes('canvasContext') && inner.includes('viewport') && !inner.includes('canvas: ') && !inner.includes(', canvas') && !/canvas\s*$|canvas\s*,/.test(inner)) {
      console.log(`Fixing in ${filePath}: ${match}`);
      // Find the variable name for canvas if it's not simply 'canvas'. Usually it's 'canvas'
      let canvasVar = 'canvas';
      if (original.includes('const canvasElement =')) canvasVar = 'canvasElement';
      if (original.includes('const c = document.createElement')) canvasVar = 'c';
      
      return `page.render({${inner.endsWith(',') ? inner : inner + ','} canvas: ${canvasVar}})`;
    }
    return match;
  });

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${filePath}`);
  }
}

walkDir('./components', processFile);
