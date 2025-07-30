<script setup lang="ts">
import { cn } from '@/lib/utils'
import type { HTMLAttributes } from 'vue'

const props = defineProps<{
    class?: HTMLAttributes['class']
}>()
</script>

<template>
    <div
        data-slot="table-container"
        class="relative w-full overflow-auto border border-emerald-100 rounded-lg"
    >
        <table
            data-slot="table"
            :class="
                cn('w-full caption-bottom text-sm border-separate border-spacing-0', props.class)
            "
        >
            <slot />
        </table>
    </div>
</template>
