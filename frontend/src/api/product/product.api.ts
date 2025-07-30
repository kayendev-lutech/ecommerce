import { $delete, $get, $post, $put } from '@/api'
import { PRODUCT_ENDPOINT } from '@/api/constants'

export async function apiGetProducts(params?: Record<string, any>) {
    return $get(`${PRODUCT_ENDPOINT}`, { params }).then((resp) => resp.data)
}

export async function apiCreateProduct(payload: any) {
    return $post(`${PRODUCT_ENDPOINT}`, payload).then((resp) => resp.data)
}

export async function apiGetProduct(id: string | number) {
    return $get(`${PRODUCT_ENDPOINT}/${id}`).then((resp) => resp.data)
}

export async function apiUpdateProduct(id: string | number, payload: any) {
    return $put(`${PRODUCT_ENDPOINT}/${id}`, payload).then((resp) => resp.data)
}

export async function apiDeleteProduct(id: string | number) {
    return $delete(`${PRODUCT_ENDPOINT}/${id}`).then((resp) => resp.data)
}
