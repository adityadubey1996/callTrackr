const StorageSingleton = require("./storageSingleton");

async function updateCors() {
  const bucket = StorageSingleton.getBucket();

  try {
    // Define the desired CORS configuration
    const corsConfig = [
      {
        origin: ["http://localhost:5173", "https://voicequant.com", "http://localhost:5174"], // Add your domains here
        method: ["GET", "PUT", "POST", "OPTIONS"], // Allowed HTTP methods
        responseHeader: ["Content-Type"], // Allowed response headers
        maxAgeSeconds: 3600, // Cache duration
      },
    ];

    // Set the CORS configuration
    await bucket.setCorsConfiguration(corsConfig);

    console.log("CORS configuration updated successfully.");
  } catch (error) {
    console.error('error', error)
    console.error("Error updating CORS configuration:", error.message);
  }
}

updateCors().catch(console.error);

module.exports = {
  updateCors,
};
