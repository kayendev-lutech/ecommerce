import type { IBaseFilterRequest } from '.'

export interface Product {
    id: number
    thumbnail: string | null
    created_at: string
    updated_at: string
    deleted_at: string | null
    name: string
    slug: string
    description: string
    price: string
    discount_price: string | null
    currency_code: string
    category_id: number
    image_url: string | null
    is_active: boolean
    is_visible: boolean
    metadata: any
}

export interface FilterProductRequest extends IBaseFilterRequest {
    status?: string[]
}
