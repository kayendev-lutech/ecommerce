<script setup lang="ts">
// ... Toàn bộ phần script setup của bạn đã đúng, không cần thay đổi ...
// (Giữ nguyên onInvalidSubmit, productSchema, useForm, ...)
import { apiCreateProduct } from '@/api/product/product.api'
import ProductCategoryForm from '@/components/product/ProductCategoryForm.vue'
import ProductStatusForm from '@/components/product/ProductStatusForm.vue'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import router, { RoutePath } from '@/router'
import { toTypedSchema } from '@vee-validate/zod'
import { ArrowLeft, Package, Settings } from 'lucide-vue-next'
import { useForm } from 'vee-validate'
import { ref } from 'vue'
import * as z from 'zod'

const activeTab = ref('general')

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
        productName: z.string().min(1, 'Product name is required'),
        slug: z.string().min(1, 'Slug is required'),
        description: z.string().optional(),
        basePrice: z.preprocess(
            (a) => {
                if (a === '' || a === undefined || a === null) return undefined
                return typeof a === 'number' ? a : Number(a)
            },
            z
                .number({ invalid_type_error: 'Base price must be a number' })
                .positive('Price must be positive')
                .optional()
        ),
        status: z.string(),
        category: z
            .union([z.string(), z.number()])
            .refine((val) => String(val).length > 0, { message: 'Category is required' }),
        template: z.string(),
        metaTitle: z.string().optional(),
        metaDescription: z.string().optional(),
        stockQuantity: z.preprocess(
            (a) => {
                if (a === '' || a === undefined || a === null) return undefined
                return typeof a === 'number' ? a : parseInt(String(a), 10)
            },
            z.number({ invalid_type_error: 'Stock must be an integer' }).min(0).optional()
        ),
        lowStockThreshold: z.preprocess(
            (a) => {
                if (a === '' || a === undefined || a === null) return undefined
                return typeof a === 'number' ? a : parseInt(String(a), 10)
            },
            z.number({ invalid_type_error: 'Threshold must be an integer' }).min(0).optional()
        ),
        mediaUrl: z
            .string()
            .url({ message: 'Please enter a valid URL' })
            .optional()
            .or(z.literal(''))
    })
)

const { handleSubmit, setFieldValue } = useForm({
    validationSchema: productSchema,
    initialValues: {
        productName: '',
        slug: '',
        description: '',
        basePrice: undefined,
        status: 'published',
        category: '',
        template: 'default',
        metaTitle: '',
        metaDescription: '',
        stockQuantity: undefined,
        lowStockThreshold: undefined,
        mediaUrl: ''
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
    setFieldValue('productName', strValue)
    setFieldValue('slug', slugify(strValue))
}

const onSubmit = handleSubmit(async (values) => {
    try {
        console.log('Validation PASSED. Submitting a new product...', values)
        await apiCreateProduct({
            name: values.productName,
            slug: values.slug,
            description: values.description,
            price: values.basePrice,
            status: values.status,
            category_id: values.category,
            template: values.template,
            meta_title: values.metaTitle,
            meta_description: values.metaDescription,
            stock_quantity: values.stockQuantity,
            low_stock_threshold: values.lowStockThreshold,
            media_url: values.mediaUrl
        })
        await router.push(RoutePath.AdminProductSub)
    } catch (error) {
        console.error('Create product failed:', error)
    }
})

const handleCancel = () => {
    router.push(RoutePath.AdminProductSub)
}

const handleCreateCategory = () => {
    console.log('Create new category')
}
</script>

<template>
    <div class="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
        <!-- Header -->
        <div class="bg-white/80 backdrop-blur-sm border-b border-slate-200/60">
            <div class="max-w-8xl mx-auto px-6 sm:px-8 lg:px-12">
                <div class="flex items-center justify-between h-18">
                    <button
                        @click="handleCancel"
                        type="button"
                        class="inline-flex items-center text-sm font-medium text-slate-600 hover:text-slate-800 transition-all duration-200 hover:bg-slate-100 px-3 py-2 rounded-lg"
                    >
                        <ArrowLeft class="w-4 h-4 mr-2" />
                        Back to Products
                    </button>
                </div>
            </div>
        </div>

        <!-- Main Content -->
        <div class="max-w-8xl mx-auto px-6 sm:px-8 lg:px-12 py-10">
            <form @submit="onSubmit">
                <div class="grid grid-cols-1 xl:grid-cols-5 gap-10">
                    <!-- Sidebar -->
                    <div class="xl:col-span-1 space-y-8">
                        <Card class="shadow-sm">
                            <CardHeader><CardTitle>Status</CardTitle></CardHeader>
                            <CardContent>
                                <FormField v-slot="{ componentField, errorMessage }" name="status">
                                    <FormItem>
                                        <FormControl>
                                            <!-- SỬA LỖI: Binding tường minh -->
                                            <ProductStatusForm
                                                :modelValue="componentField.modelValue"
                                                @update:modelValue="
                                                    componentField['onUpdate:modelValue']
                                                "
                                                :options="statusOptions"
                                            />
                                        </FormControl>
                                        <FormMessage class="text-red-500">{{
                                            errorMessage
                                        }}</FormMessage>
                                    </FormItem>
                                </FormField>
                            </CardContent>
                        </Card>
                        <Card class="shadow-sm">
                            <CardHeader><CardTitle>Category</CardTitle></CardHeader>
                            <CardContent>
                                <FormField
                                    v-slot="{ componentField, errorMessage }"
                                    name="category"
                                >
                                    <FormItem>
                                        <FormControl>
                                            <!-- SỬA LỖI: Binding tường minh -->
                                            <ProductCategoryForm
                                                :modelValue="componentField.modelValue"
                                                @update:modelValue="
                                                    componentField['onUpdate:modelValue']
                                                "
                                                :options="categoryOptions"
                                                @create-category="handleCreateCategory"
                                            />
                                        </FormControl>
                                        <FormMessage class="text-red-500">{{
                                            errorMessage
                                        }}</FormMessage>
                                    </FormItem>
                                </FormField>
                            </CardContent>
                        </Card>
                        <Card class="shadow-sm">
                            <CardHeader><CardTitle>Template</CardTitle></CardHeader>
                            <CardContent>
                                <FormField
                                    v-slot="{ componentField, errorMessage }"
                                    name="template"
                                >
                                    <FormItem>
                                        <!-- Đối với component Select của thư viện UI, v-bind vẫn an toàn -->
                                        <Select v-bind="componentField">
                                            <FormControl>
                                                <SelectTrigger
                                                    ><SelectValue placeholder="Select template"
                                                /></SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem
                                                    v-for="option in templateOptions"
                                                    :key="option.value"
                                                    :value="option.value"
                                                    >{{ option.label }}</SelectItem
                                                >
                                            </SelectContent>
                                        </Select>
                                        <FormMessage class="text-red-500">{{
                                            errorMessage
                                        }}</FormMessage>
                                    </FormItem>
                                </FormField>
                            </CardContent>
                        </Card>
                    </div>

                    <!-- Main Form -->
                    <div class="xl:col-span-4">
                        <!-- Cấu trúc Tabs và các FormField khác đã đúng -->
                        <Card class="shadow-sm">
                            <Tabs v-model="activeTab" class="w-full">
                                <CardHeader class="pb-0">
                                    <TabsList
                                        class="grid grid-cols-2 w-full bg-slate-100/80 p-1 rounded-xl"
                                    >
                                        <TabsTrigger
                                            value="general"
                                            class="flex items-center gap-2 py-2.5"
                                        >
                                            <Package class="w-4 h-4" /> General
                                        </TabsTrigger>
                                        <TabsTrigger
                                            value="advanced"
                                            class="flex items-center gap-2 py-2.5"
                                        >
                                            <Settings class="w-4 h-4" /> Advanced
                                        </TabsTrigger>
                                    </TabsList>
                                </CardHeader>
                                <CardContent class="pt-8">
                                    <TabsContent value="general" class="mt-0 space-y-6">
                                        <FormField
                                            name="productName"
                                            v-slot="{ field, errorMessage }"
                                        >
                                            <FormItem>
                                                <FormLabel>Product Name</FormLabel>
                                                <FormControl
                                                    ><Input
                                                        type="text"
                                                        placeholder="e.g. Awesome T-Shirt"
                                                        :value="field.value"
                                                        @update:modelValue="
                                                            handleProductNameUpdate
                                                        "
                                                /></FormControl>
                                                <FormMessage class="text-red-500">{{
                                                    errorMessage
                                                }}</FormMessage>
                                            </FormItem>
                                        </FormField>
                                        <FormField
                                            name="slug"
                                            v-slot="{ componentField, errorMessage }"
                                        >
                                            <FormItem>
                                                <FormLabel>Slug</FormLabel>
                                                <FormControl
                                                    ><Input
                                                        type="text"
                                                        placeholder="e.g. awesome-t-shirt"
                                                        v-bind="componentField"
                                                /></FormControl>
                                                <FormMessage class="text-red-500">{{
                                                    errorMessage
                                                }}</FormMessage>
                                            </FormItem>
                                        </FormField>
                                        <FormField
                                            name="basePrice"
                                            v-slot="{ componentField, errorMessage }"
                                        >
                                            <FormItem>
                                                <FormLabel
                                                    >Price
                                                    <span class="text-red-500">*</span></FormLabel
                                                >
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        min="0"
                                                        step="0.01"
                                                        placeholder="Enter product price"
                                                        v-bind="componentField"
                                                    />
                                                </FormControl>
                                                <FormMessage class="text-red-500">{{
                                                    errorMessage
                                                }}</FormMessage>
                                            </FormItem>
                                        </FormField>
                                    </TabsContent>
                                    <TabsContent value="advanced" class="mt-0 space-y-6">
                                    </TabsContent>
                                </CardContent>
                            </Tabs>
                        </Card>

                        <!-- Các nút Action -->
                        <div class="mt-10 flex items-center justify-end space-x-4">
                            <button
                                type="button"
                                @click="handleCancel"
                                class="px-4 py-2 rounded-md text-sm font-medium bg-slate-200 text-slate-800 hover:bg-slate-300"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                class="px-4 py-2 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700"
                            >
                                Create Product
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    </div>
</template>

<style scoped>
/* Custom gradient background */
.bg-gradient-to-br {
    background-image: linear-gradient(to bottom right, var(--tw-gradient-stops));
}

/* Enhanced card shadows */
.shadow-sm {
    box-shadow:
        0 1px 3px 0 rgba(0, 0, 0, 0.05),
        0 1px 2px 0 rgba(0, 0, 0, 0.03);
}

/* Smooth transitions for interactive elements */
.transition-all {
    transition-property: all;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

/* Custom backdrop blur */
.backdrop-blur-sm {
    backdrop-filter: blur(4px);
}

/* Enhanced focus states */
.focus\:ring-blue-400\/20:focus {
    --tw-ring-color: rgb(96 165 250 / 0.2);
}

/* Improved spacing for form sections */
.space-y-10 > :not([hidden]) ~ :not([hidden]) {
    margin-top: 2.5rem;
}

.space-y-8 > :not([hidden]) ~ :not([hidden]) {
    margin-top: 2rem;
}

.space-y-6 > :not([hidden]) ~ :not([hidden]) {
    margin-top: 1.5rem;
}
</style>
