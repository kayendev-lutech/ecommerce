<script setup lang="ts">
import { apiGetProduct, apiUpdateProduct, apiUploadProductImage } from '@/api/product/product.api'
import { ActionButtons, Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Bold, CloudUpload, Italic, Link, List, Plus, Underline } from 'lucide-vue-next'
import { onMounted, ref } from 'vue'
// import { toast } from 'vue-sonner'
import { useToast } from '@/components/ui/toast/use-toast'
import router, { RoutePath } from '@/router'
import { useRoute } from 'vue-router'
import * as z from 'zod'
const route = useRoute()
const productId = Array.isArray(route.params.id) ? route.params.id[0] : route.params.id

const { toast } = useToast()
const productName = ref('')
const description = ref('')
const basePrice = ref('')
const mediaUrl = ref('')
const activeTab = ref('general')
const status = ref('published')
const category = ref('')
const discountType = ref('no-discount')
const discountValue = ref('')
const taxClass = ref('')
const vatAmount = ref('')
const template = ref('default')
const currencyCode = ref('')
const discountPrice = ref('')

const statusOptions = [
    { value: 'published', label: 'Published', color: 'green' },
    { value: 'draft', label: 'Draft', color: 'gray' },
    { value: 'scheduled', label: 'Scheduled', color: 'blue' }
]

// Fixed: Removed empty string option
const categoryOptions = [
    { value: 'electronics', label: 'Electronics' },
    { value: 'clothing', label: 'Clothing' },
    { value: 'books', label: 'Books' }
]

const templateOptions = [
    { value: 'default', label: 'Default template' },
    { value: 'minimal', label: 'Minimal template' },
    { value: 'detailed', label: 'Detailed template' }
]
const productSchema = z.object({
    name: z.string().min(1, 'Product name is required'),
    price: z.preprocess(
        (val) => (val === '' ? undefined : Number(val)),
        z.number({ invalid_type_error: 'Price must be a number' }).min(0.01, 'Price is required')
    ),
    currency_code: z.string().min(1, 'Currency code is required'),
    description: z.string().optional(),
    discount_price: z.preprocess(
        (val) => (val === '' ? undefined : Number(val)),
        z.number().optional()
    ),
    image_url: z.string().optional()
})
const handleSave = async () => {
    const result = productSchema.safeParse({
        name: productName.value,
        price: basePrice.value,
        currency_code: currencyCode.value,
        description: description.value,
        discount_price: discountPrice.value,
        image_url: mediaUrl.value
    })
    if (!result.success) {
        toast({
            title: 'Validation Error',
            description: result.error.errors.map((e) => e.message).join(', '),
            variant: 'destructive'
        })
        return
    }

    const { price, discount_price, ...rest } = result.data

    const payload = {
        ...rest,
        ...(price !== undefined && { price: String(price) }),
        ...(discount_price !== undefined && { discount_price: String(discount_price) })
    }

    try {
        await apiUpdateProduct(productId, payload)
        toast({
            title: 'Success',
            description: 'Product updated successfully!',
            variant: 'destructive'
        })
        router.push(RoutePath.AdminProductSub)
    } catch (error) {
        // --- FIXED CATCH BLOCK ---
        let errorMessage = 'An unexpected error occurred. Please try again.' // Default message

        toast({
            title: 'Error',
            description: errorMessage,
            variant: 'destructive'
        })
        // --- END OF FIX ---
    }
}

const handleCancel = () => {
    router.push(RoutePath.AdminProductSub)
}

const handleFileUpload = async (event: Event) => {
    const target = event.target as HTMLInputElement
    if (!target.files || target.files.length === 0) {
        toast({
            title: 'Vui lòng chọn ảnh để upload!',
            description: 'Bạn chưa chọn file ảnh.',
            variant: 'destructive',
            class: 'bg-yellow-50 text-yellow-900 border-yellow-300'
        })
        return
    }
    const file = target.files[0]
    try {
        const resp = await apiUploadProductImage(productId, file)
        mediaUrl.value = resp.image_url
        toast({
            title: 'Upload thành công!',
            description: 'Ảnh sản phẩm đã được cập nhật.',
            variant: 'default',
            class: 'bg-emerald-50 text-emerald-900 border-emerald-300'
        })
    } catch (error) {
        toast({
            title: 'Upload thất bại!',
            description: 'Không thể upload ảnh. Vui lòng thử lại.',
            variant: 'destructive',
            class: 'bg-red-50 text-red-900 border-red-300'
        })
    }
}

const getStatusColor = (statusValue: string) => {
    switch (statusValue) {
        case 'published':
            return 'bg-green-500'
        case 'draft':
            return 'bg-gray-500'
        case 'scheduled':
            return 'bg-blue-500'
        default:
            return 'bg-gray-500'
    }
}
onMounted(async () => {
    if (productId) {
        const resp = await apiGetProduct(productId)
        const product = resp.data
        productName.value = product.name || ''
        description.value = product.description || ''
        basePrice.value = product.price || ''
        mediaUrl.value = product.image_url || ''
        currencyCode.value = product.currency_code || ''
        discountPrice.value = product.discount_price || ''
    }
})
</script>

<template>
    <div class="flex flex-col lg:flex-row gap-6 p-6 bg-slate-50 min-h-screen w-full">
        <!-- Left Sidebar -->
        <div class="w-full lg:w-80 flex flex-col gap-5 flex-shrink-0">
            <!-- Status Section -->
            <ProductStatusForm v-model="status" :options="statusOptions" />

            <!-- Product Details Section -->
            <Card>
                <CardHeader>
                    <CardTitle class="text-base">Product Details</CardTitle>
                </CardHeader>
                <CardContent class="space-y-4">
                    <div class="space-y-2">
                        <Label class="text-sm font-medium">Categories</Label>
                        <Select v-model="category">
                            <SelectTrigger>
                                <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem
                                    v-for="option in categoryOptions"
                                    :key="option.value"
                                    :value="option.value"
                                >
                                    {{ option.label }}
                                </SelectItem>
                            </SelectContent>
                        </Select>
                        <p class="text-xs text-muted-foreground">Add product to a category.</p>
                    </div>
                    <Button variant="outline" class="w-full justify-center gap-2">
                        <Plus class="w-4 h-4" />
                        Create new category
                    </Button>
                </CardContent>
            </Card>

            <!-- Product Template Section -->
            <Card>
                <CardHeader>
                    <CardTitle class="text-base">Product Template</CardTitle>
                </CardHeader>
                <CardContent class="space-y-3">
                    <Select v-model="template">
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
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
                    <p class="text-xs text-muted-foreground leading-relaxed">
                        Assign a template from your current theme to define how a single product is
                        displayed.
                    </p>
                </CardContent>
            </Card>
        </div>

        <!-- Main Content -->
        <Card class="flex-1 flex flex-col min-h-[calc(100vh-3rem)]">
            <Tabs v-model="activeTab" class="flex flex-col h-full">
                <TabsList
                    class="grid w-full grid-cols-2 rounded-none border-b bg-transparent h-auto p-0"
                >
                    <TabsTrigger
                        value="general"
                        class="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary py-4"
                    >
                        General
                    </TabsTrigger>
                    <TabsTrigger
                        value="advanced"
                        class="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary py-4"
                    >
                        Advanced
                    </TabsTrigger>
                </TabsList>

                <div class="flex-1 overflow-y-auto">
                    <TabsContent value="general" class="p-6 space-y-8 mt-0">
                        <h2 class="text-xl font-semibold">General</h2>

                        <!-- Product Name -->
                        <div class="space-y-2">
                            <Label class="text-sm font-medium">
                                Product Name <span class="text-destructive">*</span>
                            </Label>
                            <Input
                                v-model="productName"
                                placeholder="Product name"
                                class="w-full"
                            />
                            <p class="text-xs text-muted-foreground">
                                A product name is required and recommended to be unique.
                            </p>
                        </div>

                        <!-- Description -->
                        <div class="space-y-2">
                            <Label class="text-sm font-medium">Description</Label>
                            <div class="border border-input rounded-lg overflow-hidden">
                                <div class="flex items-center gap-1 p-2 bg-muted border-b">
                                    <Button variant="ghost" size="sm" class="h-8 px-3 text-xs">
                                        Normal
                                    </Button>
                                    <div class="w-px h-4 bg-border mx-1"></div>
                                    <Button variant="ghost" size="sm" class="h-8 w-8 p-0">
                                        <Bold class="w-3 h-3" />
                                    </Button>
                                    <Button variant="ghost" size="sm" class="h-8 w-8 p-0">
                                        <Italic class="w-3 h-3" />
                                    </Button>
                                    <Button variant="ghost" size="sm" class="h-8 w-8 p-0">
                                        <Underline class="w-3 h-3" />
                                    </Button>
                                    <Button variant="ghost" size="sm" class="h-8 w-8 p-0">
                                        <Link class="w-3 h-3" />
                                    </Button>
                                    <Button variant="ghost" size="sm" class="h-8 w-8 p-0">
                                        <List class="w-3 h-3" />
                                    </Button>
                                </div>
                                <Textarea
                                    v-model="description"
                                    placeholder="Type your text here..."
                                    :rows="6"
                                    class="border-0 rounded-none resize-none focus-visible:ring-0"
                                />
                                <!-- Media -->
                                <div class="space-y-2">
                                    <Label class="text-sm font-medium">Media</Label>
                                    <div
                                        class="border-2 border-dashed border-muted-foreground/25 rounded-lg p-16 text-center bg-muted/50 hover:border-primary hover:bg-primary/5 transition-colors cursor-pointer relative"
                                    >
                                        <CloudUpload class="w-10 h-10 text-primary mx-auto mb-4" />
                                        <p class="text-sm text-muted-foreground">
                                            <strong>Drop files here or click to upload.</strong
                                            ><br />
                                            Upload up to 10 files
                                        </p>
                                        <input
                                            type="file"
                                            @change="handleFileUpload"
                                            class="absolute inset-0 opacity-0 cursor-pointer"
                                        />
                                        <div v-if="mediaUrl" class="mt-4 flex justify-center">
                                            <img
                                                :src="mediaUrl"
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
                            <div class="border border-input rounded-lg p-6 bg-muted/50 space-y-6">
                                <div class="space-y-2">
                                    <Label class="text-sm font-medium">
                                        Base Price <span class="text-destructive">*</span>
                                    </Label>
                                    <Input v-model="basePrice" placeholder="Product price" />
                                    <p class="text-xs text-muted-foreground">
                                        Set the product price.
                                    </p>
                                </div>

                                <div class="space-y-3">
                                    <Label class="text-sm font-medium">Discount Type</Label>
                                    <RadioGroup v-model="discountType" class="flex flex-wrap gap-8">
                                        <div class="flex items-center space-x-2">
                                            <RadioGroupItem value="no-discount" id="no-discount" />
                                            <Label for="no-discount" class="text-sm"
                                                >No Discount</Label
                                            >
                                        </div>
                                        <div class="flex items-center space-x-2">
                                            <RadioGroupItem value="percentage" id="percentage" />
                                            <Label for="percentage" class="text-sm"
                                                >Percentage %</Label
                                            >
                                        </div>
                                        <div class="flex items-center space-x-2">
                                            <RadioGroupItem value="fixed" id="fixed" />
                                            <Label for="fixed" class="text-sm">Fixed Price</Label>
                                        </div>
                                    </RadioGroup>
                                </div>

                                <div v-if="discountType !== 'no-discount'" class="space-y-2">
                                    <Label class="text-sm font-medium">Discount Value</Label>
                                    <Input
                                        v-model="discountValue"
                                        :placeholder="
                                            discountType === 'percentage'
                                                ? 'Percentage'
                                                : 'Fixed amount'
                                        "
                                    />
                                    <p class="text-xs text-muted-foreground">
                                        Set the discount
                                        {{
                                            discountType === 'percentage' ? 'percentage' : 'amount'
                                        }}.
                                    </p>
                                    <div v-if="discountType === 'fixed'" class="space-y-2">
                                        <Label class="text-sm font-medium">Discount Price</Label>
                                        <Input
                                            v-model="discountPrice"
                                            placeholder="Discount price"
                                        />
                                        <p class="text-xs text-muted-foreground">
                                            Discounted price for the product.
                                        </p>
                                        <Label class="text-sm font-medium">Currency Code</Label>
                                        <Input
                                            v-model="currencyCode"
                                            placeholder="Currency code (e.g. VND, USD)"
                                        />
                                        <p class="text-xs text-muted-foreground">
                                            Currency for product price.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Additional Product Information -->
                        <div class="space-y-4">
                            <Label class="text-sm font-medium">Additional Information</Label>
                            <div class="border border-input rounded-lg p-6 bg-muted/50 space-y-6">
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div class="space-y-2">
                                        <Label class="text-sm font-medium">SKU</Label>
                                        <Input placeholder="Product SKU" />
                                        <p class="text-xs text-muted-foreground">
                                            Stock Keeping Unit for inventory tracking.
                                        </p>
                                    </div>
                                    <div class="space-y-2">
                                        <Label class="text-sm font-medium">Barcode</Label>
                                        <Input placeholder="Product barcode" />
                                        <p class="text-xs text-muted-foreground">
                                            Product barcode for scanning.
                                        </p>
                                    </div>
                                </div>
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div class="space-y-2">
                                        <Label class="text-sm font-medium">Weight (kg)</Label>
                                        <Input placeholder="0.00" />
                                        <p class="text-xs text-muted-foreground">
                                            Product weight for shipping calculations.
                                        </p>
                                    </div>
                                    <div class="space-y-2">
                                        <Label class="text-sm font-medium"
                                            >Dimensions (L×W×H cm)</Label
                                        >
                                        <Input placeholder="0×0×0" />
                                        <p class="text-xs text-muted-foreground">
                                            Product dimensions for shipping.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="advanced" class="p-6 space-y-8 mt-0">
                        <div>
                            <h2 class="text-xl font-semibold mb-2">Advanced</h2>
                            <p class="text-muted-foreground">
                                Advanced product settings and configurations.
                            </p>
                        </div>

                        <!-- SEO Settings -->
                        <div class="space-y-4">
                            <Label class="text-sm font-medium">SEO Settings</Label>
                            <div class="border border-input rounded-lg p-6 bg-muted/50 space-y-6">
                                <div class="space-y-2">
                                    <Label class="text-sm font-medium">Meta Title</Label>
                                    <Input placeholder="SEO meta title" />
                                    <p class="text-xs text-muted-foreground">
                                        Title that appears in search engine results.
                                    </p>
                                </div>
                                <div class="space-y-2">
                                    <Label class="text-sm font-medium">Meta Description</Label>
                                    <Textarea :rows="3" placeholder="SEO meta description" />
                                    <p class="text-xs text-muted-foreground">
                                        Description that appears in search engine results.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <!-- Inventory Settings -->
                        <div class="space-y-4">
                            <Label class="text-sm font-medium">Inventory Settings</Label>
                            <div class="border border-input rounded-lg p-6 bg-muted/50">
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div class="space-y-2">
                                        <Label class="text-sm font-medium">Stock Quantity</Label>
                                        <Input type="number" placeholder="0" />
                                        <p class="text-xs text-muted-foreground">
                                            Current stock quantity.
                                        </p>
                                    </div>
                                    <div class="space-y-2">
                                        <Label class="text-sm font-medium"
                                            >Low Stock Threshold</Label
                                        >
                                        <Input type="number" placeholder="5" />
                                        <p class="text-xs text-muted-foreground">
                                            Alert when stock falls below this number.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </TabsContent>
                </div>

                <!-- Action Buttons -->
                <ActionButtons
                    :onCancel="handleCancel"
                    :onSave="handleSave"
                    cancelText="Cancel"
                    saveText="Save Changes"
                />
            </Tabs>
        </Card>
    </div>
</template>
