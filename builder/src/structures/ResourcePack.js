const Path = require('path');
const fs = require('fs').promises;
const JSZip = require('jszip');

class ResourcePack {
  constructor() {
    this.dirs = [];
    this.files = {};
  }

  async readDir(path = '', inPath) {
    if (!inPath) {
      // First route
      path = Path.join(path, 'assets');
      inPath = 'assets';
    }
    this.dirs.push(inPath);

    const files = await fs.readdir(path);
    
    for (let file of files) {
      const filePath = Path.join(path, file);
      const stat = await fs.lstat(filePath);
      
      let file_inPath = Path.join(inPath, file);
      if (stat.isDirectory()) await this.readDir(filePath, file_inPath);
      else {
        let fileName = file_inPath.replace(/\//gi, '\\');
        //rp.mcFiles.push(mcFile);
        const data = await fs.readFile(filePath, 'base64');
        this.files[fileName] = data;
      }
    }
  }

  async readZip(file = '') {
    const zip = new JSZip();
    const data = await fs.readFile(file);
    await zip.loadAsync(data, { createFolders: true });
    
    const readFile = async (relativePath, file) => {
      if (file.dir) this.dirs.push(file.name);
      else {
        let fileName = file.name.replace(/\//gi, '\\');
        //this.mcFiles.push(file.name);
        const data = await zip.file(file.name).async('base64');
        this.files[fileName] = data;
      };
    }
    
    await zip.folder('assets').forEach(readFile);
  }

  async read(path = '') {
    const stat = await fs.lstat(path);

    if (stat.isSymbolicLink() || ( stat.isFile() && !path.endsWith('.zip'))) return;

    if (path.endsWith('.zip')) await this.readZip(path);
    else await this.readDir(path);
  }
}

module.exports = ResourcePack;