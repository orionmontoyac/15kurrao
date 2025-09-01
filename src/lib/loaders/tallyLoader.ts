import { tallyAPI, type TallySubmission } from '../tally-cached';

export interface TallyLoaderOptions {
  formId?: string;
  page?: number;
  limit?: number;
  getAll?: boolean;
  useCache?: boolean;
}

export interface TallyLoaderResult {
  submissions: TallySubmission[];
  totalCount: number;
  completedCount: number;
  partialCount: number;
  hasMore: boolean;
  page: number;
  limit: number;
}

export async function loadTallySubmissions(options: TallyLoaderOptions = {}): Promise<TallyLoaderResult> {
  const {
    formId = import.meta.env.TALLY_FORM_ID || '3lkGj6',
    page = 1,
    limit = 50,
    getAll = false,
    useCache = true
  } = options;

  try {
    if (getAll) {
      // Fetch all submissions across all pages
      console.log('Fetching all submissions');
      const allSubmissions = await tallyAPI.getAllSubmissions(formId, useCache);
      console.log('All submissions fetched');
      // Get the first page response to get metadata
      const firstPageResponse = await tallyAPI.getFormSubmissions(formId, 1, 1, useCache);
      
      return {
        submissions: allSubmissions,
        totalCount: firstPageResponse.totalNumberOfSubmissionsPerFilter.all,
        completedCount: firstPageResponse.totalNumberOfSubmissionsPerFilter.completed,
        partialCount: firstPageResponse.totalNumberOfSubmissionsPerFilter.partial,
        hasMore: false, // We fetched all
        page: 1,
        limit: allSubmissions.length
      };
    } else {
      // Fetch a specific page
      const response = await tallyAPI.getFormSubmissions(formId, page, limit, useCache);
      
      return {
        submissions: response.submissions,
        totalCount: response.totalNumberOfSubmissionsPerFilter.all,
        completedCount: response.totalNumberOfSubmissionsPerFilter.completed,
        partialCount: response.totalNumberOfSubmissionsPerFilter.partial,
        hasMore: response.hasMore,
        page: response.page,
        limit: limit
      };
    }
  } catch (error) {
    console.error('Error loading Tally submissions:', error);
    throw new Error(`Failed to load Tally submissions: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Helper function to get submissions filtered by a specific field value
export async function loadTallySubmissionsByField(
  questionId: string, 
  value: any, 
  options: TallyLoaderOptions = {}
): Promise<TallyLoaderResult> {
  const allData = await loadTallySubmissions({ ...options, getAll: true });
  
  const filteredSubmissions = tallyAPI.getSubmissionsByFieldValue(
    allData.submissions, 
    questionId, 
    value
  );

  return {
    ...allData,
    submissions: filteredSubmissions,
    totalCount: filteredSubmissions.length,
    completedCount: filteredSubmissions.filter(s => s.isCompleted).length,
    partialCount: filteredSubmissions.filter(s => !s.isCompleted).length,
    hasMore: false
  };
}

// Helper function to get submissions by distance (10K or 15K)
export async function loadTallySubmissionsByDistance(
  distance: '10K' | '15K', 
  options: TallyLoaderOptions = {}
): Promise<TallyLoaderResult> {
  // Question ID for distance field from the API response
  const distanceQuestionId = 'OXpl2K';
  return loadTallySubmissionsByField(distanceQuestionId, distance, options);
}

// Helper function to get submissions by gender
export async function loadTallySubmissionsByGender(
  gender: 'Masculino' | 'Femenino', 
  options: TallyLoaderOptions = {}
): Promise<TallyLoaderResult> {
  // Question ID for gender field from the API response
  const genderQuestionId = 'VPRjea';
  return loadTallySubmissionsByField(genderQuestionId, gender, options);
}

// Helper function to get statistics
export async function getTallyStatistics(options: TallyLoaderOptions = {}): Promise<{
  totalSubmissions: number;
  completedSubmissions: number;
  partialSubmissions: number;
  byDistance: { '10K': number; '15K': number };
  byGender: { 'Masculino': number; 'Femenino': number };
}> {
  const allData = await loadTallySubmissions({ ...options, getAll: true });
  
  const distanceQuestionId = 'OXpl2K';
  const genderQuestionId = 'VPRjea';
  
  const tenKSubmissions = tallyAPI.getSubmissionsByFieldValue(allData.submissions, distanceQuestionId, '10K');
  const fifteenKSubmissions = tallyAPI.getSubmissionsByFieldValue(allData.submissions, distanceQuestionId, '15K');
  
  const maleSubmissions = tallyAPI.getSubmissionsByFieldValue(allData.submissions, genderQuestionId, 'Masculino');
  const femaleSubmissions = tallyAPI.getSubmissionsByFieldValue(allData.submissions, genderQuestionId, 'Femenino');
  
  return {
    totalSubmissions: allData.totalCount,
    completedSubmissions: allData.completedCount,
    partialSubmissions: allData.partialCount,
    byDistance: {
      '10K': tenKSubmissions.length,
      '15K': fifteenKSubmissions.length
    },
    byGender: {
      'Masculino': maleSubmissions.length,
      'Femenino': femaleSubmissions.length
    }
  };
}
