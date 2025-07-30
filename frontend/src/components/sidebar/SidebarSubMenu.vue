<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import SidebarMenuItem from './SidebarMenuItem.vue'

const props = defineProps<{
    title: string
    icon: any // Lucide icon component
    isCollapsed: boolean
    selectedKeys: string[]
    menuKey: string
}>()

const emit = defineEmits(['select'])

const isOpen = ref(false)

// Watch for changes in selectedKeys to automatically open submenus if a child is selected
watch(
    () => props.selectedKeys,
    (newKeys) => {
        const hasSelectedChild = newKeys.some((key) => {
            // Check if any child route is part of the current submenu
            // This is a simplified check, might need more robust logic based on your router structure
            return key.startsWith(props.menuKey) && key !== props.menuKey
        })
        if (hasSelectedChild) {
            isOpen.value = true
        }
    },
    { immediate: true, deep: true }
)

const toggleSubmenu = () => {
    if (props.isCollapsed) {
        // In collapsed mode, maybe show a tooltip or a temporary popover instead of opening
        // For now, we'll prevent opening in collapsed mode to keep it simple
        return
    }
    isOpen.value = !isOpen.value
}

const handleChildSelect = (key: string) => {
    emit('select', { key })
}

const isSubmenuActive = computed(() => {
    return props.selectedKeys.some((key) => key.startsWith(props.menuKey))
})
</script>

<template>
    <li class="relative">
        <SidebarMenuItem
            :is-active="isSubmenuActive"
            :is-collapsed="isCollapsed"
            :has-submenu="true"
            :is-submenu-open="isOpen"
            @click="toggleSubmenu"
            :menu-key="menuKey"
        >
            <template #icon>
                <component :is="icon" class="h-5 w-5" />
            </template>
            <template #title>
                <span>{{ title }}</span>
            </template>
        </SidebarMenuItem>

        <ul
            v-if="isOpen && !isCollapsed"
            class="ml-8 mt-1 mb-2 rounded-lg border border-emerald-100 bg-emerald-50 py-1"
        >
            <slot :handleChildSelect="handleChildSelect" />
        </ul>
    </li>
</template>

<style scoped>
/* No additional scoped styles needed, Tailwind handles most of it */
</style>
