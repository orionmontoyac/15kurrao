interface TallySubmission {
  id: string;
  formId: string;
  respondentId: string;
  isCompleted: boolean;
  submittedAt: string;
  createdAt: string;
  updatedAt: string;
  responses: TallyResponse[];
}

interface TallyResponse {
  id: string;
  formId: string;
  questionId: string;
  respondentId: string;
  submissionId: string;
  sessionUuid: string;
  answer: any;
  createdAt: string;
  updatedAt: string;
}

interface TallyQuestion {
  id: string;
  type: string;
  title: string;
  isTitleModifiedByUser: boolean;
  formId: string;
  isDeleted: boolean;
  numberOfResponses: number;
  createdAt: string;
  updatedAt: string;
  fields: any[];
}

interface TallyApiResponse {
  page: number;
  hasMore: boolean;
  totalNumberOfSubmissionsPerFilter: {
    all: number;
    completed: number;
    partial: number;
  };
  questions: TallyQuestion[];
  submissions: TallySubmission[];
}

interface CacheEntry {
  data: any;
  timestamp: number;
  expiresAt: number;
}

export class TallyAPI {
  private apiKey: string;
  private baseUrl = 'https://api.tally.so';
  private cache: Map<string, CacheEntry> = new Map();
  private cacheDuration: number = 5 * 60 * 1000; // 5 minutes in milliseconds

  constructor() {
    this.apiKey = import.meta.env.TALLY_API_KEY;
    if (!this.apiKey) {
      throw new Error('TALLY_API_KEY environment variable is required');
    }
  }

  private getCacheKey(endpoint: string): string {
    return `tally_${endpoint}`;
  }

  private isCacheValid(cacheEntry: CacheEntry): boolean {
    return Date.now() < cacheEntry.expiresAt;
  }

  private getFromCache(cacheKey: string): any | null {
    const cacheEntry = this.cache.get(cacheKey);
    if (cacheEntry && this.isCacheValid(cacheEntry)) {
      console.log(`Cache hit for: ${cacheKey}`);
      return cacheEntry.data;
    }
    
    if (cacheEntry) {
      console.log(`Cache expired for: ${cacheKey}`);
      this.cache.delete(cacheKey);
    }
    
    return null;
  }

  private setCache(cacheKey: string, data: any): void {
    const now = Date.now();
    const cacheEntry: CacheEntry = {
      data,
      timestamp: now,
      expiresAt: now + this.cacheDuration
    };
    
    this.cache.set(cacheKey, cacheEntry);
    console.log(`Cached data for: ${cacheKey} (expires in ${this.cacheDuration / 1000}s)`);
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}, useCache: boolean = true): Promise<any> {
    const cacheKey = this.getCacheKey(endpoint);
    
    // Check cache first
    if (useCache) {
      const cachedData = this.getFromCache(cacheKey);
      if (cachedData) {
        return cachedData;
      }
    }

    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      ...options.headers,
    };

    console.log(`Making API request to: ${url}`);

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`Tally API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Cache the response
    if (useCache) {
      this.setCache(cacheKey, data);
    }

    return data;
  }

  async getFormSubmissions(formId: string, page: number = 1, limit: number = 50, useCache: boolean = true): Promise<TallyApiResponse> {
    console.log('Getting form submissions for formId:', formId, 'page:', page);
    const endpoint = `/forms/${formId}/submissions?page=${page}`;
    return this.makeRequest(endpoint, {}, useCache);
  }

  async getAllSubmissions(formId: string, useCache: boolean = true): Promise<TallySubmission[]> {
    const cacheKey = this.getCacheKey(`all_submissions_${formId}`);
    
    // Check cache for all submissions
    if (useCache) {
      const cachedData = this.getFromCache(cacheKey);
      if (cachedData) {
        return cachedData;
      }
    }

    let allSubmissions: TallySubmission[] = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const response = await this.getFormSubmissions(formId, page, 50, useCache);
      allSubmissions = [...allSubmissions, ...response.submissions];
      hasMore = response.hasMore;
      page++;
    }

    // Cache all submissions
    if (useCache) {
      this.setCache(cacheKey, allSubmissions);
    }

    return allSubmissions;
  }

  async getSubmissionById(formId: string, submissionId: string, useCache: boolean = true): Promise<TallySubmission | null> {
    try {
      const endpoint = `/forms/${formId}/submissions/${submissionId}`;
      return await this.makeRequest(endpoint, {}, useCache);
    } catch (error) {
      console.error('Error fetching submission:', error);
      return null;
    }
  }

  // Helper method to extract specific field values from a submission
  getFieldValue(submission: TallySubmission, questionId: string): any {
    const response = submission.responses.find(r => r.questionId === questionId);
    return response?.answer || null;
  }

  // Helper method to get all submissions with a specific field value
  getSubmissionsByFieldValue(submissions: TallySubmission[], questionId: string, value: any): TallySubmission[] {
    return submissions.filter(submission => {
      const fieldValue = this.getFieldValue(submission, questionId);
      if (Array.isArray(fieldValue)) {
        return fieldValue.includes(value);
      }
      return fieldValue === value;
    });
  }

  // Cache management methods
  clearCache(): void {
    this.cache.clear();
    console.log('Cache cleared');
  }

  getCacheStats(): { size: number; entries: Array<{ key: string; expiresIn: number }> } {
    const now = Date.now();
    const entries = Array.from(this.cache.entries()).map(([key, entry]) => ({
      key,
      expiresIn: Math.max(0, entry.expiresAt - now)
    }));

    return {
      size: this.cache.size,
      entries
    };
  }

  setCacheDuration(durationMs: number): void {
    this.cacheDuration = durationMs;
    console.log(`Cache duration set to ${durationMs / 1000} seconds`);
  }
}

// Export a singleton instance
export const tallyAPI = new TallyAPI();

// Export types for use in other files
export type { TallySubmission, TallyResponse, TallyQuestion, TallyApiResponse };
