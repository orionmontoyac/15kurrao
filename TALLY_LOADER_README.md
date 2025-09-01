# Tally API Loader for Astro

This project includes a custom loader for the Tally API that allows you to fetch form submissions and display them in your Astro pages.

## Setup

### 1. Environment Variables

Create a `.env` file in your project root with the following variables:

```env
TALLY_API_KEY=tly-2Q4ohp3cje3Hpnaq9afWFQDUGPFTDcz3
TALLY_FORM_ID=3lkGj6
```

### 2. Files Created

- `src/lib/tally.ts` - Core Tally API client
- `src/lib/loaders/tallyLoader.ts` - Data loader functions
- `src/pages/api/tally.json.ts` - API endpoint for client-side access
- `src/components/TallyStats.astro` - Reusable statistics component
- `src/pages/inscripciones.astro` - Example page using the loader

## Usage

### Basic Usage in Astro Pages

```astro
---
import { loadTallySubmissions, getTallyStatistics } from '../lib/loaders/tallyLoader';

// Load data
const submissions = await loadTallySubmissions({ page: 1, limit: 10 });
const statistics = await getTallyStatistics();
---

<div>
  <h1>Total Submissions: {statistics.totalSubmissions}</h1>
  <p>10K Runners: {statistics.byDistance['10K']}</p>
  <p>15K Runners: {statistics.byDistance['15K']}</p>
</div>
```

### Using the TallyStats Component

```astro
---
import TallyStats from '../components/TallyStats.astro';
---

<TallyStats showDetails={true} className="my-8" />
```

### API Endpoint

Access Tally data via the API endpoint:

- **Get submissions**: `/api/tally.json?page=1&limit=50`
- **Get statistics**: `/api/tally.json?type=statistics`
- **Get all submissions**: `/api/tally.json?getAll=true`

### Available Functions

#### `loadTallySubmissions(options)`

Fetches form submissions with pagination support.

```typescript
const submissions = await loadTallySubmissions({
  formId: '3lkGj6', // optional, defaults to env var
  page: 1,          // optional, defaults to 1
  limit: 50,        // optional, defaults to 50
  getAll: false     // optional, fetch all pages
});
```

#### `getTallyStatistics(options)`

Returns aggregated statistics about submissions.

```typescript
const stats = await getTallyStatistics();
// Returns: {
//   totalSubmissions: number,
//   completedSubmissions: number,
//   partialSubmissions: number,
//   byDistance: { '10K': number, '15K': number },
//   byGender: { 'Masculino': number, 'Femenino': number }
// }
```

#### `loadTallySubmissionsByDistance(distance, options)`

Filter submissions by distance (10K or 15K).

```typescript
const tenKSubmissions = await loadTallySubmissionsByDistance('10K');
const fifteenKSubmissions = await loadTallySubmissionsByDistance('15K');
```

#### `loadTallySubmissionsByGender(gender, options)`

Filter submissions by gender.

```typescript
const maleSubmissions = await loadTallySubmissionsByGender('Masculino');
const femaleSubmissions = await loadTallySubmissionsByGender('Femenino');
```

## Field Mapping

The loader uses the following question IDs from your Tally form:

- **Name**: `8LvzBA`
- **First Last Name**: `08279Z`
- **Second Last Name**: `RoXdNl`
- **ID Type**: `VzEByv`
- **ID Number**: `59647M`
- **Phone**: `d0LNMz`
- **Birth Date**: `YGER6q`
- **Email**: `DprK8b`
- **Blood Type**: `lOoqG5`
- **Gender**: `VPRjea`
- **Distance**: `OXpl2K`
- **Emergency Contact Name**: `oRrDP1`
- **Emergency Contact Phone**: `GpNKGj`
- **Clothing Gender**: `Z25arV`
- **Clothing Type**: `Z2GWKz`
- **Size**: `ExzrYN`
- **Photo Upload**: `N74EQB`

## Error Handling

The loader includes comprehensive error handling:

```typescript
try {
  const data = await loadTallySubmissions();
} catch (error) {
  console.error('Error loading Tally data:', error);
  // Handle error appropriately
}
```

## Caching

The API endpoint includes a 5-minute cache header to improve performance:

```typescript
'Cache-Control': 'public, max-age=300'
```

## Security

- API key is stored in environment variables
- API key is never exposed to the client
- All API calls are made server-side in Astro

## Example Implementation

See `src/pages/inscripciones.astro` for a complete example of how to use the Tally loader to display form submissions with statistics and a data table.

## Troubleshooting

1. **API Key Error**: Ensure `TALLY_API_KEY` is set in your `.env` file
2. **Form ID Error**: Ensure `TALLY_FORM_ID` is set in your `.env` file
3. **Network Errors**: Check your internet connection and Tally API status
4. **Rate Limiting**: The API includes built-in rate limiting handling

## API Reference

For more information about the Tally API, visit: https://docs.tally.so/
