export async function fetchJson(url: string, options: RequestInit = {}) {
  const headers: Record<string, string> = {};

  // Obtém token do localStorage
  const user = localStorage.getItem('user');
  if (user) {
    headers['Authorization'] = `Bearer ${JSON.parse(user).token}`;
  }

  // Só adiciona Content-Type se não for FormData
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(url, {
    headers: {
      ...headers,
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Erro na requisição');
  }
  return response.json();
}