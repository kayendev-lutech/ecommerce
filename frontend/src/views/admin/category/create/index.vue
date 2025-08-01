<script setup lang="ts">
import { apiCreateCategory } from '@/api/category/category.api'
import router, { RoutePath } from '@/router'
import { Icon } from '@iconify/vue'
import { ref } from 'vue'

const categoryName = ref('')
const description = ref('')
const status = ref('published')
const storeTemplate = ref('default')
const metaTagTitle = ref('')
const metaTagDescription = ref('')
const metaTagKeywords = ref('')
const productAssignmentMethod = ref('manual')
const slug = ref('')

const statusOptions = [
    { value: 'published', label: 'Published', color: 'green' },
    { value: 'draft', label: 'Draft', color: 'gray' },
    { value: 'scheduled', label: 'Scheduled', color: 'blue' }
]

const storeTemplateOptions = [
    { value: 'default', label: 'Default template' },
    { value: 'minimal', label: 'Minimal template' },
    { value: 'detailed', label: 'Detailed template' }
]

const handleSave = async () => {
    try {
        await apiCreateCategory({
            name: categoryName.value,
            slug: slug.value,
            description: description.value,
            parent_id: null // hoặc null nếu không có danh mục cha
        })
        window.$niceAlert?.success?.('Tạo danh mục thành công!')
        router.push(RoutePath.AdminCategorySub)
    } catch (e) {
        window.$niceAlert?.error?.('Tạo danh mục thất bại!')
    }
}

const handleCancel = () => {
    router.push(RoutePath.AdminCategorySub)
}

const handleThumbnailUpload = (event: Event) => {
    const target = event.target as HTMLInputElement
    if (target.files && target.files[0]) {
        console.log('Thumbnail uploaded:', target.files[0])
    }
}
</script>

<template>
    <div class="category-form-container">
        <!-- Left Sidebar -->
        <div class="sidebar">
            <!-- Thumbnail Section -->
            <div class="sidebar-section">
                <h3 class="section-title">Thumbnail</h3>
                <div class="thumbnail-upload">
                    <div class="upload-placeholder">
                        <Icon icon="ph:image-duotone" class="upload-icon" />
                        <p class="upload-text">
                            Set the category thumbnail image. Only *.png, *.jpg and *.jpeg image
                            files are accepted
                        </p>
                        <input
                            type="file"
                            @change="handleThumbnailUpload"
                            class="file-input"
                            accept=".png,.jpg,.jpeg"
                        />
                    </div>
                    <button class="edit-thumbnail-btn">
                        <Icon icon="ph:pencil-simple-duotone" />
                    </button>
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
                <p class="status-help">Set the category status.</p>
            </div>

            <!-- Store Template Section -->
            <div class="sidebar-section">
                <h3 class="section-title">Store Template</h3>
                <select v-model="storeTemplate" class="form-select">
                    <option
                        v-for="option in storeTemplateOptions"
                        :key="option.value"
                        :value="option.value"
                    >
                        {{ option.label }}
                    </option>
                </select>
                <p class="form-help">
                    Assign a template from your current theme to define how the category products
                    are displayed.
                </p>
            </div>
        </div>

        <!-- Main Content -->
        <div class="main-content">
            <!-- General Section -->
            <div class="main-content-section">
                <h2 class="panel-title">General</h2>

                <div class="form-group">
                    <label class="form-label required">Category Name</label>
                    <input
                        v-model="categoryName"
                        type="text"
                        class="form-input"
                        placeholder="Product name"
                    />
                    <p class="form-help">
                        A category name is required and recommended to be unique.
                    </p>
                </div>

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
                        <button class="toolbar-btn"><Icon icon="ph:code" /></button>
                    </div>
                    <textarea
                        v-model="description"
                        class="form-textarea"
                        placeholder="Type your text here..."
                        rows="6"
                    ></textarea>
                    <p class="form-help">
                        Set a description to the category for better visibility.
                    </p>
                </div>
            </div>

            <!-- Meta Options Section -->
            <div class="main-content-section">
                <h2 class="panel-title">Meta Options</h2>

                <div class="form-group">
                    <label class="form-label">Slug</label>
                    <input
                        v-model="metaTagTitle"
                        type="text"
                        class="form-input"
                        placeholder="Meta tag name"
                    />
                    <p class="form-help">
                        Set a slug title. Recommended to be simple and precise keywords.
                    </p>
                </div>

                <div class="form-group">
                    <label class="form-label">Meta Tag Keywords</label>
                    <input
                        v-model="metaTagKeywords"
                        type="text"
                        class="form-input"
                        placeholder="Enter keywords..."
                    />
                    <p class="form-help">
                        Set a list of keywords that the category is related to. Separate the
                        keywords by adding a comma (,) between each keyword.
                    </p>
                </div>
            </div>

            <!-- Action Buttons -->
            <div class="action-buttons">
                <button @click="handleCancel" class="btn-cancel">Cancel</button>
                <button @click="handleSave" class="btn-save">Save Changes</button>
            </div>
        </div>
    </div>
</template>

<style lang="less" scoped>
.category-form-container {
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
    position: relative;
    .upload-placeholder {
        border: 2px dashed #cbd5e1;
        border-radius: 8px;
        padding: 24px;
        text-align: center;
        background: #f8fafc;
        cursor: pointer;
        transition: all 0.2s ease;

        &:hover {
            border-color: #3b82f6;
            background: #f0f9ff;
        }

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

        .file-input {
            position: absolute;
            inset: 0;
            opacity: 0;
            cursor: pointer;
        }
    }

    .edit-thumbnail-btn {
        position: absolute;
        top: 10px;
        right: 10px;
        background: white;
        border: 1px solid #e2e8f0;
        border-radius: 50%;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        cursor: pointer;
        transition: all 0.2s ease;

        &:hover {
            background: #f1f5f9;
            border-color: #cbd5e1;
        }

        .iconify {
            font-size: 16px;
            color: #64748b;
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

.main-content-section {
    padding: 24px;
    border-bottom: 1px solid #e2e8f0;

    &:last-of-type {
        border-bottom: none;
    }
}

.panel-title {
    font-size: 20px;
    font-weight: 600;
    color: #1e293b;
    margin: 0 0 24px 0;
}

.form-group {
    margin-bottom: 32px;

    &:last-child {
        margin-bottom: 0;
    }
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

.radio-options {
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin-top: 12px;
}

.radio-option {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    cursor: pointer;

    .radio-input {
        width: 16px;
        height: 16px;
        margin-top: 4px; // Align with text
        flex-shrink: 0;
    }

    .radio-label {
        font-size: 14px;
        font-weight: 500;
        color: #374151;
    }

    .radio-help {
        font-size: 12px;
        color: #64748b;
        margin: 0;
        line-height: 1.4;
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
    .category-form-container {
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
}

@media (max-width: 768px) {
    .category-form-container {
        padding: 16px;
    }

    .sidebar {
        flex-direction: column;

        .sidebar-section {
            min-width: auto;
        }
    }

    .main-content-section {
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
