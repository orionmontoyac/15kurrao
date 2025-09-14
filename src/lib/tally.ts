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
  limit: number;
  hasMore: boolean;
  totalNumberOfSubmissionsPerFilter: {
    all: number;
    completed: number;
    partial: number;
  };
  questions: TallyQuestion[];
  submissions: TallySubmission[];
}

export class TallyAPI {
  private apiKey: string;
  private baseUrl = 'https://api.tally.so';

  constructor() {
    this.apiKey = import.meta.env.TALLY_API_KEY;
    if (!this.apiKey) {
      throw new Error('TALLY_API_KEY environment variable is required');
    }
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`Tally API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async getFormSubmissions(formId: string, page: number = 1, limit: number = 50): Promise<TallyApiResponse> {
    console.log('Getting form submissions for formId:', formId, 'page:', page);
    const endpoint = `/forms/${formId}/submissions?page=${page}`;
    return this.makeRequest(endpoint);
  }

  async getAllSubmissions(formId: string): Promise<TallySubmission[]> {
    let allSubmissions: TallySubmission[] = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const response = await this.getFormSubmissions(formId, page, 50);
      allSubmissions = [...allSubmissions, ...response.submissions];
      hasMore = response.hasMore;
      page++;
    }

    return allSubmissions;
  }

  async getSubmissionById(formId: string, submissionId: string): Promise<TallySubmission | null> {
    try {
      const endpoint = `/forms/${formId}/submissions/${submissionId}`;
      return await this.makeRequest(endpoint);
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
}

// Export a singleton instance
export const tallyAPI = new TallyAPI();

// Export types for use in other files
export type { TallySubmission, TallyResponse, TallyQuestion, TallyApiResponse };







