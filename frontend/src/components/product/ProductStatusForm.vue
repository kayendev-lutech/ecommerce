<script setup lang="ts">
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select'
import { ref, watch } from 'vue'

const props = defineProps<{
    modelValue: string
    options: Array<{ value: string; label: string; color?: string }>
}>()

const emit = defineEmits<{
    (e: 'update:modelValue', value: string): void
}>()

const status = ref(props.modelValue)

watch(
    () => props.modelValue,
    (val) => (status.value = val)
)
watch(status, (val) => emit('update:modelValue', val))

function getStatusColor(statusValue: string) {
    const found = props.options.find((opt) => opt.value === statusValue)
    if (found?.color === 'green') return 'bg-green-500'
    if (found?.color === 'gray') return 'bg-gray-500'
    if (found?.color === 'blue') return 'bg-blue-500'
    return 'bg-gray-500'
}
</script>

<template>
    <Card>
        <CardHeader>
            <CardTitle class="text-base">Status</CardTitle>
        </CardHeader>
        <CardContent class="space-y-3">
            <div class="flex items-center gap-2">
                <div :class="['w-2 h-2 rounded-full', getStatusColor(status)]"></div>
                <Select v-model="status">
                    <SelectTrigger class="flex-1">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem
                            v-for="option in props.options"
                            :key="option.value"
                            :value="option.value"
                        >
                            {{ option.label }}
                        </SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <p class="text-xs text-muted-foreground">Set the product status.</p>
        </CardContent>
    </Card>
</template>
