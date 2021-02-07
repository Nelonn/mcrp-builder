const path = require('path');
const fs = require('fs').promises;

const ResourcePack = require('../structures/ResourcePack');

/**
 * Contains various general-purpose utility methods. These functions are also available on the base `Discord` object.
 */
class Util {
  constructor() {
    throw new Error(`The ${this.constructor.name} class may not be instantiated.`);
  }

  static async clearDir(dir = '', whiteList = []) {
    const files = await fs.readdir(dir);
    for (let file of files) {
      const filePath = path.join(dir, file);
      const stat = await fs.lstat(filePath);

      if (whiteList.includes(file)) continue;
      if (stat.isDirectory()) {
        await this.clearDir(filePath);
        await fs.rmdir(filePath);
      } else await fs.unlink(filePath);
    }
  }

  static async readRPs(dir = '') {
    const RPs = [];

    const files = await fs.readdir(dir);
    for (let file of files) {
      const filePath = path.join(dir, file);
      const stat = await fs.lstat(filePath);

      if (stat.isSymbolicLink() || ( stat.isFile() && !file.endsWith('.zip'))) continue;
      
      let RP = new ResourcePack();
      await RP.read(filePath);
      RPs.push(RP);
    }

    return RPs;
  }
}

module.exports = Util;