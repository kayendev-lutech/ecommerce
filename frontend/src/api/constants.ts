export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1'

export const API_TIMEOUT = 10000 // ms

// Auth endpoints
export const AUTH_LOGIN_ENDPOINT = '/auth/login'
export const AUTH_REGISTER_ENDPOINT = '/auth/register'
export const AUTH_LOGOUT_ENDPOINT = '/auth/logout'
export const AUTH_LOGOUT_ALL_ENDPOINT = '/logAllOut'
export const AUTH_REFRESH_ENDPOINT = '/auth/refresh'

// Category endpoints
export const CATEGORY_ENDPOINT = '/category'
export const CATEGORY_DETAIL_ENDPOINT = (id: string | number) => `/category/${id}`

// Product endpoints
export const PRODUCT_ENDPOINT = '/product'
export const PRODUCT_DETAIL_ENDPOINT = (id: string | number) => `/product/${id}`
