<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
    variant?: 'default' | 'outline' | 'ghost' | 'destructive' | 'link'
    size?: 'default' | 'sm' | 'lg' | 'icon'
    asChild?: boolean
}>()

const emit = defineEmits(['click'])

const classes = computed(() => {
    const base =
        'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50'
    const variants = {
        default: 'bg-emerald-600 text-white hover:bg-emerald-700',
        outline: 'border border-emerald-200 bg-white hover:bg-emerald-50 hover:text-emerald-900',
        ghost: 'hover:bg-emerald-50 hover:text-emerald-900',
        destructive: 'bg-red-600 text-white hover:bg-red-700',
        link: 'text-emerald-600 underline-offset-4 hover:underline'
    }
    const sizes = {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10'
    }
    return [base, variants[props.variant || 'default'], sizes[props.size || 'default']]
})
</script>

<template>
    <component :is="asChild ? 'slot' : 'button'" :class="classes" @click="emit('click')">
        <slot />
    </component>
</template>
