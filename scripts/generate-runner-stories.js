#!/usr/bin/env node

import puppeteer from 'puppeteer';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Convert image to base64 for embedding
async function getBackgroundImageBase64() {
    const imagePath = path.join(__dirname, '..', 'public', 'welcome-runners.jpg');
    try {
        const imageBuffer = await fs.readFile(imagePath);
        const base64 = imageBuffer.toString('base64');
        return `data:image/jpeg;base64,${base64}`;
    } catch (error) {
        console.warn('Could not load background image:', error.message);
        return null;
    }
}

// Convert font to base64 for embedding
async function getFontBase64() {
    const fontPath = path.join(__dirname, '..', 'public', 'fonts', 'nova.woff');
    try {
        const fontBuffer = await fs.readFile(fontPath);
        const base64 = fontBuffer.toString('base64');
        return `data:font/woff;base64,${base64}`;
    } catch (error) {
        console.warn('Could not load nova font:', error.message);
        return null;
    }
}

// Download and convert runner avatar to base64
async function downloadImageAsBase64(imageUrl) {
    console.log('Downloading image:', imageUrl);
    if (!imageUrl) {
        return null;
    }

    // Handle local file paths (starting with /)
    if (imageUrl.startsWith('/') && !imageUrl.startsWith('http')) {
        const localPath = path.join(__dirname, '..', 'public', imageUrl.substring(1));
        try {
            const fileBuffer = await fs.readFile(localPath);
            const base64 = fileBuffer.toString('base64');

            // Determine MIME type from file extension
            const ext = path.extname(imageUrl).toLowerCase();
            let mimeType = 'image/jpeg'; // default
            if (ext === '.png') mimeType = 'image/png';
            else if (ext === '.svg') mimeType = 'image/svg+xml';
            else if (ext === '.gif') mimeType = 'image/gif';
            else if (ext === '.webp') mimeType = 'image/webp';

            return `data:${mimeType};base64,${base64}`;
        } catch (error) {
            console.warn(`Could not load local image ${imageUrl}:`, error.message);
            // Fallback to default icon
            return await downloadImageAsBase64('/15KURRAO-icon.svg');
        }
    }

    // Handle remote URLs
    try {
        console.log(`📥 Downloading remote image: ${imageUrl}`);
        const response = await fetch(imageUrl);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64 = buffer.toString('base64');

        // Determine MIME type from URL or response headers
        const contentType = response.headers.get('content-type') || 'image/jpeg';

        return `data:${contentType};base64,${base64}`;
    } catch (error) {
        console.warn(`Failed to download remote image ${imageUrl}:`, error.message);
        // Fallback to default icon
        return await downloadImageAsBase64('/15KURRAO-icon.svg');
    }
}

// Configuration
const TALLY_API_KEY = process.env.TALLY_API_KEY || 'tly-2Q4ohp3cje3Hpnaq9afWFQDUGPFTDcz3';
const TALLY_FORM_ID = process.env.TALLY_FORM_ID || '3lkGj6';
const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'generated-images');

// Ensure output directory exists
async function ensureOutputDir() {
    try {
        await fs.access(OUTPUT_DIR);
    } catch {
        await fs.mkdir(OUTPUT_DIR, { recursive: true });
        console.log(`Created output directory: ${OUTPUT_DIR}`);
    }
}

// Fetch all runners from Tally API
async function fetchAllRunners() {
    let allSubmissions = [];
    let page = 1;
    let hasMore = true;

    try {
        while (hasMore) {
            const url = `https://api.tally.so/forms/${TALLY_FORM_ID}/submissions?page=${page}`;

            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${TALLY_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            allSubmissions = [...allSubmissions, ...data.submissions];
            hasMore = data.hasMore;
            page++;

            console.log(`📄 Fetched page ${page - 1}, total submissions so far: ${allSubmissions.length}`);
        }

        return processRunnerData({ data: allSubmissions });
    } catch (error) {
        console.error('Error fetching runners:', error);
        throw error;
    }
}

// Helper function to convert text to title case
function toTitleCase(str) {
    if (!str) return '';
    return str
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

// Process raw Tally data into runner format
function processRunnerData(tallyData) {
    const runners = [];

    if (!tallyData.data || !Array.isArray(tallyData.data)) {
        console.warn('No runner data found');
        return runners;
    }

    tallyData.data.forEach((submission, index) => {
        if (!submission.responses) return;

        // Extract field values using correct question IDs from the API response
        const rawName = submission.responses.find(r => r.questionId === '8LvzBA')?.answer || '';
        const rawLastName = submission.responses.find(r => r.questionId === '08279Z')?.answer || '';
        const rawSecondLastName = submission.responses.find(r => r.questionId === 'RoXdNl')?.answer || '';

        // Apply title case formatting to names
        const name = toTitleCase(rawName);
        const lastName = toTitleCase(rawLastName);
        const secondLastName = toTitleCase(rawSecondLastName);
        const distance = submission.responses.find(r => r.questionId === 'OXpl2K')?.answer?.[0] || '10K';
        const gender = submission.responses.find(r => r.questionId === 'VPRjea')?.answer?.[0] || 'Masculino';
        const photoUpload = submission.responses.find(r => r.questionId === 'N74EQB')?.answer?.[0];

        // Debug logging
        if (photoUpload) {
        }

        // Get photo URL if available, otherwise use default avatar
        let avatar = '/card-welcome.jpeg'; // Default avatar
        if (photoUpload && photoUpload.url) {
            avatar = photoUpload.url;
        } else {
        }
        // Full name (first name + first letter of last name)
        const fullName = `${name} ${lastName ? lastName.charAt(0).toUpperCase() + '.' : ''}`.trim();

        // Only include runners with names
        if (fullName.trim()) {
            const runner = {
                id: index + 1,
                name: fullName,
                distance: distance,
                location: 'Urrao, Antioquia', // Default location
                gender: gender,
                avatar: avatar,
                registrationTime: submission.submittedAt || submission.createdAt || new Date().toISOString()
            };
            console.log('Runner:', runner);
            runners.push(runner);
        }
    });

    return runners;
}

// Generate HTML template for story image
async function generateStoryHTML(runner, backgroundImage = null, runnerImageBase64 = null, fontBase64 = null) {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Story - ${runner.name}</title>
    <style>
        @font-face {
            font-family: "nova";
            src: url("${fontBase64 || '../public/fonts/nova.woff'}") format("woff");
            font-weight: normal;
            font-style: normal;
        }
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 0;
        }
        
        .story-container {
            width: 720px;
            height: 1280px;
            background: ${backgroundImage ? `url('${backgroundImage}')` : 'linear-gradient(135deg, #4A90E2 0%, #7ED321 100%)'};
            background-size: cover;
            background-position: center;
            background-repeat: no-repeat;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: flex-start;
            padding: 60px 40px;
            box-sizing: border-box;
            position: relative;
            overflow: hidden;
        }
        
        .story-container::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: 
                radial-gradient(circle at 20% 20%, rgba(255,255,255,0.1) 0%, transparent 50%),
                radial-gradient(circle at 80% 80%, rgba(255,255,255,0.1) 0%, transparent 50%),
                linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.05) 50%, transparent 70%);
            z-index: 1;
        }
        
        .runner-card {
            width: 100%;
            max-width: 520px;
            height: auto;
            box-shadow: 0 15px 30px rgba(0, 0, 0, 0.3);
            overflow: hidden;
            margin-top: 150px;
            margin-bottom: 40px;
        }
        
        .image-section {
            position: relative;
            aspect-ratio: 4/5;
            overflow: hidden;
        }
        
        .runner-image {
            width: 100%;
            height: 100%;
            object-fit: cover;
            object-position: top;
        }
        
        .distance-badge {
            position: absolute;
            top: 12px;
            right: 12px;
            padding: 8px 12px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: bold;
            font-family: nova, sans-serif;
            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
            color: white;
        }
        
        .distance-15k {
            background: linear-gradient(to right, #0b75b9, #0369a1);
        }
        
        .distance-10k {
            background: linear-gradient(to right, #f97316, #ea580c);
        }
        
        .content-section {
            padding: 16px;
        }
        
        .runner-name {
            color: white;
            font-size: 40px;
            font-weight: 600;
            line-height: 1.2;
            margin-bottom: 20px;
            font-family: 'nova', sans-serif;
        }
        
        .welcome-message {
            color: #FFF;
            font-size: 35px;
            margin-bottom: 12px;
        }
        
        .registration-status {
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
        
        .status-left {
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .status-dot {
            width: 8px;
            height: 8px;
            background: #10b981;
            border-radius: 50%;
        }
        
        .status-text {
            color: #10b981;
            font-size: 12px;
            font-weight: 500;
        }
        
        .event-date {
            color: #cbd5e1;
            font-size: 12px;
        }
        
        .branding {
            position: absolute;
            top: 80px;
            left: 50%;
            transform: translateX(-50%);
            text-align: center;
            color: white;
            z-index: 10;
        }
        
    </style>
</head>
<body>
    <div class="story-container">
        <!-- Runner Card -->
        <div class="runner-card">
            <div class="image-section">
                <img src="${runnerImageBase64 || runner.avatar}" alt="${runner.name}" class="runner-image" />
                <div class="distance-badge ${runner.distance === '15K' ? 'distance-15k' : 'distance-10k'}">
                    ${runner.distance}
                </div>
            </div>
        </div>

        <h3 class="runner-name">${runner.name}</h3>
                
        <p class="welcome-message">
            ${runner.gender === 'Masculino' ? 'Bienvenido' : 'Bienvenida'} a la carrera
        </p>
    </div>
</body>
</html>`;
}

// Generate story image for a single runner
async function generateStoryImage(browser, runner, index, total, backgroundImage = null, fontBase64 = null) {
    const page = await browser.newPage();

    try {
        console.log(`[${index + 1}/${total}] Generating image for: ${runner.name}`);

        // Download runner's avatar image as base64
        console.log(`📥 Downloading avatar for ${runner.name}...`);
        const runnerImageBase64 = await downloadImageAsBase64(runner.avatar);

        // Set viewport for story dimensions
        await page.setViewport({
            width: 720,
            height: 1280,
            deviceScaleFactor: 1
        });

        // Generate HTML content
        const html = await generateStoryHTML(runner, backgroundImage, runnerImageBase64, fontBase64);

        // Set content
        await page.setContent(html, {
            waitUntil: 'networkidle0',
            timeout: 30000
        });

        // Wait for images to load
        await page.evaluate(() => {
            return new Promise((resolve) => {
                const images = Array.from(document.images);
                if (images.length === 0) {
                    resolve();
                    return;
                }

                let loadedCount = 0;
                const checkAllLoaded = () => {
                    loadedCount++;
                    if (loadedCount === images.length) {
                        resolve();
                    }
                };

                images.forEach(img => {
                    if (img.complete) {
                        checkAllLoaded();
                    } else {
                        img.addEventListener('load', checkAllLoaded);
                        img.addEventListener('error', checkAllLoaded);
                    }
                });

                // Fallback timeout
                setTimeout(resolve, 5000);
            });
        });

        // Take screenshot
        const filename = `story-${runner.id}-${Date.now()}.jpg`;
        const filepath = path.join(OUTPUT_DIR, filename);

        await page.screenshot({
            path: filepath,
            type: 'jpeg',
            quality: 85,
            fullPage: false
        });

        console.log(`✅ Generated: ${filename}`);
        return { runner, filename, filepath };

    } catch (error) {
        console.error(`❌ Error generating image for ${runner.name}:`, error);
        return { runner, error: error.message };
    } finally {
        await page.close();
    }
}

// Main function
async function main() {
    console.log('🚀 Starting runner story generation...');

    try {
        // Ensure output directory exists
        await ensureOutputDir();

        // Fetch all runners
        console.log('📡 Fetching runner data from Tally...');
        const runners = await fetchAllRunners();

        if (runners.length === 0) {
            console.log('❌ No runners found');
            return;
        }

        console.log(`📊 Found ${runners.length} runners`);

        // Load background image
        console.log('🖼️  Loading background image...');
        const backgroundImage = await getBackgroundImageBase64();
        if (backgroundImage) {
            console.log('✅ Background image loaded successfully');
        } else {
            console.log('⚠️  Background image not found, using gradient only');
        }

        // Load font
        console.log('🔤 Loading nova font...');
        const fontBase64 = await getFontBase64();
        if (fontBase64) {
            console.log('✅ Nova font loaded successfully');
        } else {
            console.log('⚠️  Nova font not found, using fallback');
        }

        // Launch browser
        console.log('🌐 Launching browser...');
        const browser = await puppeteer.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-web-security',
                '--allow-running-insecure-content'
            ]
        });

        // Generate images for all runners
        const results = [];

        // Process in batches to avoid overwhelming the system
        const batchSize = 5;
        for (let i = 0; i < runners.length; i += batchSize) {
            const batch = runners.slice(i, i + batchSize);
            const batchPromises = batch.map((runner, batchIndex) =>
                generateStoryImage(browser, runner, i + batchIndex, runners.length, backgroundImage, fontBase64)
            );

            const batchResults = await Promise.all(batchPromises);
            results.push(...batchResults);

            // Small delay between batches
            if (i + batchSize < runners.length) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }

        await browser.close();

        // Generate mapping file
        const mapping = {
            generatedAt: new Date().toISOString(),
            totalRunners: runners.length,
            successfulGenerations: results.filter(r => !r.error).length,
            failedGenerations: results.filter(r => r.error).length,
            results: results.map(r => ({
                runnerId: r.runner.id,
                runnerName: r.runner.name,
                filename: r.filename || null,
                error: r.error || null
            }))
        };

        const mappingPath = path.join(OUTPUT_DIR, 'story-mapping.json');
        await fs.writeFile(mappingPath, JSON.stringify(mapping, null, 2));

        // Summary
        console.log('\n📈 Generation Summary:');
        console.log(`✅ Successful: ${mapping.successfulGenerations}`);
        console.log(`❌ Failed: ${mapping.failedGenerations}`);
        console.log(`📁 Images saved to: ${OUTPUT_DIR}`);
        console.log(`📄 Mapping saved to: ${mappingPath}`);

    } catch (error) {
        console.error('💥 Fatal error:', error);
        process.exit(1);
    }
}

// Handle command line arguments
const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Usage: node generate-runner-stories.js [options]

Options:
  --help, -h     Show this help message

Environment Variables:
  TALLY_API_KEY  Your Tally API key (default: tly-2Q4ohp3cje3Hpnaq9afWFQDUGPFTDcz3)
  TALLY_FORM_ID  Your Tally form ID (default: 3lkGj6)

Examples:
  node generate-runner-stories.js
  TALLY_API_KEY=your-key node generate-runner-stories.js
`);
    process.exit(0);
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}

export { main, generateStoryHTML, fetchAllRunners, getBackgroundImageBase64, downloadImageAsBase64, getFontBase64 };
