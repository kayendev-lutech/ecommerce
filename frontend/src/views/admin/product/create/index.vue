<script setup lang="ts">
import { apiCreateProduct, apiUploadProductImage } from '@/api/product/product.api'
import ProductCategoryForm from '@/components/product/ProductCategoryForm.vue'
import ProductStatusForm from '@/components/product/ProductStatusForm.vue'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select'
import { Tabs, TabsContent } from '@/components/ui/tabs'
import router, { RoutePath } from '@/router'
import { toTypedSchema } from '@vee-validate/zod'
import { ArrowLeft, Package } from 'lucide-vue-next'
import { Textarea } from '@/components/ui/textarea'
import { useForm } from 'vee-validate'
import { ref } from 'vue'
import * as z from 'zod'

const activeTab = ref('general')
const selectedImageFile = ref<File | null>(null)

const statusOptions = [
    { value: 'published', label: 'Published' },
    { value: 'draft', label: 'Draft' },
    { value: 'scheduled', label: 'Scheduled' }
]
const categoryOptions = [
    { value: '1', label: 'Electronics' },
    { value: '2', label: 'Clothing' },
    { value: '3', label: 'Books' }
]
const templateOptions = [
    { value: 'default', label: 'Default template' },
    { value: 'minimal', label: 'Minimal template' }
]

const productSchema = toTypedSchema(
    z.object({
        name: z.string().min(1, 'Product name is required'),
        slug: z.string().min(1, 'Slug is required'),
        description: z.string().optional(),
        price: z.preprocess(
            (a) => (a === '' || a === undefined || a === null ? undefined : Number(a)),
            z
                .number({ invalid_type_error: 'Base price must be a number' })
                .positive('Price must be positive')
        ),
        discount_price: z.preprocess(
            (a) => (a === '' || a === undefined || a === null ? undefined : Number(a)),
            z.number().optional()
        ),
        // currency_code: z.string().min(1, 'Currency code is required'),
        category_id: z
            .union([z.string(), z.number()])
            .refine((val) => String(val).length > 0, { message: 'Category is required' }),
        image_url: z.string().optional(),
        is_active: z.boolean().optional(),
        is_visible: z.boolean().optional(),
        metadata: z.any().optional()
    })
)

const { handleSubmit, setFieldValue } = useForm({
    validationSchema: productSchema,
    initialValues: {
        name: '',
        slug: '',
        description: '',
        price: undefined,
        discount_price: undefined,
        // currency_code: '',
        category_id: '',
        image_url: '',
        is_active: true,
        is_visible: true,
        metadata: {}
    }
})

function slugify(str: string) {
    if (!str) return ''
    return str
        .toLowerCase()
        .trim()
        .replace(/[\s\W-]+/g, '-')
        .replace(/^-+|-+$/g, '')
}

const handleProductNameUpdate = (value: string | number) => {
    const strValue = typeof value === 'number' ? String(value) : value
    setFieldValue('name', strValue)
    setFieldValue('slug', slugify(strValue))
}

const onSubmit = handleSubmit(async (formValues) => {
    console.log('Form values before submit:', formValues)

    try {
        const payload = {
            ...formValues,
            price: Number(formValues.price),
            category_id: Number(formValues.category_id),
            discount_price: formValues.discount_price ? Number(formValues.discount_price) : null,
            image_url: '' // Tạm thời để trống, sẽ upload sau
        }

        console.log('Payload to API:', payload)

        // Tạo product trước
        const response = await apiCreateProduct(payload)
        console.log('Product created:', response)

        // Nếu có ảnh, upload ảnh sau khi tạo product
        if (selectedImageFile.value && response.data?.id) {
            try {
                await apiUploadProductImage(response.data.id, selectedImageFile.value)
                console.log('Image uploaded successfully')
            } catch (uploadError) {
                console.error('Image upload failed:', uploadError)
                // Product đã tạo thành công, chỉ ảnh upload thất bại
            }
        }

        await router.push(RoutePath.AdminProductSub)
    } catch (error) {
        console.error('Create product failed:', error)
    }
})
const handleImageUpload = (event: Event) => {
    const target = event.target as HTMLInputElement
    const file = target.files?.[0]
    if (file) {
        selectedImageFile.value = file
        const imageUrl = URL.createObjectURL(file)
        setFieldValue('image_url', imageUrl)
    }
}
const handleCancel = () => {
    router.push(RoutePath.AdminProductSub)
}

const handleCreateCategory = () => {
    console.log('Create new category')
}
</script>

<template>
    <main class="min-h-screen bg-slate-50">
        <form @submit.prevent="onSubmit">
            <!-- Header -->
            <div
                class="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-slate-200/60"
            >
                <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div class="flex items-center justify-between h-16">
                        <button
                            @click="handleCancel"
                            type="button"
                            class="inline-flex items-center text-sm font-medium text-slate-600 hover:text-slate-800 transition-all duration-200 hover:bg-slate-100 px-3 py-2 rounded-lg"
                        >
                            <ArrowLeft class="w-4 h-4 mr-2" />
                            Back to Products
                        </button>
                        <!-- Action buttons moved to header for better UX on mobile -->
                        <div class="flex items-center space-x-4">
                            <button
                                type="button"
                                @click="handleCancel"
                                class="px-4 py-2 rounded-lg text-sm font-medium bg-slate-200/80 text-slate-700 hover:bg-slate-300/80 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                @click="onSubmit"
                                type="submit"
                                class="px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 transition-all shadow-sm hover:shadow-md"
                            >
                                Create Product
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Main Content -->
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <!-- Main Form Column -->
                    <div class="lg:col-span-2 space-y-8">
                        <div class="bg-white/60 backdrop-blur-sm rounded-xl shadow-sm">
                            <Tabs v-model="activeTab" class="w-full">
                                <div class="p-6">
                                    <TabsContent value="general" class="mt-0 space-y-6">
                                        <FormField name="name" v-slot="{ field, errorMessage }">
                                            <FormItem>
                                                <FormLabel>Product Name</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        :value="field.value"
                                                        @update:modelValue="handleProductNameUpdate"
                                                        class="w-full border border-black text-black"
                                                        placeholder="e.g. Awesome T-Shirt"
                                                    />
                                                </FormControl>
                                                <FormMessage class="text-red-500 text-sm">{{
                                                    errorMessage
                                                }}</FormMessage>
                                            </FormItem>
                                        </FormField>

                                        <FormField name="slug" v-slot="{ field, errorMessage }">
                                            <FormItem>
                                                <FormLabel>Slug</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        :value="field.value"
                                                        class="w-full border border-black text-black"
                                                        placeholder="e.g. awesome-t-shirt"
                                                    />
                                                </FormControl>
                                                <FormMessage class="text-red-500 text-sm">{{
                                                    errorMessage
                                                }}</FormMessage>
                                            </FormItem>
                                        </FormField>

                                        <FormField
                                            name="description"
                                            v-slot="{ field, errorMessage }"
                                        >
                                            <FormItem>
                                                <FormLabel>Description</FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        :value="field.value"
                                                        @update:modelValue="
                                                            field['onUpdate:modelValue']
                                                        "
                                                        :class="['border border-black text-black', errorMessage ? 'border-black' : '']"
                                                    />
                                                </FormControl>
                                                <FormMessage class="text-red-500 text-sm">{{
                                                    errorMessage
                                                }}</FormMessage>
                                            </FormItem>
                                        </FormField>
                                    </TabsContent>
                                    <TabsContent value="advanced" class="mt-0 space-y-6">
                                        <!-- Add advanced fields here -->
                                        <p>Advanced settings will be here.</p>
                                    </TabsContent>
                                </div>
                            </Tabs>
                        </div>

                        <!-- Pricing and Media in separate cards -->
                        <div
                            class="bg-white/60 backdrop-blur-sm rounded-xl shadow-sm p-6 space-y-6"
                        >
                            <h3 class="text-lg font-semibold text-slate-800">Pricing</h3>
                            <FormField name="price" v-slot="{ field, errorMessage }">
                                <FormItem>
                                    <FormLabel>Base Price</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            :value="field.value"
                                            @update:modelValue="field['onUpdate:modelValue']"
                                            class="w-full border border-black text-black"
                                            placeholder="e.g. 99.99"
                                        />
                                    </FormControl>
                                    <FormMessage class="text-red-500 text-sm">{{
                                        errorMessage
                                    }}</FormMessage>
                                </FormItem>
                            </FormField>
                        </div>
                        <div
                            class="bg-white/60 backdrop-blur-sm rounded-xl shadow-sm p-6 space-y-6"
                        >
                            <h3 class="text-lg font-semibold text-slate-800">Media</h3>
                            <FormField name="image_url" v-slot="{ errorMessage }">
                                <FormItem>
                                    <FormLabel class="text-slate-700 font-medium"
                                        >Product Image</FormLabel
                                    >
                                    <FormControl>
                                        <div
                                            class="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center bg-slate-50/50 hover:border-indigo-400 transition-colors"
                                        >
                                            <input
                                                type="file"
                                                accept="image/*"
                                                @change="handleImageUpload"
                                                class="hidden"
                                                id="image-upload"
                                            />
                                            <label
                                                for="image-upload"
                                                class="cursor-pointer flex flex-col items-center gap-2"
                                            >
                                                <div
                                                    class="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center"
                                                >
                                                    <Package class="w-5 h-5 text-indigo-600" />
                                                </div>
                                                <div>
                                                    <p class="text-slate-600 font-medium text-sm">
                                                        Click to upload or drag & drop
                                                    </p>
                                                    <p class="text-xs text-slate-500">
                                                        PNG, JPG, GIF up to 10MB
                                                    </p>
                                                </div>
                                            </label>
                                        </div>
                                    </FormControl>
                                    <FormMessage class="text-red-500 text-sm">{{
                                        errorMessage
                                    }}</FormMessage>
                                </FormItem>
                            </FormField>
                        </div>
                    </div>

                    <!-- Sidebar Column -->
                    <div class="lg:col-span-1 space-y-8">
                        <div class="bg-white/60 backdrop-blur-sm rounded-xl p-6 shadow-sm">
                            <div class="flex items-center gap-3 mb-4">
                                <div class="w-2.5 h-2.5 bg-green-500 rounded-full"></div>
                                <h3 class="font-semibold text-slate-800">Status</h3>
                            </div>
                            <FormField v-slot="{ componentField }" name="status">
                                <FormItem>
                                    <FormControl>
                                        <ProductStatusForm
                                            :modelValue="componentField.modelValue"
                                            @update:modelValue="
                                                componentField['onUpdate:modelValue']
                                            "
                                            :options="statusOptions"
                                        />
                                    </FormControl>
                                </FormItem>
                            </FormField>
                        </div>

                        <div class="bg-white/60 backdrop-blur-sm rounded-xl p-6 shadow-sm">
                            <div class="flex items-center gap-3 mb-4">
                                <div class="w-2.5 h-2.5 bg-purple-500 rounded-full"></div>
                                <h3 class="font-semibold text-slate-800">Category</h3>
                            </div>
                            <FormField v-slot="{ componentField }" name="category_id">
                                <FormItem>
                                    <FormControl>
                                        <ProductCategoryForm
                                            :modelValue="componentField.modelValue"
                                            @update:modelValue="
                                                componentField['onUpdate:modelValue']
                                            "
                                            :options="categoryOptions"
                                            @create-category="handleCreateCategory"
                                        />
                                    </FormControl>
                                </FormItem>
                            </FormField>
                        </div>

                        <div class="bg-white/60 backdrop-blur-sm rounded-xl p-6 shadow-sm">
                            <div class="flex items-center gap-3 mb-4">
                                <div class="w-2.5 h-2.5 bg-blue-500 rounded-full"></div>
                                <h3 class="font-semibold text-slate-800">Template</h3>
                            </div>
                            <FormField v-slot="{ componentField }" name="template">
                                <FormItem>
                                    <Select v-bind="componentField">
                                        <FormControl>
                                            <SelectTrigger class="border bg-slate-50/80 rounded-lg">
                                                <SelectValue placeholder="Select template" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem
                                                v-for="option in templateOptions"
                                                :key="option.value"
                                                :value="option.value"
                                            >
                                                {{ option.label }}
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </FormItem>
                            </FormField>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    </main>
</template>

<style scoped>
/* Scoped styles can remain largely the same, but ensure they don't conflict */
/* For example, you can simplify or remove some overrides if Tailwind handles it well */
[data-state='active'] {
    @apply bg-white shadow-sm text-indigo-600;
}
</style>
