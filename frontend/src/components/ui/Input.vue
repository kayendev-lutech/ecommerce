<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
    modelValue: string | number
    type?: string
    placeholder?: string
}>()

const emit = defineEmits(['update:modelValue'])

const classes = computed(() => {
    return 'flex h-10 w-full rounded-md border border-emerald-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-emerald-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
})

const updateValue = (event: Event) => {
    emit('update:modelValue', (event.target as HTMLInputElement).value)
}
</script>

<template>
    <input
        :type="type || 'text'"
        :value="modelValue"
        :placeholder="placeholder"
        :class="classes"
        @input="updateValue"
    />
</template>
