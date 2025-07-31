<script setup lang="ts">
import { valueUpdater } from '@/utils'
import type {
    ColumnDef,
    ColumnFiltersState,
    ExpandedState,
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
import { computed, h, ref } from 'vue'

import { apiDeleteCategory } from '@/api/category/category.api'
import AlertMain from '@/components/ui/alert-dialog/AlertMain.vue'
import { Checkbox } from '@/components/ui/checkbox'
import { TableFilter, TableMain, TablePagination } from '@/components/ui/table'
import type { Category } from '@/types/category.type'

const props = defineProps<{
    categories: Category[]
    searchTerm: string
}>()

const emit = defineEmits<{
    (e: 'action', action: string, categoryId: number): void
}>()

const page = ref(0)
// ==== ĐỊNH NGHĨA CỘT BẢNG ====
const columns: ColumnDef<Category>[] = [
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
        accessorKey: 'created_at',
        header: 'Created At',
        cell: ({ row }) => {
            const date = row.getValue('created_at')
            const formatted = new Date(String(date)).toLocaleString()
            return h('div', {}, formatted)
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
const sorting = ref<SortingState>([])
const columnFilters = ref<ColumnFiltersState>([])
const columnVisibility = ref<VisibilityState>({})
const rowSelection = ref({})
const expanded = ref<ExpandedState>({})
const showDeleteDialog = ref(false)
const pendingDeleteId = ref<number | null>(null)

const filteredData = computed(() => {
    if (!props.searchTerm) return props.categories
    return props.categories.filter((cat) =>
        cat.name.toLowerCase().includes(props.searchTerm.toLowerCase())
    )
})
function confirmDelete() {
    if (pendingDeleteId.value !== null) {
        apiDeleteCategory(pendingDeleteId.value)
            .then(() => {
                emit('action', 'delete', pendingDeleteId.value!)
            })
            .finally(() => {
                showDeleteDialog.value = false
                pendingDeleteId.value = null
            })
    }
}
function handleDelete(id: number) {
    pendingDeleteId.value = id
    showDeleteDialog.value = true
}
function cancelDelete() {
    showDeleteDialog.value = false
    pendingDeleteId.value = null
}
const table = useVueTable({
    data: filteredData,
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
    manualPagination: true,
    onPaginationChange: (updaterOrValue) => {
        const nextState =
            typeof updaterOrValue === 'function'
                ? updaterOrValue({
                      pageIndex: page.value,
                      pageSize: table.getState().pagination?.pageSize ?? 10
                  })
                : updaterOrValue
        page.value = nextState.pageIndex
        return nextState
    },
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
        }
    }
})
</script>

<template>
    <div class="w-full">
        <TableFilter :table="table" />
        <TableMain :table="table" :columns="columns" />
        <TablePagination :table="table" />
        <AlertMain
            :open="showDeleteDialog"
            title="Are you sure you want to delete?"
            description="This action cannot be undone. The category will be permanently deleted."
            @update:open="showDeleteDialog = $event"
            @cancel="cancelDelete"
            @confirm="confirmDelete"
        />
    </div>
</template>
