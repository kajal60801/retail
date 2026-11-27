const fs = require('fs').promises;
const path = require('path');

const DATA_DIR = path.join(__dirname, '../data');

class JsonStorageService {
  static getFilePath(filename) {
    return path.join(DATA_DIR, `${filename}.json`);
  }

  static async readData(filename) {
    try {
      const data = await fs.readFile(this.getFilePath(filename), 'utf8');
      return JSON.parse(data);
    } catch (error) {
      if (error.code === 'ENOENT') return [];
      throw error;
    }
  }

  static async writeData(filename, data) {
    const filePath = this.getFilePath(filename);
    const tempPath = `${filePath}.tmp`;
    await fs.writeFile(tempPath, JSON.stringify(data, null, 2), 'utf8');
    await fs.rename(tempPath, filePath);
    return true;
  }
}

module.exports = JsonStorageService;