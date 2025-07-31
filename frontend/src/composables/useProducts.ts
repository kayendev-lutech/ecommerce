// src/composables/useProducts.ts

import { apiGetProducts } from '@/api/product/product.api'
import { keepPreviousData, useQuery } from '@tanstack/vue-query'
import { computed, ref } from 'vue'

export function useProducts() {
    const searchTerm = ref('')
    const tablePagination = ref({
        pageIndex: 0,
        pageSize: 10
    })
    const status = ref('all')

    const queryKey = computed(() => [
        'products',
        {
            status: status.value,
            page: tablePagination.value.pageIndex + 1,
            pageSize: tablePagination.value.pageSize,
            search: searchTerm.value
        }
    ])

    const { data, isLoading, isFetching, isPlaceholderData } = useQuery({
        queryKey: queryKey,
        queryFn: () =>
            apiGetProducts({
                status: status.value,
                page: tablePagination.value.pageIndex + 1,
                pageSize: tablePagination.value.pageSize,
                search: searchTerm.value
            }),

        select: (response) => {
            const products = response?.data || []
            const pagination = response?.pagination

            return {
                products: products,
                totalItems: pagination?.total || 0
            }
        },

        placeholderData: keepPreviousData,
        staleTime: 5 * 60 * 1000 // Cache dữ liệu trong 5 phút
    })

    const products = computed(() => data.value?.products || [])
    const totalItems = computed(() => data.value?.totalItems || 0)

    return {
        products,
        totalItems,
        searchTerm,
        tablePagination,
        status,
        isLoading,
        isFetching,
        isPlaceholderData
    }
}
