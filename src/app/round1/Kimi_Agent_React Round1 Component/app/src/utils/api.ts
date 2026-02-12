// Mock API utility for the CTF game
// In production, this would make actual HTTP requests

export async function apiGet<T>(_url: string): Promise<T> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Mock response for team data
  if (_url.includes('/api/team/')) {
    return {
      switchValues: {
        S0: Math.random() > 0.5 ? 1 : 0,
        S1: Math.random() > 0.5 ? 1 : 0,
        S2: Math.random() > 0.5 ? 1 : 0,
        S3: Math.random() > 0.5 ? 1 : 0,
      }
    } as T;
  }
  
  throw new Error('Unknown endpoint');
}

export async function apiPost<T>(_url: string, _data: unknown): Promise<T> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  await new Promise(resolve => setTimeout(resolve, 500));
  return {} as T;
}
