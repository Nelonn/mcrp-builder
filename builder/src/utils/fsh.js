const { dir } = require('console');
const Path = require('path');
const fs = require('fs').promises;

async function has(path = '') {
  let result = 'NONE';
  await fs.stat(path)
    .then((stats) => {
      if (stats.isFile()) result = 'FILE';
      else if (stats.isDirectory()) result = 'DIR';
      else if (stats.isSymbolicLink()) result = 'LINK';
    })
    .catch((err) => {
      if (err) result = 'NONE';
    });
  return result;
}

async function mkdir(path = '', replace = false) {
  const dirname = Path.dirname(path);
  const parentDir = await has(dirname);
  if (parentDir != 'DIR') await mkdir(dirname, true);
  const result = await has(path);
  if (result == 'NONE') fs.mkdir(path);
  else if (result != 'DIR' && replace) {
    await fs.unlink(path);
    await fs.mkdir(path);
  }
}

async function clone(oldPath = '', newPath = '') {
  const data = await fs.readFile(oldPath);
  await fs.writeFile(newPath, data);
}

module.exports = { 
  has, 
  mkdir, 
  //clone,
}