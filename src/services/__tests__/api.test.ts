import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import MockAdapter from 'axios-mock-adapter'
import { useAuthStore } from '@/stores/auth.store'
import api from '../api'

let mock: MockAdapter

beforeEach(() => {
  mock = new MockAdapter(api)
  useAuthStore.setState({
    accessToken: null,
    isAuthenticated: false,
    user: null,
    isLoading: false,
  })
  delete (window as unknown as Record<string, unknown>).location
  ;(window as unknown as Record<string, unknown>).location = { href: '' } as unknown as Location
})

afterEach(() => {
  mock.restore()
  vi.restoreAllMocks()
})

describe('api request interceptor', () => {
  it('should add Authorization header when token exists', async () => {
    useAuthStore.getState().setAccessToken('test-token')
    mock.onGet('/test').reply(200, { ok: true })

    const response = await api.get('/test')

    expect(response.config.headers.Authorization).toBe('Bearer test-token')
  })

  it('should not add Authorization header when no token', async () => {
    mock.onGet('/test').reply(200, { ok: true })

    const response = await api.get('/test')

    expect(response.config.headers.Authorization).toBeUndefined()
  })
})

describe('api response interceptor', () => {
  it('should pass through successful responses', async () => {
    mock.onGet('/data').reply(200, { result: 'ok' })

    const response = await api.get('/data')

    expect(response.data).toEqual({ result: 'ok' })
  })

  it('should pass through non-401 errors', async () => {
    mock.onGet('/fail').reply(500)

    await expect(api.get('/fail')).rejects.toMatchObject({
      response: { status: 500 },
    })
  })

  it('should not attempt refresh for /auth/login 401', async () => {
    mock.onPost('/auth/login').reply(401, { message: 'Invalid credentials' })

    await expect(api.post('/auth/login', {})).rejects.toMatchObject({
      response: { status: 401 },
    })
  })

  it('should not attempt refresh for /auth/refresh 401', async () => {
    mock.onPost('/auth/refresh').reply(401)

    await expect(api.post('/auth/refresh')).rejects.toMatchObject({
      response: { status: 401 },
    })
  })

  it('should refresh token on 401 and retry the original request', async () => {
    useAuthStore.getState().setAccessToken('old-token')

    let callCount = 0
    mock.onGet('/protected').reply(() => {
      callCount++
      if (callCount === 1) return [401]
      return [200, { data: 'success' }]
    })
    mock
      .onPost('/auth/refresh')
      .reply(200, { accessToken: 'new-token' })

    const response = await api.get('/protected')

    expect(response.data).toEqual({ data: 'success' })
    expect(useAuthStore.getState().accessToken).toBe('new-token')
  })

  it('should reset auth and redirect to /login when refresh fails', async () => {
    useAuthStore.getState().setAccessToken('expired-token')

    mock.onGet('/protected').reply(401)
    mock.onPost('/auth/refresh').reply(401)

    await expect(api.get('/protected')).rejects.toMatchObject({
      response: { status: 401 },
    })

    expect(useAuthStore.getState().accessToken).toBeNull()
    expect(useAuthStore.getState().isAuthenticated).toBe(false)
    expect(window.location.href).toBe('/login')
  })

  it('should queue concurrent 401 requests and retry all after refresh', async () => {
    useAuthStore.getState().setAccessToken('old-token')

    const callCounts: Record<string, number> = {}
    mock.onGet(/\/resource\/\d/).reply((config) => {
      const url = config.url!
      callCounts[url] = (callCounts[url] ?? 0) + 1
      if (callCounts[url] === 1) return [401]
      return [200, { url }]
    })
    mock
      .onPost('/auth/refresh')
      .reply(200, { accessToken: 'fresh-token' })

    const [res1, res2, res3] = await Promise.all([
      api.get('/resource/1'),
      api.get('/resource/2'),
      api.get('/resource/3'),
    ])

    expect(res1.data).toEqual({ url: '/resource/1' })
    expect(res2.data).toEqual({ url: '/resource/2' })
    expect(res3.data).toEqual({ url: '/resource/3' })
    expect(useAuthStore.getState().accessToken).toBe('fresh-token')
  })
})
