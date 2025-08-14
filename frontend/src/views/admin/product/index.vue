<script setup lang="ts">
import ProductTable from '@/components/product/ProductTable.vue'
import { useProducts } from '@/composables/useProducts'
import router, { RoutePath } from '@/router'

const {
    products,
    totalItems,
    totalPages,
    tablePagination,
    searchTerm,
    sortBy,
    order,
    isFetching,
    refetch
} = useProducts()

const handleAction = async (action: string, productId: number) => {
    if (action === 'delete') {
        if (confirm(`Are you sure you want to delete product with ID ${productId}?`)) {
            // Call delete API then refetch
            refetch()
        }
    } else if (action === 'edit') {
        await router.push(`${RoutePath.AdminProductEdit}/${productId}`)
    }
}

const handleSearch = (value: string) => {
    searchTerm.value = value
    // Reset to first page when searching
    tablePagination.value.pageIndex = 0
}

const handleSort = (sortByValue: string, orderValue: 'ASC' | 'DESC') => {
    sortBy.value = sortByValue
    order.value = orderValue
}

const handlePagination = (pagination: any) => {
    tablePagination.value = pagination
}
</script>

<template>
    <div class="flex min-h-screen flex-col gap-6 p-6">
        <ProductTable
            :products="products"
            :loading="isFetching"
            :search-term="searchTerm"
            :total-items="totalItems"
            :total-pages="totalPages"
            :pagination="tablePagination"
            @update:pagination="handlePagination"
            @update:search="handleSearch"
            @update:sort="handleSort"
            @action="handleAction"
        />
    </div>
</template>
