<script setup lang="ts">
import { ChevronDown } from 'lucide-vue-next'
import { computed, useSlots } from 'vue'

const slots = useSlots()
const props = defineProps<{
    to?: string
    isActive?: boolean
    isCollapsed?: boolean
    isSubmenuItem?: boolean
    hasSubmenu?: boolean
    isSubmenuOpen?: boolean
}>()

const emit = defineEmits(['click'])

const hasIcon = computed(() => !!slots.icon)
const hasTitle = computed(() => !!slots.title)

const itemClasses = computed(() => [
    'relative flex items-center transition-all duration-300 ease-in-out',
    'rounded-xl mx-3 my-1 p-3 min-h-[44px]',
    'hover:bg-emerald-50 hover:translate-x-0.5',
    props.isActive
        ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg shadow-emerald-500/30'
        : 'text-gray-700',
    props.isSubmenuItem ? 'pl-6 min-h-[40px] rounded-lg mx-2 my-0.5' : ''
])

const iconWrapperClasses = computed(() => [
    'flex items-center justify-center flex-shrink-0',
    props.isCollapsed
        ? 'w-10 h-10 rounded-xl shadow-md shadow-emerald-500/20 bg-emerald-600 text-white'
        : 'w-5 h-5 text-emerald-700',
    props.isActive && !props.isCollapsed ? 'text-white' : '',
    'transition-all duration-300 ease-in-out'
])

const titleClasses = computed(() => [
    'flex-1 font-medium transition-all duration-300 ease-in-out',
    props.isActive ? 'text-white font-semibold' : 'text-gray-800',
    props.isCollapsed ? 'hidden' : '',
    props.isSubmenuItem ? 'text-sm' : 'text-base'
])

const submenuArrowClasses = computed(() => [
    'ml-auto transition-transform duration-300 ease-in-out',
    props.isSubmenuOpen ? 'rotate-180' : '',
    props.isActive ? 'text-white' : 'text-emerald-600',
    props.isCollapsed ? 'hidden' : ''
])

const handleClick = () => {
    emit('click')
}
</script>

<template>
    <li :class="itemClasses">
        <component
            :is="to ? 'router-link' : 'button'"
            :to="to"
            @click="handleClick"
            class="flex w-full items-center gap-3 text-left"
            :class="{ 'justify-center': isCollapsed, 'px-3': !isCollapsed, 'py-2': !isCollapsed }"
        >
            <div :class="iconWrapperClasses" v-if="hasIcon">
                <slot name="icon" />
            </div>
            <span :class="titleClasses" v-if="hasTitle">
                <slot name="title" />
            </span>
            <ChevronDown :class="submenuArrowClasses" v-if="hasSubmenu" />
        </component>
        <div
            v-if="isActive"
            class="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-emerald-400 to-green-500 rounded-r-md transform scale-y-100 transition-transform duration-300 ease-in-out"
        ></div>
    </li>
</template>

<style scoped>
/* Specific styles for the active indicator */
li.ant-menu-item-selected::before {
    transform: scaleY(1);
}
</style>
