require('dotenv').config(); // Load environment variables
const httpServer = require('./index'); // Import the app instance
const connectDB = require('./config/db'); // Database connection logic
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connect to the database
    await connectDB();
    // Start the server
    httpServer.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1); // Exit with failure code
  }
};

// Start the app
startServer()
