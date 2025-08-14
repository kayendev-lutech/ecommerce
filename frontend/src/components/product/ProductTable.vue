<script setup lang="ts">
import { apiDeleteProduct } from '@/api/product/product.api'
import TableFilter from '@/components/table/TableFilter.vue'
import TableMain from '@/components/table/TableMain.vue'
import TablePagination from '@/components/table/TablePagination.vue'
import AlertMain from '@/components/ui/alert-dialog/AlertMain.vue'
import { Checkbox } from '@/components/ui/checkbox'
import type { Product } from '@/types/product.type'
import { valueUpdater } from '@/utils'
import { formatCurrency } from '@/utils/formatter'
import type {
    ColumnDef,
    ColumnFiltersState,
    ExpandedState,
    PaginationState,
    SortingState,
    VisibilityState
} from '@tanstack/vue-table'
import {
    getCoreRowModel,
    getExpandedRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useVueTable
} from '@tanstack/vue-table'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { computed, h, ref } from 'vue'
import * as z from 'zod'

const props = defineProps<{
    products: Product[]
    searchTerm: string
    pagination: PaginationState
    totalPages: number
    totalItems: number
    loading?: boolean
}>()

const emit = defineEmits<{
    (e: 'action', action: string, productId: number): void
    (e: 'update:pagination', value: PaginationState): void
    (e: 'update:search', value: string): void
    (e: 'update:sort', sortBy: string, order: 'ASC' | 'DESC'): void
}>()

const showDeleteDialog = ref(false)
const pendingDeleteId = ref<number | null>(null)

const tableData = computed(() => props.products)

const columns: ColumnDef<Product>[] = [
    {
        id: 'select',
        header: ({ table }) =>
            h(Checkbox, {
                modelValue:
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && 'indeterminate'),
                'onUpdate:modelValue': (value) => table.toggleAllPageRowsSelected(!!value),
                ariaLabel: 'Select all'
            }),
        cell: ({ row }) =>
            h(Checkbox, {
                modelValue: row.getIsSelected(),
                'onUpdate:modelValue': (value) => row.toggleSelected(!!value),
                ariaLabel: 'Select row'
            }),
        enableSorting: false,
        enableHiding: false
    },
    {
        accessorKey: 'image_url',
        header: 'Thumbnail',
        cell: ({ row }) => {
            const url = row.getValue('image_url') as string | null
            return url
                ? h('img', {
                      src: url,
                      alt: row.original.name,
                      class: 'h-12 w-12 rounded-md object-cover'
                  })
                : h('div', { class: 'h-12 w-12 rounded-md bg-gray-200' })
        }
    },
    {
        accessorKey: 'name',
        header: 'Tên sản phẩm',
        cell: ({ row }) => h('div', { class: 'font-medium' }, row.getValue('name'))
    },
    {
        accessorKey: 'description',
        header: 'Mô tả',
        cell: ({ row }) => {
            const desc = row.getValue('description') as string
            const truncatedDesc = desc.length > 50 ? desc.substring(0, 50) + '...' : desc
            return h('div', { class: 'text-sm text-gray-600', title: desc }, truncatedDesc)
        }
    },
    {
        accessorKey: 'price',
        header: 'Giá',
        cell: ({ row }) => {
            const price = row.original.price
            const discountPrice = row.original.discount_price

            if (discountPrice !== null && discountPrice < price) {
                return h('div', { class: 'flex flex-col' }, [
                    h(
                        'span',
                        { class: 'font-semibold text-red-600' },
                        formatCurrency(Number(discountPrice))
                    ),
                    h(
                        'span',
                        { class: 'text-xs text-gray-500 line-through' },
                        formatCurrency(Number(price))
                    )
                ])
            }
            return h('div', { class: 'font-semibold' }, formatCurrency(Number(price)))
        }
    },
    {
        id: 'status',
        header: 'Trạng thái',
        cell: ({ row }) => {
            const { is_active, is_visible } = row.original
            const activeBadge = h(
                'span',
                {
                    class: `mr-2 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`
                },
                is_active ? 'Active' : 'Inactive'
            )
            const visibleBadge = h(
                'span',
                {
                    class: `rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        is_visible ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
                    }`
                },
                is_visible ? 'Visible' : 'Hidden'
            )
            return h('div', { class: 'flex flex-col items-start gap-1' }, [
                activeBadge,
                visibleBadge
            ])
        }
    },
    {
        id: 'actions',
        enableHiding: false,
        header: () => h('div', { class: 'text-right' }, 'Thao tác'),
        cell: ({ row }) => {
            const id = row.original.id
            return h('div', { class: 'text-right space-x-2' }, [
                h(
                    'button',
                    {
                        class: 'px-3 py-1 rounded bg-blue-500 text-white hover:bg-blue-600 transition',
                        onClick: () => emit('action', 'edit', id)
                    },
                    'Sửa'
                ),
                h(
                    'button',
                    {
                        class: 'px-3 py-1 rounded bg-red-500 text-white hover:bg-red-600 transition',
                        onClick: () => handleDelete(id)
                    },
                    'Xóa'
                )
            ])
        }
    }
]

// --- Logic bảng (giữ nguyên không thay đổi) ---
const sorting = ref<SortingState>([])
const columnFilters = ref<ColumnFiltersState>([])
const columnVisibility = ref<VisibilityState>({})
const rowSelection = ref({})
const expanded = ref<ExpandedState>({})

const formSchema = toTypedSchema(z.object({ searchTerm: z.string() }))
const form = useForm({
    validationSchema: formSchema,
    initialValues: { searchTerm: props.searchTerm || '' }
})

function handleDelete(id: number) {
    pendingDeleteId.value = id
    showDeleteDialog.value = true
}

function confirmDelete() {
    if (pendingDeleteId.value !== null) {
        apiDeleteProduct(pendingDeleteId.value)
            .then(() => {
                emit('action', 'delete', pendingDeleteId.value!)
            })
            .finally(() => {
                showDeleteDialog.value = false
                pendingDeleteId.value = null
            })
    }
}

function cancelDelete() {
    showDeleteDialog.value = false
    pendingDeleteId.value = null
}

const table = useVueTable({
    get data() {
        return tableData.value
    },
    columns,
    pageCount: props.totalPages,
    rowCount: props.totalItems,
    manualPagination: true,
    manualFiltering: true,
    manualSorting: true,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    onPaginationChange: (updaterOrValue) => {
        const newValue =
            typeof updaterOrValue === 'function' ? updaterOrValue(props.pagination) : updaterOrValue
        emit('update:pagination', newValue)
    },
    onColumnFiltersChange: (updaterOrValue) => {
        const newFilters =
            typeof updaterOrValue === 'function'
                ? updaterOrValue(columnFilters.value)
                : updaterOrValue
        const nameFilter = newFilters.find((filter) => filter.id === 'name')
        if (nameFilter) {
            emit('update:search', nameFilter.value as string)
        }
        valueUpdater(updaterOrValue, columnFilters)
    },
    onSortingChange: (updaterOrValue) => {
        const newSorting =
            typeof updaterOrValue === 'function' ? updaterOrValue(sorting.value) : updaterOrValue
        if (newSorting.length > 0) {
            const { id, desc } = newSorting[0]
            emit('update:sort', id, desc ? 'DESC' : 'ASC')
        }
        valueUpdater(updaterOrValue, sorting)
    },
    onColumnVisibilityChange: (updaterOrValue) => valueUpdater(updaterOrValue, columnVisibility),
    onRowSelectionChange: (updaterOrValue) => valueUpdater(updaterOrValue, rowSelection),
    onExpandedChange: (updaterOrValue) => valueUpdater(updaterOrValue, expanded),
    state: {
        get sorting() {
            return sorting.value
        },
        get columnFilters() {
            return columnFilters.value
        },
        get columnVisibility() {
            return columnVisibility.value
        },
        get rowSelection() {
            return rowSelection.value
        },
        get expanded() {
            return expanded.value
        },
        get pagination() {
            return props.pagination
        }
    }
})

// const debouncedSearch = debounce((value: string) => {
//     emit('update:search', value)
// }, 300)

// watch(
//     () => form.values.searchTerm,
//     (newValue) => {
//         const value = newValue ?? ''
//         debouncedSearch(value)
//     },
//     { immediate: false }
// )

// watch(
//     () => props.searchTerm,
//     (newValue) => {
//         if (newValue !== form.values.searchTerm) {
//             form.setFieldValue('searchTerm', newValue)
//         }
//     }
// )
</script>

<template>
    <div class="w-full">
        <TableFilter :table="table" :loading="loading" />
        <TableMain :table="table" :columns="columns" :loading="loading" />
        <TablePagination :table="table" :total-pages="totalPages" />

        <AlertMain
            :open="showDeleteDialog"
            title="Are you sure you want to delete?"
            description="This action cannot be undone. The product will be permanently deleted."
            @update:open="showDeleteDialog = $event"
            @cancel="cancelDelete"
            @confirm="confirmDelete"
        />
    </div>
</template>
