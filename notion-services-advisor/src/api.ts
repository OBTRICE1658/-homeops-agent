const API_BASE = '/api'

interface RequestOptions {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  headers?: Record<string, string>
  body?: any
}

async function fetchAPI(endpoint: string, options: RequestOptions = { method: 'GET' }) {
  const url = `${API_BASE}${endpoint}`
  
  const config: RequestInit = {
    method: options.method,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  }

  if (options.body) {
    config.body = JSON.stringify(options.body)
  }

  const response = await fetch(url, config)
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => null)
    throw new Error(errorData?.error || `HTTP ${response.status}: ${response.statusText}`)
  }

  return response.json()
}

export const api = {
  // Generate a plan
  generatePlan: (request: any) => 
    fetchAPI('/advisor/plan', { method: 'POST', body: request }),

  // Validate a plan
  validatePlan: (plan: any) => 
    fetchAPI('/validation/plan', { method: 'POST', body: plan }),

  // Recompute ROI
  recomputeROI: (request: any) => 
    fetchAPI('/roi/recompute', { method: 'POST', body: request }),

  // Generate exports
  generateExports: (plan: any) => 
    fetchAPI('/exports/all', { method: 'POST', body: plan }),

  // Create Notion databases (stub)
  createNotionDatabases: (request: any) => 
    fetchAPI('/notion/create-databases', { method: 'POST', body: request }),

  // Generate one-pager
  generateOnePager: (request: any) => 
    fetchAPI('/reco/onepager', { method: 'POST', body: request }),
}
