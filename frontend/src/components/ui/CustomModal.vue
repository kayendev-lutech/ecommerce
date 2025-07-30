<script setup lang="ts">
import { X } from 'lucide-vue-next'
import { defineEmits, defineProps } from 'vue'

const props = defineProps<{
    show: boolean
    title: string
    message: string
    okText?: string
    cancelText?: string
    centered?: boolean
}>()

const emit = defineEmits(['confirm', 'cancel', 'update:show'])

const handleConfirm = () => {
    emit('confirm')
    emit('update:show', false)
}

const handleCancel = () => {
    emit('cancel')
    emit('update:show', false)
}
</script>

<template>
    <div
        v-if="show"
        class="fixed inset-0 z-[999] flex items-center justify-center bg-black bg-opacity-50 p-4"
    >
        <div
            class="relative w-full max-w-md rounded-lg bg-white p-6 shadow-xl transition-all duration-300 ease-out"
            :class="{ 'my-8': centered }"
        >
            <div class="flex items-center justify-between border-b pb-3">
                <h3 class="text-lg font-semibold text-gray-900">{{ title }}</h3>
                <button @click="handleCancel" class="text-gray-400 hover:text-gray-600">
                    <X class="h-5 w-5" />
                </button>
            </div>
            <div class="py-4 text-gray-700">
                <p>{{ message }}</p>
            </div>
            <div class="flex justify-end space-x-3 border-t pt-4">
                <button
                    @click="handleCancel"
                    class="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                    {{ cancelText || 'Cancel' }}
                </button>
                <button
                    @click="handleConfirm"
                    class="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                >
                    {{ okText || 'OK' }}
                </button>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* No additional scoped styles needed, Tailwind handles most of it */
</style>
