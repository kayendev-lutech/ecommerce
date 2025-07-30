<script setup lang="ts">
import { Leaf, Menu, MenuSquare } from 'lucide-vue-next'
import { defineProps } from 'vue'

const props = defineProps<{
    isCollapsed: boolean
}>()

const emit = defineEmits(['toggleCollapse'])
</script>

<template>
    <div
        class="relative border-b border-emerald-100 bg-gradient-to-br from-white to-emerald-50 p-5"
    >
        <div v-if="!isCollapsed" class="mb-4 flex items-center gap-3">
            <div
                class="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 shadow-lg shadow-emerald-500/40 ring-4 ring-emerald-100"
            >
                <Leaf class="h-6 w-6 text-white" />
            </div>
            <div class="flex flex-col">
                <h2 class="text-xl font-bold tracking-tight text-emerald-900">Admin</h2>
                <p class="text-sm font-medium text-emerald-700">Panel</p>
            </div>
        </div>
        <button
            @click="emit('toggleCollapse')"
            class="w-full h-10 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg shadow-emerald-500/30 transition-all duration-300 ease-in-out hover:from-emerald-600 hover:to-green-700 hover:shadow-xl hover:shadow-emerald-600/40"
            :class="{ 'justify-center': isCollapsed, 'px-4': !isCollapsed }"
        >
            <component :is="isCollapsed ? Menu : MenuSquare" class="h-5 w-5 mx-auto" />
            <span v-if="!isCollapsed" class="sr-only">Toggle Sidebar</span>
        </button>
    </div>
</template>

<style scoped>
/* No additional scoped styles needed, Tailwind handles most of it */
</style>
