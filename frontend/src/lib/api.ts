import { Survey, SurveyResponse, SurveyResults } from '@/types/survey';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function getActiveSurveys(): Promise<Survey[]> {
  const response = await fetch(`${API_BASE_URL}/surveys/active`);
  if (!response.ok) {
    throw new Error('Failed to fetch surveys');
  }
  return response.json();
}

export async function getSurveyById(id: string): Promise<Survey> {
  const response = await fetch(`${API_BASE_URL}/surveys/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch survey');
  }
  return response.json();
}

export async function submitSurveyResponse(response: SurveyResponse): Promise<void> {
  const surveyResponse = await fetch(`${API_BASE_URL}/surveys/${response.surveyId}/submit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(response),
  });

  if (!surveyResponse.ok) {
    throw new Error('Failed to submit survey response');
  }
}

export async function getSurveyResults(id: string): Promise<SurveyResults> {
  const response = await fetch(`${API_BASE_URL}/surveys/${id}/results`);
  if (!response.ok) {
    throw new Error('Failed to fetch survey results');
  }
  return response.json();
}
