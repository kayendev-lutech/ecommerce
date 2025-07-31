<script setup lang="ts">
import { apiGetCategories } from '@/api/category/category.api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select'
import { Plus } from 'lucide-vue-next'
import { onMounted, ref, watch } from 'vue'

const props = defineProps<{
    modelValue: string | number
}>()

const emit = defineEmits<{
    (e: 'update:modelValue', value: string | number): void
    (e: 'create-category'): void
}>()

const categories = ref<Array<{ id: string | number; name: string }>>([])

onMounted(async () => {
    const resp = await apiGetCategories()
    categories.value =
        resp?.data?.map((cat: any) => ({
            id: cat.id,
            name: cat.name
        })) ?? []
})

const localValue = ref(props.modelValue)
watch(
    () => props.modelValue,
    (val) => (localValue.value = val)
)
watch(localValue, (val) => emit('update:modelValue', val))
</script>

<template>
    <Card>
        <CardHeader>
            <CardTitle class="text-base">Product Details</CardTitle>
        </CardHeader>
        <CardContent class="space-y-4">
            <div class="space-y-2">
                <Label class="text-sm font-medium">Categories</Label>
                <Select v-model="localValue">
                    <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem v-for="cat in categories" :key="cat.id" :value="cat.id">
                            {{ cat.name }}
                        </SelectItem>
                    </SelectContent>
                </Select>
                <p class="text-xs text-muted-foreground">Add product to a category.</p>
            </div>
            <Button
                variant="outline"
                class="w-full justify-center gap-2"
                @click="emit('create-category')"
            >
                <Plus class="w-4 h-4" />
                Create new category
            </Button>
        </CardContent>
    </Card>
</template>
