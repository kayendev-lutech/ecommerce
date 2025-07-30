<script setup lang="ts">
import { Bold, CloudUpload, Image, Italic, Link, List, Plus, Underline } from 'lucide-vue-next'
import { ref } from 'vue'

// Import shadcn/ui components
import { Button } from '@/components/ui/button'
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

// Reactive data
const activeTab = ref('general')
const productName = ref('')
const description = ref('')
const status = ref('published')
const category = ref('')
const basePrice = ref('')
const discountType = ref('no-discount')
const discountValue = ref('')
const taxClass = ref('')
const vatAmount = ref('')
const template = ref('default')

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

const handleSave = () => {
    console.log('Saving product...')
}

const handleCancel = () => {
    console.log('Navigating back...')
    // router.push(RoutePath.AdminProductSub)
}

const handleFileUpload = (event: Event) => {
    const target = event.target as HTMLInputElement
    if (target.files && target.files[0]) {
        console.log('File uploaded:', target.files[0])
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
</script>

<template>
    <div class="flex flex-col lg:flex-row gap-6 p-6 bg-slate-50 min-h-screen w-full">
        <!-- Left Sidebar -->
        <div class="w-full lg:w-80 flex flex-col gap-5 flex-shrink-0">
            <!-- Thumbnail Section -->
            <Card>
                <CardHeader>
                    <CardTitle class="text-base">Thumbnail</CardTitle>
                </CardHeader>
                <CardContent>
                    <div
                        class="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center bg-slate-50 hover:border-primary hover:bg-primary/5 transition-colors cursor-pointer"
                    >
                        <Image class="w-12 h-12 text-slate-400 mx-auto mb-3" />
                        <p class="text-xs text-slate-600 leading-relaxed">
                            Set the product thumbnail image. Only *.png, *.jpg and *.jpeg image
                            files are accepted
                        </p>
                    </div>
                </CardContent>
            </Card>

            <!-- Status Section -->
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
                                    v-for="option in statusOptions"
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
                            </div>
                            <p class="text-xs text-muted-foreground">
                                Set a description to the product for better visibility.
                            </p>
                        </div>

                        <!-- Media -->
                        <div class="space-y-2">
                            <Label class="text-sm font-medium">Media</Label>
                            <div
                                class="border-2 border-dashed border-muted-foreground/25 rounded-lg p-16 text-center bg-muted/50 hover:border-primary hover:bg-primary/5 transition-colors cursor-pointer relative"
                            >
                                <CloudUpload class="w-10 h-10 text-primary mx-auto mb-4" />
                                <p class="text-sm text-muted-foreground">
                                    <strong>Drop files here or click to upload.</strong><br />
                                    Upload up to 10 files
                                </p>
                                <input
                                    type="file"
                                    @change="handleFileUpload"
                                    multiple
                                    class="absolute inset-0 opacity-0 cursor-pointer"
                                />
                            </div>
                            <p class="text-xs text-muted-foreground">
                                Set the product media gallery.
                            </p>
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
                                </div>

                                <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div class="space-y-2">
                                        <Label class="text-sm font-medium">Tax Class</Label>
                                        <Select v-model="taxClass">
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select tax class" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="standard">Standard</SelectItem>
                                                <SelectItem value="reduced">Reduced</SelectItem>
                                                <SelectItem value="zero">Zero Rate</SelectItem>
                                                <SelectItem value="exempt">Exempt</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <p class="text-xs text-muted-foreground">
                                            Set the product tax class.
                                        </p>
                                    </div>
                                    <div class="space-y-2">
                                        <Label class="text-sm font-medium">VAT Amount (%)</Label>
                                        <Input v-model="vatAmount" placeholder="VAT amount" />
                                        <p class="text-xs text-muted-foreground">
                                            Set the product VAT amount.
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
                <div class="flex justify-end gap-3 p-6 border-t bg-muted/50">
                    <Button variant="outline" @click="handleCancel"> Cancel </Button>
                    <Button @click="handleSave"> Save Changes </Button>
                </div>
            </Tabs>
        </Card>
    </div>
</template>
