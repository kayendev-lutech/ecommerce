import { $delete, $get, $post, $put } from '@/api'
import { CATEGORY_ENDPOINT } from '@/api/constants'

export async function apiGetCategories(params?: Record<string, any>) {
    return $get(`${CATEGORY_ENDPOINT}`, { params }).then((resp) => resp.data)
}

export async function apiCreateCategory(payload: any) {
    return $post(`${CATEGORY_ENDPOINT}`, payload).then((resp) => resp.data)
}

export async function apiGetCategory(id: string | number) {
    return $get(`${CATEGORY_ENDPOINT}/${id}`).then((resp) => resp.data)
}

export async function apiUpdateCategory(id: string | number, payload: any) {
    return $put(`${CATEGORY_ENDPOINT}/${id}`, payload).then((resp) => resp.data)
}

export async function apiDeleteCategory(id: string | number) {
    return $delete(`${CATEGORY_ENDPOINT}/${id}`).then((resp) => resp.data)
}
