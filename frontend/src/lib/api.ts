import { Survey, SurveyResponse, SurveyResults } from '@/types/survey';

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://192.168.1.112:8081';

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

// Admin API functions
export async function getAllUsers(): Promise<any[]> {
  const token = localStorage.getItem('auth_token');
  const response = await fetch(`${API_BASE_URL}/auth/admin/users`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error('Failed to fetch users');
  }
  return response.json();
}

export async function createUser(userData: any): Promise<any> {
  const token = localStorage.getItem('auth_token');
  const response = await fetch(`${API_BASE_URL}/auth/admin/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(userData),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create user');
  }
  return response.json();
}

export async function updateUser(userId: string, userData: any): Promise<any> {
  const token = localStorage.getItem('auth_token');
  const response = await fetch(`${API_BASE_URL}/auth/admin/users/${userId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(userData),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update user');
  }
  return response.json();
}

export async function deleteUser(userId: string): Promise<void> {
  const token = localStorage.getItem('auth_token');
  const response = await fetch(`${API_BASE_URL}/auth/admin/users/${userId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error('Failed to delete user');
  }
}


// Position management API functions
export async function getAllPositions(): Promise<any[]> {
  const token = localStorage.getItem('auth_token');
  const response = await fetch(`${API_BASE_URL}/auth/admin/positions`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error('Failed to fetch positions');
  }
  return response.json();
}

export async function createPosition(positionData: any): Promise<any> {
  const token = localStorage.getItem('auth_token');
  const response = await fetch(`${API_BASE_URL}/auth/admin/positions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(positionData),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create position');
  }
  return response.json();
}

export async function updatePosition(positionId: string, positionData: any): Promise<any> {
  const token = localStorage.getItem('auth_token');
  const response = await fetch(`${API_BASE_URL}/auth/admin/positions/${positionId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(positionData),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update position');
  }
  return response.json();
}

export async function updatePositionParent(positionId: string, parentPositionId: string | null): Promise<any> {
  const token = localStorage.getItem('auth_token');
  const response = await fetch(`${API_BASE_URL}/auth/admin/positions/${positionId}/parent`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ parentPositionId }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update position parent');
  }
  return response.json();
}

export async function updatePositionCoordinates(positionId: string, x: number | null, y: number | null): Promise<any> {
  const token = localStorage.getItem('auth_token');
  const response = await fetch(`${API_BASE_URL}/auth/admin/positions/${positionId}/coordinates`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ x, y }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update position coordinates');
  }
  return response.json();
}

export async function uploadProfileImage(file: File): Promise<any> {
  const token = localStorage.getItem('auth_token');
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/auth/upload/profile-image`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to upload profile image');
  }

  return response.json();
}

export async function getAllPositionsFlat(): Promise<any[]> {
  const token = localStorage.getItem('auth_token');
  const response = await fetch(`${API_BASE_URL}/auth/admin/positions/flat`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error('Failed to fetch positions');
  }
  return response.json();
}

export async function deletePosition(positionId: string): Promise<void> {
  const token = localStorage.getItem('auth_token');
  const response = await fetch(`${API_BASE_URL}/auth/admin/positions/${positionId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error('Failed to delete position');
  }
}

export async function getOrganizationalChart(): Promise<any[]> {
  const token = localStorage.getItem('auth_token');
  const response = await fetch(`${API_BASE_URL}/auth/admin/org-chart`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error('Failed to fetch organizational chart');
  }
  return response.json();
}
