<script setup lang="ts">
import router, { RoutePath } from '@/router'
import { Icon } from '@iconify/vue'
import { ref } from 'vue'
import { useRoute } from 'vue-router'
const route = useRoute()
const productId = route.params.id
interface Product {
    id: string
    name: string
    description: string
    status: string
    category: string
    tags: string
    basePrice: string
    discountType: string
    discountValue: string
    taxClass: string
    vatAmount: string
    template: string
    sku: string
    barcode: string
    weight: string
    dimensions: string
    metaTitle: string
    metaDescription: string
    stockQuantity: number
    lowStockThreshold: number
}

const props = defineProps<{
    product?: Product
}>()

const activeTab = ref('general')
const productName = ref(props.product?.name || '')
const description = ref(props.product?.description || '')
const status = ref(props.product?.status || 'published')
const category = ref(props.product?.category || '')
const tags = ref(props.product?.tags || '')
const basePrice = ref(props.product?.basePrice || '')
const discountType = ref(props.product?.discountType || 'no-discount')
const discountValue = ref(props.product?.discountValue || '')
const taxClass = ref(props.product?.taxClass || '')
const vatAmount = ref(props.product?.vatAmount || '')
const template = ref(props.product?.template || 'default')

// New refs for additional fields
const sku = ref(props.product?.sku || '')
const barcode = ref(props.product?.barcode || '')
const weight = ref(props.product?.weight || '')
const dimensions = ref(props.product?.dimensions || '')
const metaTitle = ref(props.product?.metaTitle || '')
const metaDescription = ref(props.product?.metaDescription || '')
const stockQuantity = ref(props.product?.stockQuantity || 0)
const lowStockThreshold = ref(props.product?.lowStockThreshold || 5)

const statusOptions = [
    { value: 'published', label: 'Published', color: 'green' },
    { value: 'draft', label: 'Draft', color: 'gray' },
    { value: 'scheduled', label: 'Scheduled', color: 'blue' }
]

const categoryOptions = [
    { value: '', label: 'Select an option' },
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
    router.push(RoutePath.AdminProductSub)
}

const handleFileUpload = (event: Event) => {
    const target = event.target as HTMLInputElement
    if (target.files && target.files[0]) {
        console.log('File uploaded:', target.files[0])
    }
}
</script>

<template>
    <div class="product-form-container">
        <!-- Left Sidebar -->
        <div class="sidebar">
            <!-- Thumbnail Section -->
            <div class="sidebar-section">
                <h3 class="section-title">Thumbnail</h3>
                <div class="thumbnail-upload">
                    <div class="upload-placeholder">
                        <Icon icon="ph:image-duotone" class="upload-icon" />
                        <p class="upload-text">
                            Set the product thumbnail image. Only *.png, *.jpg and *.jpeg image
                            files are accepted
                        </p>
                    </div>
                </div>
            </div>

            <!-- Status Section -->
            <div class="sidebar-section">
                <h3 class="section-title">Status</h3>
                <div class="status-container">
                    <div class="status-indicator" :class="`status-${status}`"></div>
                    <select v-model="status" class="status-select">
                        <option
                            v-for="option in statusOptions"
                            :key="option.value"
                            :value="option.value"
                        >
                            {{ option.label }}
                        </option>
                    </select>
                </div>
                <p class="status-help">Set the product status.</p>
            </div>

            <!-- Product Details Section -->
            <div class="sidebar-section">
                <h3 class="section-title">Product Details</h3>

                <div class="form-group">
                    <label class="form-label">Categories</label>
                    <select v-model="category" class="form-select">
                        <option
                            v-for="option in categoryOptions"
                            :key="option.value"
                            :value="option.value"
                        >
                            {{ option.label }}
                        </option>
                    </select>
                    <p class="form-help">Add product to a category.</p>
                </div>

                <button class="create-category-btn">
                    <Icon icon="ph:plus" class="btn-icon" />
                    Create new category
                </button>
            </div>

            <!-- Product Template Section -->
            <div class="sidebar-section">
                <h3 class="section-title">Product Template</h3>
                <select v-model="template" class="form-select">
                    <option
                        v-for="option in templateOptions"
                        :key="option.value"
                        :value="option.value"
                    >
                        {{ option.label }}
                    </option>
                </select>
                <p class="form-help">
                    Assign a template from your current theme to define how a single product is
                    displayed.
                </p>
            </div>
        </div>

        <!-- Main Content -->
        <div class="main-content">
            <!-- Tabs -->
            <div class="tabs-container">
                <button
                    @click="activeTab = 'general'"
                    :class="['tab-button', { active: activeTab === 'general' }]"
                >
                    General
                </button>
                <button
                    @click="activeTab = 'advanced'"
                    :class="['tab-button', { active: activeTab === 'advanced' }]"
                >
                    Advanced
                </button>
            </div>

            <!-- Tab Content -->
            <div class="tab-content">
                <div v-if="activeTab === 'general'" class="tab-panel">
                    <h2 class="panel-title">Edit Product: {{ productName || 'New Product' }}</h2>

                    <!-- Product Name -->
                    <div class="form-group">
                        <label class="form-label required">Product Name</label>
                        <input
                            v-model="productName"
                            type="text"
                            class="form-input"
                            placeholder="Product name"
                        />
                        <p class="form-help">
                            A product name is required and recommended to be unique.
                        </p>
                    </div>

                    <!-- Description -->
                    <div class="form-group">
                        <label class="form-label">Description</label>
                        <div class="editor-toolbar">
                            <button class="toolbar-btn">Normal</button>
                            <div class="toolbar-divider"></div>
                            <button class="toolbar-btn"><Icon icon="ph:text-b" /></button>
                            <button class="toolbar-btn"><Icon icon="ph:text-italic" /></button>
                            <button class="toolbar-btn"><Icon icon="ph:text-underline" /></button>
                            <button class="toolbar-btn"><Icon icon="ph:link" /></button>
                            <button class="toolbar-btn"><Icon icon="ph:list-bullets" /></button>
                        </div>
                        <textarea
                            v-model="description"
                            class="form-textarea"
                            placeholder="Type your text here..."
                            rows="6"
                        ></textarea>
                        <p class="form-help">
                            Set a description to the product for better visibility.
                        </p>
                    </div>

                    <!-- Media -->
                    <div class="form-group">
                        <label class="form-label">Media</label>
                        <div class="media-upload">
                            <div class="upload-area">
                                <Icon icon="ph:cloud-arrow-up" class="upload-area-icon" />
                                <p class="upload-area-text">
                                    <strong>Drop files here or click to upload.</strong><br />
                                    Upload up to 10 files
                                </p>
                                <input
                                    type="file"
                                    @change="handleFileUpload"
                                    class="file-input"
                                    multiple
                                />
                            </div>
                        </div>
                        <p class="form-help">Set the product media gallery.</p>
                    </div>

                    <!-- Pricing -->
                    <div class="form-group">
                        <label class="form-label">Pricing</label>

                        <div class="pricing-section">
                            <div class="form-row">
                                <div class="form-col">
                                    <label class="form-label required">Base Price</label>
                                    <input
                                        v-model="basePrice"
                                        type="text"
                                        class="form-input"
                                        placeholder="Product price"
                                    />
                                    <p class="form-help">Set the product price.</p>
                                </div>
                            </div>

                            <div class="form-row">
                                <label class="form-label">Discount Type</label>
                                <div class="discount-options">
                                    <label class="radio-option">
                                        <input
                                            type="radio"
                                            v-model="discountType"
                                            value="no-discount"
                                            class="radio-input"
                                        />
                                        <span class="radio-label">No Discount</span>
                                    </label>
                                    <label class="radio-option">
                                        <input
                                            type="radio"
                                            v-model="discountType"
                                            value="percentage"
                                            class="radio-input"
                                        />
                                        <span class="radio-label">Percentage %</span>
                                    </label>
                                    <label class="radio-option">
                                        <input
                                            type="radio"
                                            v-model="discountType"
                                            value="fixed"
                                            class="radio-input"
                                        />
                                        <span class="radio-label">Fixed Price</span>
                                    </label>
                                </div>
                            </div>

                            <div class="form-row" v-if="discountType !== 'no-discount'">
                                <div class="form-col">
                                    <label class="form-label">Discount Value</label>
                                    <input
                                        v-model="discountValue"
                                        type="text"
                                        class="form-input"
                                        :placeholder="
                                            discountType === 'percentage'
                                                ? 'Percentage'
                                                : 'Fixed amount'
                                        "
                                    />
                                    <p class="form-help">
                                        Set the discount
                                        {{
                                            discountType === 'percentage' ? 'percentage' : 'amount'
                                        }}.
                                    </p>
                                </div>
                            </div>

                            <div class="form-row">
                                <div class="form-col">
                                    <label class="form-label">Tax Class</label>
                                    <select v-model="taxClass" class="form-select">
                                        <option value="">Select an option</option>
                                        <option value="standard">Standard</option>
                                        <option value="reduced">Reduced</option>
                                        <option value="zero">Zero Rate</option>
                                        <option value="exempt">Exempt</option>
                                    </select>
                                    <p class="form-help">Set the product tax class.</p>
                                </div>
                                <div class="form-col">
                                    <label class="form-label">VAT Amount (%)</label>
                                    <input
                                        v-model="vatAmount"
                                        type="text"
                                        class="form-input"
                                        placeholder="VAT amount"
                                    />
                                    <p class="form-help">Set the product VAT amount.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Additional Product Information -->
                    <div class="form-group">
                        <label class="form-label">Additional Information</label>
                        <div class="additional-info-section">
                            <div class="form-row">
                                <div class="form-col">
                                    <label class="form-label">SKU</label>
                                    <input
                                        v-model="sku"
                                        type="text"
                                        class="form-input"
                                        placeholder="Product SKU"
                                    />
                                    <p class="form-help">
                                        Stock Keeping Unit for inventory tracking.
                                    </p>
                                </div>
                                <div class="form-col">
                                    <label class="form-label">Barcode</label>
                                    <input
                                        v-model="barcode"
                                        type="text"
                                        class="form-input"
                                        placeholder="Product barcode"
                                    />
                                    <p class="form-help">Product barcode for scanning.</p>
                                </div>
                            </div>

                            <div class="form-row">
                                <div class="form-col">
                                    <label class="form-label">Weight (kg)</label>
                                    <input
                                        v-model="weight"
                                        type="text"
                                        class="form-input"
                                        placeholder="0.00"
                                    />
                                    <p class="form-help">
                                        Product weight for shipping calculations.
                                    </p>
                                </div>
                                <div class="form-col">
                                    <label class="form-label">Dimensions (L×W×H cm)</label>
                                    <input
                                        v-model="dimensions"
                                        type="text"
                                        class="form-input"
                                        placeholder="0×0×0"
                                    />
                                    <p class="form-help">Product dimensions for shipping.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div v-if="activeTab === 'advanced'" class="tab-panel">
                    <h2 class="panel-title">Advanced</h2>
                    <p class="panel-description">Advanced product settings and configurations.</p>

                    <!-- SEO Settings -->
                    <div class="form-group">
                        <label class="form-label">SEO Settings</label>
                        <div class="seo-section">
                            <div class="form-row">
                                <div class="form-col">
                                    <label class="form-label">Meta Title</label>
                                    <input
                                        v-model="metaTitle"
                                        type="text"
                                        class="form-input"
                                        placeholder="SEO meta title"
                                    />
                                    <p class="form-help">
                                        Title that appears in search engine results.
                                    </p>
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-col">
                                    <label class="form-label">Meta Description</label>
                                    <textarea
                                        v-model="metaDescription"
                                        class="form-textarea"
                                        rows="3"
                                        placeholder="SEO meta description"
                                    ></textarea>
                                    <p class="form-help">
                                        Description that appears in search engine results.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Inventory Settings -->
                    <div class="form-group">
                        <label class="form-label">Inventory Settings</label>
                        <div class="inventory-section">
                            <div class="form-row">
                                <div class="form-col">
                                    <label class="form-label">Stock Quantity</label>
                                    <input
                                        v-model.number="stockQuantity"
                                        type="number"
                                        class="form-input"
                                        placeholder="0"
                                    />
                                    <p class="form-help">Current stock quantity.</p>
                                </div>
                                <div class="form-col">
                                    <label class="form-label">Low Stock Threshold</label>
                                    <input
                                        v-model.number="lowStockThreshold"
                                        type="number"
                                        class="form-input"
                                        placeholder="5"
                                    />
                                    <p class="form-help">
                                        Alert when stock falls below this number.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Action Buttons -->
            <div class="action-buttons">
                <button @click="handleCancel" class="btn-cancel">Cancel</button>
                <button @click="handleSave" class="btn-save">Update Product</button>
            </div>
        </div>
    </div>
</template>

<style lang="less" scoped>
.product-form-container {
    display: flex;
    gap: 24px;
    padding: 24px;
    background: #f8fafc;
    min-height: 100vh;
    width: 100%;
}

.sidebar {
    width: 320px;
    display: flex;
    flex-direction: column;
    gap: 20px;
    flex-shrink: 0;
}

.sidebar-section {
    background: white;
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    border: 1px solid #e2e8f0;
}

.section-title {
    font-size: 16px;
    font-weight: 600;
    color: #1e293b;
    margin: 0 0 16px 0;
}

.thumbnail-upload {
    .upload-placeholder {
        border: 2px dashed #cbd5e1;
        border-radius: 8px;
        padding: 24px;
        text-align: center;
        background: #f8fafc;

        .upload-icon {
            font-size: 48px;
            color: #94a3b8;
            margin-bottom: 12px;
        }

        .upload-text {
            font-size: 12px;
            color: #64748b;
            line-height: 1.4;
            margin: 0;
        }
    }
}

.status-container {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
}

.status-indicator {
    width: 8px;
    height: 8px;
    border-radius: 50%;

    &.status-published {
        background: #22c55e;
    }

    &.status-draft {
        background: #6b7280;
    }

    &.status-scheduled {
        background: #3b82f6;
    }
}

.status-select {
    flex: 1;
    padding: 8px 12px;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    background: white;
    font-size: 14px;
}

.status-help {
    font-size: 12px;
    color: #64748b;
    margin: 0;
}

.create-category-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 12px;
    background: transparent;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    color: #3b82f6;
    font-size: 14px;
    cursor: pointer;
    margin: 12px 0;
    width: 100%;
    justify-content: center;

    &:hover {
        background: #f8fafc;
    }

    .btn-icon {
        font-size: 16px;
    }
}

.sales-text {
    font-size: 12px;
    color: #64748b;
    line-height: 1.4;
    margin: 0;
}

.main-content {
    flex: 1;
    background: white;
    border-radius: 12px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    border: 1px solid #e2e8f0;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    min-height: calc(100vh - 48px);
}

.tabs-container {
    display: flex;
    border-bottom: 1px solid #e2e8f0;
    flex-shrink: 0;
}

.tab-button {
    padding: 16px 24px;
    background: transparent;
    border: none;
    font-size: 14px;
    font-weight: 500;
    color: #64748b;
    cursor: pointer;
    border-bottom: 2px solid transparent;
    transition: all 0.2s ease;

    &:hover {
        color: #1e293b;
    }

    &.active {
        color: #3b82f6;
        border-bottom-color: #3b82f6;
    }
}

.tab-content {
    flex: 1;
    padding: 24px;
    overflow-y: auto;
}

.panel-title {
    font-size: 20px;
    font-weight: 600;
    color: #1e293b;
    margin: 0 0 24px 0;
}

.panel-description {
    color: #64748b;
    margin: 0 0 24px 0;
}

.form-group {
    margin-bottom: 32px;
}

.form-label {
    display: block;
    font-size: 14px;
    font-weight: 500;
    color: #374151;
    margin-bottom: 6px;

    &.required::after {
        content: ' *';
        color: #ef4444;
    }
}

.form-input,
.form-select,
.form-textarea {
    width: 100%;
    padding: 12px 16px;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    font-size: 14px;
    transition: border-color 0.2s ease;

    &:focus {
        outline: none;
        border-color: #3b82f6;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    &::placeholder {
        color: #94a3b8;
    }
}

.form-textarea {
    resize: vertical;
    min-height: 120px;
}

.form-help {
    font-size: 12px;
    color: #64748b;
    margin: 6px 0 0 0;
}

.editor-toolbar {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 8px 12px;
    border: 1px solid #e2e8f0;
    border-bottom: none;
    border-radius: 8px 8px 0 0;
    background: #f8fafc;

    .toolbar-btn {
        padding: 6px 10px;
        background: transparent;
        border: none;
        border-radius: 4px;
        color: #64748b;
        cursor: pointer;
        font-size: 12px;

        &:hover {
            background: #e2e8f0;
        }
    }

    .toolbar-divider {
        width: 1px;
        height: 16px;
        background: #e2e8f0;
        margin: 0 4px;
    }
}

.media-upload {
    .upload-area {
        border: 2px dashed #cbd5e1;
        border-radius: 8px;
        padding: 60px 20px;
        text-align: center;
        background: #f8fafc;
        position: relative;
        cursor: pointer;
        transition: all 0.2s ease;

        &:hover {
            border-color: #3b82f6;
            background: #f0f9ff;
        }

        .upload-area-icon {
            font-size: 40px;
            color: #3b82f6;
            margin-bottom: 16px;
        }

        .upload-area-text {
            color: #64748b;
            margin: 0;
            font-size: 14px;
            line-height: 1.5;
        }

        .file-input {
            position: absolute;
            inset: 0;
            opacity: 0;
            cursor: pointer;
        }
    }
}

.pricing-section,
.additional-info-section,
.seo-section,
.inventory-section {
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 24px;
    background: #f8fafc;
}

.form-row {
    display: flex;
    gap: 20px;
    margin-bottom: 24px;

    &:last-child {
        margin-bottom: 0;
    }
}

.form-col {
    flex: 1;
}

.discount-options {
    display: flex;
    gap: 32px;
    margin-top: 12px;
    flex-wrap: wrap;
}

.radio-option {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;

    .radio-input {
        width: 16px;
        height: 16px;
        margin: 0;
    }

    .radio-label {
        font-size: 14px;
        color: #374151;
    }
}

.action-buttons {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    padding: 24px;
    border-top: 1px solid #e2e8f0;
    background: #f8fafc;
    flex-shrink: 0;
}

.btn-cancel {
    padding: 12px 24px;
    background: transparent;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    color: #64748b;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background: #f1f5f9;
        border-color: #cbd5e1;
    }
}

.btn-save {
    padding: 12px 24px;
    background: #3b82f6;
    border: none;
    border-radius: 8px;
    color: white;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background: #2563eb;
    }
}

@media (max-width: 1200px) {
    .product-form-container {
        flex-direction: column;
    }

    .sidebar {
        width: 100%;
        flex-direction: row;
        overflow-x: auto;
        gap: 16px;

        .sidebar-section {
            min-width: 280px;
            flex-shrink: 0;
        }
    }

    .form-row {
        flex-direction: column;
        gap: 16px;
    }

    .discount-options {
        flex-direction: column;
        gap: 12px;
    }
}

@media (max-width: 768px) {
    .product-form-container {
        padding: 16px;
    }

    .sidebar {
        flex-direction: column;

        .sidebar-section {
            min-width: auto;
        }
    }

    .tab-content {
        padding: 16px;
    }

    .action-buttons {
        padding: 16px;
        flex-direction: column;

        .btn-cancel,
        .btn-save {
            width: 100%;
        }
    }
}
</style>
