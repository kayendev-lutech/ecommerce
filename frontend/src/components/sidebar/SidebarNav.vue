<script setup lang="ts">
import { PlusCircle, Tag } from 'lucide-vue-next'
import SidebarMenuItem from './SidebarMenuItem.vue'
import SidebarSubMenu from './SidebarSubMenu.vue'

const props = defineProps<{
    isCollapsed: boolean
    selectedKeys: string[]
}>()

const emit = defineEmits(['select'])

const handleSelect = (event: { key: string }) => {
    emit('select', event)
}
</script>

<template>
    <nav class="flex-1 overflow-y-auto overflow-x-hidden py-5">
        <ul class="flex flex-col gap-1">
            <SidebarSubMenu
                title="Product"
                :icon="Tag"
                :is-collapsed="isCollapsed"
                :selected-keys="selectedKeys"
                menu-key="/admin/product"
                @select="handleSelect"
            >
                <template #default="{ handleChildSelect }">
                    <SidebarMenuItem
                        to="/admin/tab"
                        :is-active="selectedKeys.includes('/admin/product')"
                        :is-collapsed="isCollapsed"
                        is-submenu-item
                        @click="handleChildSelect('/admin/product')"
                    >
                        <template #icon>
                            <PlusCircle class="h-4 w-4" />
                        </template>
                        <template #title>
                            <span>View Product</span>
                        </template>
                    </SidebarMenuItem>
                    <SidebarMenuItem
                        to="/admin/product/create"
                        :is-active="selectedKeys.includes('/admin/product/create')"
                        :is-collapsed="isCollapsed"
                        is-submenu-item
                        @click="handleChildSelect('/admin/product/create')"
                    >
                        <template #icon>
                            <PlusCircle class="h-4 w-4" />
                        </template>
                        <template #title>
                            <span>Add Product</span>
                        </template>
                    </SidebarMenuItem>
                </template>
            </SidebarSubMenu>

            <SidebarSubMenu
                title="Category"
                :icon="Tag"
                :is-collapsed="isCollapsed"
                :selected-keys="selectedKeys"
                menu-key="/admin/category"
                @select="handleSelect"
            >
                <template #default="{ handleChildSelect }">
                    <SidebarMenuItem
                        to="/admin/category"
                        :is-active="selectedKeys.includes('/admin/category')"
                        :is-collapsed="isCollapsed"
                        is-submenu-item
                        @click="handleChildSelect('/admin/category')"
                    >
                        <template #icon>
                            <PlusCircle class="h-4 w-4" />
                        </template>
                        <template #title>
                            <span>View Category</span>
                        </template>
                    </SidebarMenuItem>
                    <SidebarMenuItem
                        to="/admin/category/create"
                        :is-active="selectedKeys.includes('/admin/category/create')"
                        :is-collapsed="isCollapsed"
                        is-submenu-item
                        @click="handleChildSelect('/admin/category/create')"
                    >
                        <template #icon>
                            <PlusCircle class="h-4 w-4" />
                        </template>
                        <template #title>
                            <span>Add Category</span>
                        </template>
                    </SidebarMenuItem>
                </template>
            </SidebarSubMenu>
        </ul>
    </nav>
</template>

<style scoped>
/* Custom scrollbar for webkit browsers */
.overflow-y-auto::-webkit-scrollbar {
    width: 4px;
}
.overflow-y-auto::-webkit-scrollbar-track {
    background: transparent;
}
.overflow-y-auto::-webkit-scrollbar-thumb {
    background: rgba(34, 197, 94, 0.2);
    border-radius: 2px;
}
.overflow-y-auto::-webkit-scrollbar-thumb:hover {
    background: rgba(34, 197, 94, 0.3);
}
</style>
