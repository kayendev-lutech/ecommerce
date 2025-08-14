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
import { toTypedSchema } from '@vee-validate/zod'
import { ChevronDown } from 'lucide-vue-next'
import { useForm } from 'vee-validate'
import { watch } from 'vue'
import * as z from 'zod'

const props = defineProps<{
    table: any
    loading?: boolean
}>()

const formSchema = toTypedSchema(z.object({ searchTerm: z.string() }))
const form = useForm({
    validationSchema: formSchema,
    initialValues: { searchTerm: '' }
})

watch(
    () => form.values.searchTerm,
    (newValue) => {
        props.table.getColumn('name')?.setFilterValue(newValue || '')
    }
)
</script>

<template>
    <div class="flex items-center py-4">
        <FormField v-slot="{ componentField }" name="searchTerm">
            <FormItem class="flex-1">
                <FormControl>
                    <Input
                        placeholder="Search products..."
                        v-bind="componentField"
                        :disabled="loading"
                        class="max-w-sm"
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
