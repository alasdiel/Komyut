const fs = require('fs');
const path = require('path');

const EXCLUDE = ['node_modules', '.git', 'bin', 'dist'];

function printTree(dirPath, indent = '') {
  const items = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const item of items) {
    if (EXCLUDE.includes(item.name)) continue;

    const isDir = item.isDirectory();
    console.log(indent + (isDir ? '📁 ' : '📄 ') + item.name);

    if (isDir) {
      printTree(path.join(dirPath, item.name), indent + '  ');
    }
  }
}

const targetDir = process.argv[2] || '.';

console.log(`Directory structure of ${targetDir}:\n`);
printTree(path.resolve(targetDir));
