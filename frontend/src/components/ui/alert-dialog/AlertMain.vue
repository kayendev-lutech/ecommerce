<script setup lang="ts">
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from '@/components/ui/alert-dialog'

import { ref, watch } from 'vue'

const props = defineProps<{
    open: boolean
    title?: string
    description?: string
}>()

const emit = defineEmits<{
    (e: 'update:open', value: boolean): void
    (e: 'cancel'): void
    (e: 'confirm'): void
}>()

const localOpen = ref(props.open)

watch(
    () => props.open,
    (val) => {
        localOpen.value = val
    }
)

watch(localOpen, (val) => {
    if (val !== props.open) {
        emit('update:open', val)
    }
}) // <-- Fixed missing parenthesis here

const handleCancel = () => {
    emit('cancel')
    localOpen.value = false
}

const handleConfirm = () => {
    emit('confirm')
    localOpen.value = false
}
</script>

<template>
    <AlertDialog v-model:open="localOpen">
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>{{
                    props.title || 'Are you sure you want to delete?'
                }}</AlertDialogTitle>
                <AlertDialogDescription>
                    {{
                        props.description ||
                        'This action cannot be undone. The product will be permanently deleted.'
                    }}
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel @click="handleCancel">Cancel</AlertDialogCancel>
                <AlertDialogAction
                    @click="handleConfirm"
                    class="bg-red-500 text-white hover:bg-red-600"
                >
                    Delete
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
</template>
