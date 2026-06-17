const API_BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')

const buildUrl = (path = '') => `${API_BASE_URL}/api/tasks${path}`

const request = async (path = '', options = {}) => {
  const response = await fetch(buildUrl(path), {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  })

  const contentType = response.headers.get('content-type') || ''
  const data = contentType.includes('application/json') ? await response.json() : null

  if (!response.ok) {
    throw new Error(data?.error || `Error HTTP ${response.status}`)
  }

  return data
}

export const tasksApi = {
  async list() {
    const data = await request()
    return data.tasks || []
  },

  async create(task) {
    const data = await request('', {
      method: 'POST',
      body: JSON.stringify(task)
    })
    return data.task
  },

  async update(id, task) {
    const data = await request(`/${id}`, {
      method: 'PUT',
      body: JSON.stringify(task)
    })
    return data.task
  },

  async updateStatus(id, completed) {
    const data = await request(`/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ completed })
    })
    return data.task
  },

  async remove(id) {
    const data = await request(`/${id}`, {
      method: 'DELETE'
    })
    return data.task
  }
}
