import { apiGetProducts } from '@/api/product/product.api';
import { keepPreviousData, useQuery } from '@tanstack/vue-query';
import type { PaginationState } from '@tanstack/vue-table';
import { computed, ref } from 'vue';

export function useProducts() {
    const searchTerm = ref('');
    const status = ref('all'); // Example filter
    const tablePagination = ref<PaginationState>({
        pageIndex: 0, // Corresponds to the first page
        pageSize: 10,
    });
    const queryKey = computed(() => [
        'products',
        {
            status: status.value,
            page: tablePagination.value.pageIndex + 1, // API uses 1-based index
            pageSize: tablePagination.value.pageSize,
            search: searchTerm.value,
        },
    ]);

    const { data, isLoading, isFetching, isPlaceholderData } = useQuery({
        queryKey: queryKey,
        queryFn: () =>
            apiGetProducts({
                status: status.value,
                page: tablePagination.value.pageIndex + 1,
                pageSize: tablePagination.value.pageSize,
                search: searchTerm.value,
            }),
        select: (response) => {
            const products = response?.data || [];
            const pagination = response?.pagination;
            console.log("product: ", products)
            console.log("product: ", pagination)
            return {
                products: products,
                totalItems: pagination?.total || 0,
                totalPages: pagination?.totalPages || 0,
            };
        },
        placeholderData: keepPreviousData,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });

    const products = computed(() => data.value?.products || []);
    const totalItems = computed(() => data.value?.totalItems || 0);
    const totalPages = computed(() => data.value?.totalPages || 0);

    return {
        products,
        totalItems,
        totalPages, // <-- Expose totalPages
        searchTerm,
        tablePagination,
        status,
        isLoading,
        isFetching,
        isPlaceholderData,
    };
}