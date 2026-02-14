/**
 * Utility functions for making authenticated API requests with JWT token
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface ApiRequestOptions extends RequestInit {
  withoutAuth?: boolean;
}

/**
 * Make an authenticated API request with JWT token
 */
export async function authenticatedFetch(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<Response> {
  const { withoutAuth = false, ...fetchOptions } = options;

  // Build headers object
  const headers: HeadersInit = new Headers(
    fetchOptions.headers instanceof Headers 
      ? fetchOptions.headers 
      : (typeof fetchOptions.headers === 'object' ? fetchOptions.headers : {})
  );

  // Ensure Content-Type is set
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  // Add authorization header if not explicitly disabled
  if (!withoutAuth) {
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    if (!token) {
      throw new Error('No authentication token found. Please login first.');
    }
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...fetchOptions,
    headers,
  });

  // Handle 401 Unauthorized - token might be expired
  if (response.status === 401) {
    // Clear stored auth data
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
      localStorage.removeItem('teamId');
      localStorage.removeItem('teamName');
      
      // Redirect to login
      window.location.href = '/';
    }
    
    throw new Error('Authentication failed. Please login again.');
  }

  return response;
}

/**
 * GET request with authentication
 */
export async function apiGet<T>(endpoint: string): Promise<T> {
  const response = await authenticatedFetch(endpoint);
  
  if (!response.ok) {
    let error: any = { error: response.statusText };
    try {
      error = await response.json();
    } catch {
      // Response is not JSON
    }
    throw new Error(error.error || `API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

/**
 * POST request with authentication
 */
export async function apiPost<T>(endpoint: string, data: any): Promise<T> {
  const response = await authenticatedFetch(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    let error: any = { error: response.statusText };
    try {
      error = await response.json();
    } catch {
      // Response is not JSON
    }
    throw new Error(error.error || `API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

/**
 * Login endpoint (without authentication)
 */
export async function login(teamId: string, teamName: string): Promise<{ token: string; teamId: string; teamName: string }> {
  const response = await authenticatedFetch('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ teamId, teamName }),
    withoutAuth: true,
  });

  if (!response.ok) {
    let error: any = { error: 'Login failed' };
    try {
      error = await response.json();
    } catch {
      // Response is not JSON
    }
    throw new Error(error.error || `Login failed: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  
  if (!data.token || !data.teamId || !data.teamName) {
    throw new Error('Server returned incomplete authentication data');
  }

  return data;
}
