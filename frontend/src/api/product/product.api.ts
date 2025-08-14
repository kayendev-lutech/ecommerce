import { $delete, $get, $post, $put } from '@/api'
import { PRODUCT_ENDPOINT } from '@/api/constants'

export async function apiGetProducts(params?: {
    page?: number
    limit?: number
    search?: string
    order?: 'ASC' | 'DESC'
    sortBy?: string
    category_id?: number
}) {
    const cleanParams = { ...params }
    if (!cleanParams.search || cleanParams.search.length < 1) {
        delete cleanParams.search
    }

    return $get(`${PRODUCT_ENDPOINT}`, { params: cleanParams }).then((resp) => resp.data)
}

export async function apiCreateProduct(payload: any) {
    console.log('API Call - Create Product:', payload)
    return $post(PRODUCT_ENDPOINT, payload).then((resp) => resp.data)
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
export async function apiUploadProductImage(id: string | number, file: File) {
    const formData = new FormData()
    formData.append('image', file)
    return $post(`${PRODUCT_ENDPOINT}/${id}/upload-image`, formData).then((resp) => resp.data)
}
