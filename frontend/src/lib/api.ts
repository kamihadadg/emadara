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

export interface CreateCommentDto {
  name?: string;
  message: string;
}

export interface CommentItem {
  id: string;
  name?: string;
  message: string;
  createdAt: string;
}

export async function getComments(limit = 20): Promise<CommentItem[]> {
  const response = await fetch(`${API_BASE_URL}/comments?limit=${limit}`);
  if (!response.ok) throw new Error('Failed to fetch comments');
  return response.json();
}

export async function createComment(dto: CreateCommentDto): Promise<CommentItem> {
  const res = await fetch(`${API_BASE_URL}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dto),
  });
  if (!res.ok) throw new Error('Failed to create comment');
  return res.json();
}

export async function getAdminComments(secret: string, limit = 100): Promise<CommentItem[]> {
  const res = await fetch(`${API_BASE_URL}/comments/admin?limit=${limit}`, {
    headers: { 'x-admin-secret': secret },
  });
  if (!res.ok) throw new Error('Failed to fetch admin comments');
  return res.json();
}

export async function getCommentCount(): Promise<number> {
  const res = await fetch(`${API_BASE_URL}/comments/count`);
  if (!res.ok) throw new Error('Failed to fetch comment count');
  const json = await res.json();
  return json.count ?? 0;
}
