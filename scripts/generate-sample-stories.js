#!/usr/bin/env node

// Generate just 3 sample story images for testing
import { fetchAllRunners, generateStoryHTML, getBackgroundImageBase64, downloadImageAsBase64, getFontBase64 } from './generate-runner-stories.js';
import puppeteer from 'puppeteer';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'generated-images');

async function generateSampleImages() {
    console.log('🧪 Generating 3 sample story images...');
    
    try {
        // Fetch runners
        const runners = await fetchAllRunners();
        const sampleRunners = runners.slice(0, 3); // Take first 3 runners
        
        console.log(`📊 Using ${sampleRunners.length} sample runners`);
        
        // Load background image
        const backgroundImage = await getBackgroundImageBase64();
        console.log(backgroundImage ? '✅ Background loaded' : '⚠️  No background');
        
        // Load font
        const fontBase64 = await getFontBase64();
        console.log(fontBase64 ? '✅ Nova font loaded' : '⚠️  No nova font');
        
        // Launch browser
        const browser = await puppeteer.launch({ headless: true });
        
        // Generate images
        for (let i = 0; i < sampleRunners.length; i++) {
            const runner = sampleRunners[i];
            const page = await browser.newPage();
            
            console.log(`[${i + 1}/3] Generating: ${runner.name}`);
            
            // Download runner's avatar image
            const runnerImageBase64 = await downloadImageAsBase64(runner.avatar);
            
            await page.setViewport({ width: 720, height: 1280 });
            const html = await generateStoryHTML(runner, backgroundImage, runnerImageBase64, fontBase64);
            await page.setContent(html, { waitUntil: 'networkidle0' });
            
            const filename = `sample-story-${runner.id}-${Date.now()}.jpg`;
            const filepath = path.join(OUTPUT_DIR, filename);
            
            await page.screenshot({
                path: filepath,
                type: 'jpeg',
                quality: 100,
                fullPage: false
            });
            
            console.log(`✅ Generated: ${filename}`);
            await page.close();
        }
        
        await browser.close();
        console.log('\n🎉 Sample generation complete!');
        
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

generateSampleImages();
