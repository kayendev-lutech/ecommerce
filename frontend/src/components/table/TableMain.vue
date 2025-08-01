<script setup lang="ts">
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table'
import { FlexRender, type Table as TableVue } from '@tanstack/vue-table'

const props = defineProps<{
    table: TableVue<any>
    columns: any[]
}>()
</script>

<template>
    <div class="rounded-lg border border-gray-200 shadow-sm overflow-x-auto bg-white">
        <Table class="min-w-full divide-y divide-gray-200">
            <TableHeader>
                <TableRow
                    v-for="headerGroup in table.getHeaderGroups()"
                    :key="headerGroup.id"
                    class="bg-gray-50"
                >
                    <TableHead
                        v-for="header in headerGroup.headers"
                        :key="header.id"
                        class="px-4 py-3 text-left font-semibold text-gray-700"
                    >
                        <FlexRender
                            v-if="!header.isPlaceholder"
                            :render="header.column.columnDef.header"
                            :props="header.getContext()"
                        />
                    </TableHead>
                </TableRow>
            </TableHeader>

            <TableBody>
                <template v-if="props.table.getRowModel().rows?.length">
                    <template v-for="row in props.table.getRowModel().rows" :key="row.id">
                        <TableRow
                            :data-state="row.getIsSelected() && 'selected'"
                            class="hover:bg-gray-100 transition"
                        >
                            <TableCell
                                v-for="cell in row.getVisibleCells()"
                                :key="cell.id"
                                class="px-4 py-2 align-middle"
                            >
                                <FlexRender
                                    :render="cell.column.columnDef.cell"
                                    :props="cell.getContext()"
                                />
                            </TableCell>
                        </TableRow>
                    </template>
                </template>

                <TableRow v-else>
                    <TableCell
                        :colspan="table.getAllColumns.length"
                        class="h-24 text-center text-gray-400"
                    >
                        No results.
                    </TableCell>
                </TableRow>
            </TableBody>
        </Table>
    </div>
</template>
