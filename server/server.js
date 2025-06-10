// server/server.js
import app from './src/app.js'; // Import your main Express app
import dotenv from 'dotenv';

dotenv.config(); // Ensure environment variables are loaded at the very entry point

const port = process.env.PORT || 5000;

app.listen(port, () => {
    console.log(`🚀 Server is running on port ${port}`);
});