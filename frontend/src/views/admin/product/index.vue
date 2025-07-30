<script setup lang="ts">
import { apiGetProducts } from '@/api/product/product.api'
import ProductTable from '@/components/ui/table/ProductTable.vue'
import router, { RoutePath } from '@/router'
import { onMounted, ref, watch } from 'vue'

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

const products = ref<Product[]>([])
const searchTerm = ref('')
const tablePagination = ref({
    pageIndex: 0,
    pageSize: 10
})
const totalItems = ref(0)

const fetchProducts = async () => {
    try {
        const resp = await apiGetProducts()
        products.value = resp.data || []
        console.log('Fetched products:', resp.data)
        totalItems.value = products.value.length
    } catch (error) {
        console.error('Failed to fetch products:', error)
        products.value = []
        totalItems.value = 0
    }
}

onMounted(fetchProducts)

const handleSearch = () => {
    console.log('Searching for:', searchTerm.value)
}

const handleAddProduct = () => {
    router.push(RoutePath.AdminProductSub1)
}

const handleAction = (action: string, productId: number) => {
    console.log(`Action "${action}" for product ID ${productId}`)
    // Implement actual logic for edit/delete/view here
    if (action === 'delete') {
        if (confirm(`Are you sure you want to delete product with ID ${productId}?`)) {
            // Call API to delete
            console.log(`Deleting product with ID ${productId}`)
            fetchProducts()
        }
    } else if (action === 'edit') {
        router.push(`${RoutePath.AdminProductSub2}/${productId}`)
    }
}

const goToPage = (page: number) => {
    tablePagination.value.pageIndex = page - 1
}

const updateItemsPerPage = (size: number) => {
    tablePagination.value.pageSize = size
    tablePagination.value.pageIndex = 0
}

watch(searchTerm, () => {})
</script>

<template>
    <div class="flex min-h-screen flex-col gap-6 bg-emerald-50 p-6">
        <ProductTable
            :products="products"
            :search-term="searchTerm"
            @update:pagination="tablePagination = $event"
            @action="handleAction"
        />
    </div>
</template>
