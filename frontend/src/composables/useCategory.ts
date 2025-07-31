// src/composables/useCategory.ts

import { keepPreviousData, useQuery } from '@tanstack/vue-query'
import { computed, ref } from 'vue'
// Giả sử bạn có một API function tương tự cho category
import { apiGetCategories } from '@/api/category/category.api'

export function useCategory() {
    const searchTerm = ref('')
    const tablePagination = ref({
        pageIndex: 0,
        pageSize: 10
    })

    const queryKey = computed(() => [
        'categories',
        {
            page: tablePagination.value.pageIndex,
            pageSize: tablePagination.value.pageSize,
            search: searchTerm.value
        }
    ])

    const { data, isLoading, isFetching, isPlaceholderData } = useQuery({
        queryKey: queryKey,
        queryFn: () =>
            apiGetCategories({
                page: tablePagination.value.pageIndex + 1,
                pageSize: tablePagination.value.pageSize,
                search: searchTerm.value
            }),

        placeholderData: keepPreviousData,

        staleTime: Infinity
    })

    const categories = computed(() => data.value?.data || [])
    const totalItems = computed(() => data.value?.total || 0)

    return {
        categories,
        totalItems,
        searchTerm,
        tablePagination,
        isLoading,
        isFetching,
        isPlaceholderData
    }
}
