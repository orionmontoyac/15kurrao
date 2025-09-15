# Runner Story Image Generator

This script generates custom story images for each runner registered in the 15K URRAO event.

## Features

- Fetches all runner data from Tally API
- Generates Instagram/WhatsApp story-sized images (720x1280px)
- Uses the same HTML template as the frontend `createStoryCanvas` function
- Saves images to `public/generated-images/` folder
- Creates a mapping file for tracking generated images

## Usage

### Basic Usage

```bash
# Using npm script
npm run generate-stories

# Or directly with node
node scripts/generate-runner-stories.js
```

### With Custom Environment Variables

```bash
# Set custom Tally credentials
TALLY_API_KEY=your-api-key TALLY_FORM_ID=your-form-id npm run generate-stories
```

### Help

```bash
node scripts/generate-runner-stories.js --help
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `TALLY_API_KEY` | `tly-2Q4ohp3cje3Hpnaq9afWFQDUGPFTDcz3` | Your Tally API key |
| `TALLY_FORM_ID` | `3lkGj6` | Your Tally form ID |

## Output

The script generates:

1. **Story Images**: Individual JPEG images for each runner
   - Format: `story-{runnerId}-{timestamp}.jpg`
   - Size: 720x1280px (Instagram Stories format)
   - Quality: 85% JPEG compression

2. **Mapping File**: `story-mapping.json` containing:
   - Generation metadata
   - Success/failure counts
   - Mapping of runners to generated files

## Image Template

The generated images include:

- **Background**: Welcome runners image with gradient overlay
- **Branding**: "15K URRAO - Cuerpo y mente" at the top
- **Runner Card**: 
  - Runner photo (if available, otherwise default icon)
  - Distance badge (10K or 15K)
  - Runner name
  - Welcome message (gender-aware)
  - Registration status
  - Event date

## Technical Details

- **Engine**: Puppeteer (headless Chrome)
- **Batch Processing**: Processes 5 runners at a time to avoid overwhelming the system
- **Error Handling**: Continues processing even if individual images fail
- **Timeout**: 30 second timeout per image generation
- **Image Loading**: Waits for all images to load before screenshot

## Troubleshooting

### Common Issues

1. **Puppeteer installation issues**:
   ```bash
   npm install puppeteer --force
   ```

2. **Permission errors**:
   ```bash
   chmod +x scripts/generate-runner-stories.js
   ```

3. **API rate limits**: The script includes delays between batches

### Debugging

Add debug logs by modifying the script or check the console output for detailed error messages.
