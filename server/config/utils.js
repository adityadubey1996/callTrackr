// do not change this as it is used in server as well

const generateUniqueFileName = (fileName, userId) => {
  if (!userId) {
    throw Error("user Id is required");
  }
  if (!fileName) {
    throw Error("fileName is required");
  }
  const dateTime = new Date().toISOString().replace(/[-:.]/g, ""); // Format as YYYYMMDDHHMMSS
  return `${dateTime}-${userId}-${fileName}`;
};
// Do not change this as it is used in server as well
const destructureUniqueFileName = (uniqueFileName) => {
  const parts = uniqueFileName.split("-");
  if (parts.length < 3) {
    throw new Error("Invalid file name format.");
  }

  const fileNameWithExtension = parts.slice(2).join("-"); // Join all parts after the dateTime and userId
  const userId = parts[1]; // The second part is the userId
  const dateTime = parts[0]; // The first part is the dateTime

  // Extract the file type (extension) from the file name
  const fileType = fileNameWithExtension.split(".").pop();

  if (!fileType || fileNameWithExtension === fileType) {
    throw new Error("Invalid file type or missing extension.");
  }

  return {
    originalFileName: fileNameWithExtension, // Full original file name including extension
    fileType,
    dateTime,
    userId,
  };
};

module.exports = {
  generateUniqueFileName,
  destructureUniqueFileName,
};
