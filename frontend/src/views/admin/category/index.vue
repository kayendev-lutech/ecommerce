<script setup lang="ts">
import { apiGetCategories } from '@/api/category/category.api'
import CategoryTable from '@/components/ui/table/CategoryTable.vue'
import router, { RoutePath } from '@/router'
import { onMounted, ref, watch } from 'vue'

interface Category {
    id: number
    name: string
    description: string
    thumbnail: string
    created_at: string
    updated_at: string
}

const categories = ref<Category[]>([])
const searchTerm = ref('')
const tablePagination = ref({
    pageIndex: 0,
    pageSize: 10
})
const totalItems = ref(0)

const fetchCategories = async () => {
    try {
        const resp = await apiGetCategories()
        categories.value = resp.data || []
        console.log('Fetched categories:', resp.data)
        totalItems.value = categories.value.length
    } catch (error) {
        console.error('Failed to fetch categories:', error)
        categories.value = []
        totalItems.value = 0
    }
}

onMounted(fetchCategories)

const handleSearch = () => {
    console.log('Searching for:', searchTerm.value)
}

const handleAddCategory = () => {
    router.push(RoutePath.AdminCategorySub1)
}

const handleAction = (action: string, categoryId: number) => {
    console.log(`Action "${action}" for category ${categoryId}`)
    // Implement actual logic for edit/delete/view here
    if (action === 'delete') {
        // Example: confirm and delete
        if (confirm(`Are you sure you want to delete category ${categoryId}?`)) {
            // Call API to delete
            console.log(`Deleting category ${categoryId}`)
            // Re-fetch categories after deletion
            fetchCategories()
        }
    } else if (action === 'edit') {
        router.push(`${RoutePath.AdminCategorySub2}/${categoryId}`)
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
        <CategoryTable
            :categories="categories"
            :search-term="searchTerm"
            @update:pagination="tablePagination = $event"
            @action="handleAction"
        />
    </div>
</template>
