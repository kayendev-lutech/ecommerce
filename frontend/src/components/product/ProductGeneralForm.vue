<script setup lang="ts">
// filepath: src/components/product/ProductGeneralForm.vue
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'
import { Bold, CloudUpload, Italic, Link, List, Underline } from 'lucide-vue-next'

const props = defineProps<{
    productName: string
    slug: string
    description: string
    basePrice: string
    discountType: string
    discountValue: string
    currencyCode: string
    discountPrice: string
    mediaUrl: string
}>()

const emit = defineEmits<{
    (e: 'update:productName', value: string): void
    (e: 'update:description', value: string): void
    (e: 'update:basePrice', value: string): void
    (e: 'update:discountType', value: string): void
    (e: 'update:discountValue', value: string): void
    (e: 'update:currencyCode', value: string): void
    (e: 'update:discountPrice', value: string): void
    (e: 'update:mediaUrl', value: string): void
    (e: 'file-upload', event: Event): void
    (e: 'update:productName', value: string): void
    (e: 'update:slug', value: string): void
}>()
</script>

<template>
    <div>
        <h2 class="text-xl font-semibold mb-4">General</h2>
        <!-- Product Name -->
        <div class="space-y-2">
            <Label class="text-sm font-medium">
                Product Name <span class="text-destructive">*</span>
            </Label>
            <Input
                :value="props.productName"
                @input="emit('update:productName', $event.target.value)"
                placeholder="Product name"
                class="w-full border border-gray-200 rounded-lg shadow-sm"
            />
        </div>

        <!-- Description -->
        <div class="space-y-2 mt-2">
            <Label class="text-sm font-medium">Description</Label>
            <div class="rounded-lg bg-muted/50 shadow-sm">
                <div class="flex items-center gap-1 p-2 bg-muted border-b border-gray-100">
                    <Button variant="ghost" size="sm" class="h-8 px-3 text-xs">Normal</Button>
                    <div class="w-px h-4 bg-border mx-1"></div>
                    <Button variant="ghost" size="sm" class="h-8 w-8 p-0"
                        ><Bold class="w-3 h-3"
                    /></Button>
                    <Button variant="ghost" size="sm" class="h-8 w-8 p-0"
                        ><Italic class="w-3 h-3"
                    /></Button>
                    <Button variant="ghost" size="sm" class="h-8 w-8 p-0"
                        ><Underline class="w-3 h-3"
                    /></Button>
                    <Button variant="ghost" size="sm" class="h-8 w-8 p-0"
                        ><Link class="w-3 h-3"
                    /></Button>
                    <Button variant="ghost" size="sm" class="h-8 w-8 p-0"
                        ><List class="w-3 h-3"
                    /></Button>
                </div>
                <Textarea
                    :value="props.description"
                    @input="emit('update:description', $event.target.value)"
                    placeholder="Type your text here..."
                    :rows="6"
                    class="border-0 rounded-none resize-none focus-visible:ring-0 bg-white"
                />
                <!-- Media -->
                <div class="space-y-2">
                    <Label class="text-sm font-medium">Media</Label>
                    <div
                        class="border-2 border-dashed border-gray-200 rounded-lg p-16 text-center bg-muted/50 hover:border-primary hover:bg-primary/5 transition-colors cursor-pointer relative"
                    >
                        <CloudUpload class="w-10 h-10 text-primary mx-auto mb-4" />
                        <p class="text-sm text-muted-foreground">
                            <strong>Drop files here or click to upload.</strong><br />
                            Upload up to 10 files
                        </p>
                        <input
                            type="file"
                            @change="emit('file-upload', $event)"
                            class="absolute inset-0 opacity-0 cursor-pointer"
                        />
                        <div v-if="props.mediaUrl" class="mt-4 flex justify-center">
                            <img
                                :src="props.mediaUrl"
                                alt="Product Image"
                                class="max-h-40 rounded shadow"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Pricing -->
        <div class="space-y-4">
            <Label class="text-sm font-medium">Pricing</Label>
            <div class="rounded-lg p-6 bg-muted/50 shadow-sm space-y-6">
                <div class="space-y-2">
                    <Label class="text-sm font-medium">
                        Base Price <span class="text-destructive">*</span>
                    </Label>
                    <Input
                        :value="props.basePrice"
                        @input="emit('update:basePrice', $event.target.value)"
                        placeholder="Product price"
                        class="border border-gray-200 rounded-lg shadow-sm"
                    />
                    <p class="text-xs text-muted-foreground">Set the product price.</p>
                </div>

                <div class="space-y-3">
                    <Label class="text-sm font-medium">Discount Type</Label>
                    <RadioGroup
                        :model-value="props.discountType"
                        @update:modelValue="emit('update:discountType', $event)"
                        class="flex flex-wrap gap-8"
                    >
                        <div class="flex items-center space-x-2">
                            <RadioGroupItem value="no-discount" id="no-discount" />
                            <Label for="no-discount" class="text-sm">No Discount</Label>
                        </div>
                        <div class="flex items-center space-x-2">
                            <RadioGroupItem value="percentage" id="percentage" />
                            <Label for="percentage" class="text-sm">Percentage %</Label>
                        </div>
                        <div class="flex items-center space-x-2">
                            <RadioGroupItem value="fixed" id="fixed" />
                            <Label for="fixed" class="text-sm">Fixed Price</Label>
                        </div>
                    </RadioGroup>
                </div>

                <div v-if="props.discountType !== 'no-discount'" class="space-y-2">
                    <Label class="text-sm font-medium">Discount Value</Label>
                    <Input
                        :value="props.discountValue"
                        @input="emit('update:discountValue', $event.target.value)"
                        :placeholder="
                            props.discountType === 'percentage' ? 'Percentage' : 'Fixed amount'
                        "
                        class="border border-gray-200 rounded-lg shadow-sm"
                    />
                    <p class="text-xs text-muted-foreground">
                        Set the discount
                        {{ props.discountType === 'percentage' ? 'percentage' : 'amount' }}.
                    </p>
                    <div v-if="props.discountType === 'fixed'" class="space-y-2">
                        <Label class="text-sm font-medium">Discount Price</Label>
                        <Input
                            :value="props.discountPrice"
                            @input="emit('update:discountPrice', $event.target.value)"
                            placeholder="Discount price"
                            class="border border-gray-200 rounded-lg shadow-sm"
                        />
                        <p class="text-xs text-muted-foreground">
                            Discounted price for the product.
                        </p>
                        <Label class="text-sm font-medium">Currency Code</Label>
                        <Input
                            :value="props.currencyCode"
                            @input="emit('update:currencyCode', $event.target.value)"
                            placeholder="Currency code (e.g. VND, USD)"
                            class="border border-gray-200 rounded-lg shadow-sm"
                        />
                        <p class="text-xs text-muted-foreground">Currency for product price.</p>
                    </div>
                </div>
                <div class="space-y-2 mt-2">
                    <Label class="text-sm font-medium">Slug</Label>
                    <Input
                        :value="props.slug"
                        @input="emit('update:slug', $event.target.value)"
                        placeholder="product-slug"
                        class="w-full border border-gray-200 rounded-lg shadow-sm"
                    />
                </div>
            </div>
        </div>
    </div>
</template>
