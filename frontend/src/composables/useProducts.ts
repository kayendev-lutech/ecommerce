import { apiGetProducts } from '@/api/product/product.api'
import { useQuery } from '@tanstack/vue-query'
import type { PaginationState } from '@tanstack/vue-table'
import { computed, ref } from 'vue'

export function useProducts() {
    const searchTerm = ref('')
    const sortBy = ref('name')
    const order = ref<'ASC' | 'DESC'>('ASC')
    const categoryId = ref<number | undefined>(undefined)

    const tablePagination = ref<PaginationState>({
        pageIndex: 0,
        pageSize: 10
    })

    const queryKey = computed(() => [
        'products',
        {
            page: tablePagination.value.pageIndex + 1,
            limit: tablePagination.value.pageSize,
            search: searchTerm.value.length >= 1 ? searchTerm.value : undefined,
            order: order.value,
            sortBy: sortBy.value,
            category_id: categoryId.value
        }
    ])

    const { data, isLoading, isFetching, refetch } = useQuery({
        queryKey: queryKey,
        queryFn: () =>
            apiGetProducts({
                page: tablePagination.value.pageIndex + 1,
                limit: tablePagination.value.pageSize,
                search: searchTerm.value.length >= 1 ? searchTerm.value : undefined,
                order: order.value,
                sortBy: sortBy.value,
                category_id: categoryId.value
            }),
        staleTime: 1000 * 30
    })

    const products = computed(() => data.value?.data || [])
    const totalItems = computed(() => data.value?.pagination?.totalRecords || 0)
    const totalPages = computed(() => data.value?.pagination?.totalPages || 0)

    return {
        products,
        totalItems,
        totalPages,
        tablePagination,
        searchTerm,
        sortBy,
        order,
        categoryId,
        isLoading,
        isFetching,
        refetch
    }
}
