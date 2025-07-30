<script setup lang="ts">
import { Check } from 'lucide-vue-next'
import { computed } from 'vue'

const props = defineProps<{
    checked: boolean | 'indeterminate'
    disabled?: boolean
}>()

const emit = defineEmits(['change'])

const classes = computed(() => {
    return 'peer h-4 w-4 shrink-0 rounded-sm border border-emerald-300 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-emerald-600 data-[state=checked]:text-white'
})

const handleChange = (event: Event) => {
    emit('change', (event.target as HTMLInputElement).checked)
}
</script>

<template>
    <input
        type="checkbox"
        :checked="checked === true"
        :class="classes"
        :disabled="disabled"
        @change="handleChange"
        :data-state="
            checked === true
                ? 'checked'
                : checked === 'indeterminate'
                  ? 'indeterminate'
                  : 'unchecked'
        "
    />
    <Check v-if="checked === true" class="h-4 w-4 text-white pointer-events-none absolute" />
    <div
        v-if="checked === 'indeterminate'"
        class="h-1 w-2 bg-white pointer-events-none absolute"
    ></div>
</template>

<style scoped>
/* For indeterminate state, a simple line */
[data-state='indeterminate'] {
    display: flex;
    align-items: center;
    justify-content: center;
}
[data-state='indeterminate'] div {
    transform: translateY(-1px); /* Adjust position if needed */
}
</style>
