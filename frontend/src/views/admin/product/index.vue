<script setup lang="ts">
import ProductTable from '@/components/product/ProductTable.vue'
import { useProducts } from '@/composables/useProducts'
import router, { RoutePath } from '@/router'

const { products, totalItems, searchTerm, tablePagination, isLoading, isFetching } = useProducts()

const handleAction = async (action: string, productId: number) => {
    if (action === 'delete') {
        if (confirm(`Are you sure you want to delete product with ID ${productId}?`)) {
            console.log(`Deleting product with ID ${productId}`)
        }
    } else if (action === 'edit') {
        await router.push(`${RoutePath.AdminProductEdit}/${productId}`)
    }
}
</script>

<template>
    <div class="flex min-h-screen flex-col gap-6 p-6">
        <!-- <input v-model="searchTerm" placeholder="Search products..." class="p-2 border rounded" /> -->

        <ProductTable
            :products="products"
            :loading="isFetching"
            :search-term="searchTerm"
            @update:pagination="tablePagination = $event"
            @action="handleAction"
        />
    </div>
</template>
