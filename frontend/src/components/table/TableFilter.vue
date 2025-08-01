<script setup lang="ts">
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { FormControl, FormField, FormItem } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { ChevronDown } from 'lucide-vue-next'

const props = defineProps<{ table: any }>()
</script>

<template>
    <div class="flex items-center py-4">
        <FormField v-slot="{ componentField }" name="searchTerm">
            <FormItem class="w-full max-w-sm">
                <FormControl>
                    <Input
                        type="text"
                        placeholder="Filter products..."
                        v-bind="componentField"
                        class="rounded-lg border border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 bg-white shadow-sm"
                    />
                </FormControl>
            </FormItem>
        </FormField>
        <DropdownMenu>
            <DropdownMenuTrigger as-child>
                <Button variant="outline" class="ml-auto">
                    Columns <ChevronDown class="ml-2 h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="end"
                class="z-[100] bg-emerald-900 text-white shadow-lg border-none"
            >
                <DropdownMenuCheckboxItem
                    v-for="column in props.table.getAllColumns().filter((c: any) => c.getCanHide())"
                    :key="column.id"
                    class="capitalize"
                    :model-value="column.getIsVisible()"
                    @update:model-value="(value) => column.toggleVisibility(!!value)"
                >
                    {{ column.id }}
                </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
        </DropdownMenu>
    </div>
</template>
