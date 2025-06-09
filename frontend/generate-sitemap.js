// generate-sitemap.js
import { SitemapStream, streamToPromise } from 'sitemap';
import { createWriteStream } from 'fs';
import path from 'path';
import axios from 'axios'; // <-- Make sure axios is imported here

// --- IMPORTANT: CONFIGURE THESE FOR YOUR NODE.JS ENVIRONMENT ---
// This is your public facing domain for the sitemap URLs
const BASE_SITEMAP_URL = 'https://daycare-ai-activity-suggestions.vercel.app/'; // <<< REPLACE WITH YOUR ACTUAL DOMAIN (e.g., https://classweave.app)

// This is the URL for your backend API, accessible from where the Node.js script runs
// For local development/build:
const BACKEND_API_URL = 'https://daycare-ai-activity-suggestions-backend.onrender.com/';
// For production builds on your CI/CD 
// You might need an environment variable here, or hardcode your production backend URL.
// const BACKEND_API_URL = process.env.VITE_BACKEND_API_URL || 'https://daycare-ai-activity-suggestions-backend.onrender.com';
// Note: If you use process.env.VITE_BACKEND_API_URL, ensure it's set in your CI/CD environment where this script runs.
// Or, if your backend is always on Render, you can just hardcode the Render URL for production builds.
// For now, let's stick with localhost for development testing, but remember to change for deploy.
// ------------------------------------------------------------------


async function generateSitemap() {
    console.log('Starting sitemap generation...');

    const sitemapStream = new SitemapStream({ hostname: BASE_SITEMAP_URL });

    const outputPath = path.resolve(__dirname, 'public', 'sitemap.xml');
    const writeStream = createWriteStream(outputPath);

    sitemapStream.pipe(writeStream);

    // Add static routes
    sitemapStream.write({ url: '/', changefreq: 'daily', priority: 1.0 });
    sitemapStream.write({ url: '/privacy-policy', changefreq: 'monthly', priority: 0.8 });
    sitemapStream.write({ url: '/students', changefreq: 'monthly', priority: 0.9 });
    
    // Authentication-related pages (these themselves are public, though they lead to private content)
    sitemapStream.write({ url: '/login', changefreq: 'weekly', priority: 0.5 });
    sitemapStream.write({ url: '/register', changefreq: 'weekly', priority: 0.5 });
    sitemapStream.write({ url: '/forgot-password', changefreq: 'weekly', priority: 0.3 });
    sitemapStream.write({ url: '/reset-password', changefreq: 'weekly', priority: 0.3 });
    
    sitemapStream.write({ url: '/saved-activities', changefreq: 'weekly', priority: 0.7 });
    
    sitemapStream.write({ url: '/coming-soon', changefreq: 'monthly', priority: 0.2 }); // Assuming this is temporary
    sitemapStream.write({ url: '/under-construction', changefreq: 'monthly', priority: 0.2 }); // Assuming this is temporary


      // IMPORTANT: No dynamic or private routes (like /students/:id, /add-student, /students, /saved-activities/:id)
    // are included here, as they require authentication or contain sensitive user data.

    sitemapStream.end();
    await streamToPromise(sitemapStream);
    console.log(`Sitemap generated successfully at ${outputPath}`);
}

generateSitemap().catch(console.error);