const path = require('path');
const fs = require('fs').promises;

const config = require('../config.json');

let fileBlackList = config.clear.black_list;
let folderBlackList = ['_dev', '_src'];
let clearFolder = config.clear.folder;

let deletedFiles = 0;
let deletedDirs = 0;

async function filter(dir = '') {
  const files = await fs.readdir(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = await fs.lstat(filePath);

    if (stat.isDirectory()) {
      if (folderBlackList.includes(file.toString())) {
        await clearDir(filePath);
        await fs.rmdir(filePath);
        deletedDirs++;
      } else {
        await filter(filePath);
      }
    } else if (stat.isFile()) {
      let blackListed = false;
      for (let list of fileBlackList) {
        if (file.endsWith(list)) blackListed = true;
      }
      if (blackListed) {
        await fs.unlink(filePath);
        deletedFiles++;
      }
    }
  }
}

async function clearDir(dir = '') {
  const files = await fs.readdir(dir);

  for (let file of files) {
    const filePath = path.join(dir, file);
    const stat = await fs.lstat(filePath);
    if (stat.isDirectory()) {
      await clearDir(filePath);
      await fs.rmdir(filePath);
    } else if (stat.isFile()) await fs.unlink(filePath);
  }
}


(async () => {
  console.log(` Filtering ${clearFolder}`);
  await filter(clearFolder);
  console.log(` Deleted ${deletedFiles} file(s) & ${deletedDirs} dir(s)`);
  console.log(' Dir filtered');
})();