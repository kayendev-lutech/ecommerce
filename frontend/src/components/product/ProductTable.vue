<script setup lang="ts">
// --- START: CÁC IMPORT THÊM VÀO CHO FORM ---
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import * as z from 'zod'
// --- END: CÁC IMPORT THÊM VÀO CHO FORM ---

import { apiDeleteProduct } from '@/api/product/product.api'
import AlertMain from '@/components/ui/alert-dialog/AlertMain.vue'
import { Checkbox } from '@/components/ui/checkbox'
import { TableFilter, TableMain, TablePagination } from '@/components/ui/table'
import type { Product } from '@/types/product.type'
import { valueUpdater } from '@/utils'
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
import { computed, h, ref, watch } from 'vue'

const props = defineProps<{
    products: Product[]
    searchTerm: string
}>()

const emit = defineEmits<{
    (e: 'action', action: string, productId: number): void
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
        accessorKey: 'name',
        header: 'Name',
        cell: ({ row }) => h('div', {}, row.getValue('name'))
    },
    {
        accessorKey: 'description',
        header: 'Description',
        cell: ({ row }) => h('div', {}, row.getValue('description'))
    },
    {
        accessorKey: 'price',
        header: 'Price',
        cell: ({ row }) => h('div', {}, row.getValue('price'))
    },
    {
        accessorKey: 'image_url',
        header: 'Thumbnail',
        cell: ({ row }) => {
            const url = row.getValue('image_url') || ''
            return h('img', {
                src: url,
                class: 'w-10 h-10 object-cover rounded'
            })
        }
    },
    {
        id: 'actions',
        enableHiding: false,
        header: () => h('div', { class: 'text-right' }, 'Actions'),
        cell: ({ row }) => {
            const id = row.original.id
            return h('div', { class: 'text-right space-x-2' }, [
                h(
                    'button',
                    {
                        class: 'px-3 py-1 rounded bg-blue-500 text-white hover:bg-blue-600 transition',
                        onClick: () => emit('action', 'edit', id)
                    },
                    'Edit'
                ),
                h(
                    'button',
                    {
                        class: 'px-3 py-1 rounded bg-red-500 text-white hover:bg-red-600 transition',
                        onClick: () => handleDelete(id)
                    },
                    'Delete'
                )
            ])
        }
    }
]

// ==== TABLE LOGIC ====
const pagination = ref<PaginationState>({ pageIndex: 0, pageSize: 10 })
const sorting = ref<SortingState>([])
const columnFilters = ref<ColumnFiltersState>([])
const columnVisibility = ref<VisibilityState>({})
const rowSelection = ref({})
const expanded = ref<ExpandedState>({})

const formSchema = toTypedSchema(
    z.object({
        searchTerm: z.string()
    })
)

// Khởi tạo form với useForm từ vee-validate
const form = useForm({
    validationSchema: formSchema,
    initialValues: {
        searchTerm: props.searchTerm || ''
    }
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
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    onSortingChange: (updaterOrValue) => valueUpdater(updaterOrValue, sorting),
    onColumnFiltersChange: (updaterOrValue) => valueUpdater(updaterOrValue, columnFilters),
    onColumnVisibilityChange: (updaterOrValue) => valueUpdater(updaterOrValue, columnVisibility),
    onRowSelectionChange: (updaterOrValue) => valueUpdater(updaterOrValue, rowSelection),
    onExpandedChange: (updaterOrValue) => valueUpdater(updaterOrValue, expanded),
    onPaginationChange: (updaterOrValue) => valueUpdater(updaterOrValue, pagination),
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
            return pagination.value
        }
    }
})
watch(
    () => form.values.searchTerm,
    (newValue) => {
        table.getColumn('name')?.setFilterValue(newValue)
    }
)
</script>

<template>
    <div class="w-full">
        <TableFilter :table="table" />

        <TableMain :table="table" :columns="columns" />

        <TablePagination :table="table" />
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
