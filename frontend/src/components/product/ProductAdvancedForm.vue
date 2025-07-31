<script setup lang="ts">
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

const props = defineProps<{
    metaTitle?: string
    metaDescription?: string
    stockQuantity?: string | number
    lowStockThreshold?: string | number
}>()

const emit = defineEmits<{
    (e: 'update:metaTitle', value: string): void
    (e: 'update:metaDescription', value: string): void
    (e: 'update:stockQuantity', value: string | number): void
    (e: 'update:lowStockThreshold', value: string | number): void
}>()
</script>

<template>
    <div>
        <h2 class="text-xl font-semibold mb-2">Advanced</h2>
        <p class="text-muted-foreground mb-6">Advanced product settings and configurations.</p>

        <!-- SEO Settings -->
        <div class="space-y-4">
            <Label class="text-sm font-medium">SEO Settings</Label>
            <div class="border border-input rounded-lg p-6 bg-muted/50 space-y-6">
                <div class="space-y-2">
                    <Label class="text-sm font-medium">Meta Title</Label>
                    <Input
                        :value="props.metaTitle"
                        @input="emit('update:metaTitle', $event.target.value)"
                        placeholder="SEO meta title"
                    />
                    <p class="text-xs text-muted-foreground">
                        Title that appears in search engine results.
                    </p>
                </div>
                <div class="space-y-2">
                    <Label class="text-sm font-medium">Meta Description</Label>
                    <Textarea
                        :rows="3"
                        :value="props.metaDescription"
                        @input="emit('update:metaDescription', $event.target.value)"
                        placeholder="SEO meta description"
                    />
                    <p class="text-xs text-muted-foreground">
                        Description that appears in search engine results.
                    </p>
                </div>
            </div>
        </div>

        <!-- Inventory Settings -->
        <div class="space-y-4 mt-8">
            <Label class="text-sm font-medium">Inventory Settings</Label>
            <div class="border border-input rounded-lg p-6 bg-muted/50">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div class="space-y-2">
                        <Label class="text-sm font-medium">Stock Quantity</Label>
                        <Input
                            type="number"
                            :value="props.stockQuantity"
                            @input="emit('update:stockQuantity', $event.target.value)"
                            placeholder="0"
                        />
                        <p class="text-xs text-muted-foreground">Current stock quantity.</p>
                    </div>
                    <div class="space-y-2">
                        <Label class="text-sm font-medium">Low Stock Threshold</Label>
                        <Input
                            type="number"
                            :value="props.lowStockThreshold"
                            @input="emit('update:lowStockThreshold', $event.target.value)"
                            placeholder="5"
                        />
                        <p class="text-xs text-muted-foreground">
                            Alert when stock falls below this number.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
