<script setup lang="ts">
import { Home, LogOut } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'
import SidebarMenuItem from './SidebarMenuItem.vue'

const { t } = useI18n()

const props = defineProps<{
    isCollapsed: boolean
}>()

const emit = defineEmits(['goHome', 'logout'])
</script>

<template>
    <div class="border-t border-emerald-100 bg-gradient-to-br from-emerald-50 to-emerald-100 py-5">
        <ul class="flex flex-col gap-1">
            <SidebarMenuItem
                to="/"
                :is-active="false"
                :is-collapsed="isCollapsed"
                @click="emit('goHome')"
            >
                <template #icon>
                    <Home class="h-5 w-5" />
                </template>
                <template #title>
                    <span>{{ t('admin.sidebar.back_home.title') }}</span>
                </template>
            </SidebarMenuItem>
            <SidebarMenuItem
                :is-active="false"
                :is-collapsed="isCollapsed"
                @click="emit('logout')"
                class="hover:bg-red-50 hover:text-red-700"
            >
                <template #icon>
                    <LogOut class="h-5 w-5 text-red-600 group-hover:text-red-700" />
                </template>
                <template #title>
                    <span class="text-red-600 group-hover:text-red-700">{{
                        t('admin.sidebar.logout.title')
                    }}</span>
                </template>
            </SidebarMenuItem>
        </ul>
    </div>
</template>

<style scoped>
/* No additional scoped styles needed, Tailwind handles most of it */
</style>
