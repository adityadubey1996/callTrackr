const { Storage } = require("@google-cloud/storage");
const path = require("path");

class StorageSingleton {
  constructor() {
    throw new Error(
      "Use StorageSingleton.getStorage() or StorageSingleton.getBucket()"
    );
  }

  static getInstance() {
    if (!StorageSingleton.instance) {
      const keyFilenamePath = path.join(
        __dirname,
        "../config/spartan-setting-455409-f3-ab2d9ba9c529.json"
      );
      const storage = new Storage({ keyFilename: keyFilenamePath });
      const bucket = storage.bucket("files_calltrackr1");

      StorageSingleton.instance = { storage, bucket };
    }
    return StorageSingleton.instance;
  }

  static getBucket() {
    return StorageSingleton.getInstance().bucket;
  }

  static async generateSignedUrl(fileName, action, expiry = 15 * 60) {
    const options = {
      version: "v4",
      action,
      expires: Date.now() + expiry * 1000,
    };
    const [url] = await this.getBucket().file(fileName).getSignedUrl(options);
    return url;
  }

  static async deleteFile(fileName) {
    const file = this.getBucket().file(fileName);
    const [exists] = await file.exists();
    if (exists) {
      await file.delete();
    } else {
      throw new Error(`File ${fileName} does not exist.`);
    }
  }
}

module.exports = StorageSingleton;
