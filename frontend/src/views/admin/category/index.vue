<script setup lang="ts">
import CategoryTable from '@/components/category/CategoryTable.vue'
import { useCategory } from '@/composables/useCategory'
import router, { RoutePath } from '@/router'
import { useQueryClient } from '@tanstack/vue-query'

const queryClient = useQueryClient()

const { categories, totalItems, searchTerm, tablePagination, isLoading, isFetching } = useCategory()

const handleAddCategory = () => {
    router.push(RoutePath.AdminCategoryCreate)
}

const handleAction = (action: string, categoryId: number) => {
    if (action === 'delete') {
        if (confirm(`Are you sure you want to delete category ${categoryId}?`)) {
            console.log(`Simulating delete for category ${categoryId}`)
            queryClient.invalidateQueries({ queryKey: ['categories'] })
        }
    } else if (action === 'edit') {
        router.push(`${RoutePath.AdminCategoryEdit}/${categoryId}`)
    }
}
</script>

<template>
    <div class="flex min-h-screen flex-col gap-6 bg-emerald-50 p-6">
        <CategoryTable
            :categories="categories"
            :loading="isFetching"
            :search-term="searchTerm"
            @update:pagination="tablePagination = $event"
            @action="handleAction"
        />
    </div>
</template>
