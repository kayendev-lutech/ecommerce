<script setup lang="ts">
import { Button } from '@/components/ui/button'

const props = defineProps<{
    cancelText?: string
    saveText?: string
}>()

const emit = defineEmits<{
    (e: 'cancel'): void
    (e: 'save'): void
}>()
</script>

<template>
    <div class="flex justify-end gap-3 p-6 border-t bg-muted/50">
        <Button variant="outline" @click="emit('cancel')">
            {{ props.cancelText || 'Cancel' }}
        </Button>
        <Button class="bg-emerald-400 text-white hover:bg-emerald-700" @click="emit('save')">
            {{ props.saveText || 'Save Changes' }}
        </Button>
    </div>
</template>
