<script setup lang="ts">
import LanguageChanger from '@/components/LanguageChanger.vue'
import SidebarFooter from '@/components/sidebar/SidebarFooter.vue'
import SidebarHeader from '@/components/sidebar/SidebarHeader.vue'
import SidebarNav from '@/components/sidebar/SidebarNav.vue'
import CustomModal from '@/components/ui/CustomModal.vue'
import router, { RoutePath } from '@/router'
import { useAuthStore } from '@/stores/auth'
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const auth = useAuthStore()
const { t } = useI18n()

const selectedKeys = ref<string[]>([
    router.currentRoute.value.path, // Use path for consistent selection
    ...router.currentRoute.value.matched.map((route) => route.path)
])

const collapsed = ref<boolean>(false)
const showLogoutModal = ref<boolean>(false)

const handleCollapse = () => {
    collapsed.value = !collapsed.value
}

const handleSelect = (event: { key: string }) => {
    if (!event.key) return
    router.push(String(event.key))
}

const confirmLogout = () => {
    showLogoutModal.value = true
}

const handleLogout = async () => {
    await auth.logout()
    window.location.replace('/')
}

const handleGoHome = () => {
    router.push(RoutePath.Home)
}

// Watch for route changes to update selectedKeys
watch(
    () => router.currentRoute.value.path,
    (newPath) => {
        selectedKeys.value = [
            newPath,
            ...router.currentRoute.value.matched.map((route) => route.path)
        ]
    },
    { immediate: true }
)
</script>

<template>
    <div
        class="luxury-green-sidebar flex h-screen flex-col border-r-2 border-emerald-100 bg-gradient-to-b from-white to-emerald-50 shadow-lg shadow-emerald-200/20 transition-all duration-300 ease-in-out"
        :class="{ 'w-16': collapsed, 'w-64': !collapsed }"
    >
        <div
            class="absolute left-0 right-0 top-0 h-1 bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-400"
        ></div>

        <SidebarHeader :is-collapsed="collapsed" @toggle-collapse="handleCollapse" />

        <div v-if="!collapsed" class="border-b border-emerald-100 p-5">
            <LanguageChanger
                class-name="w-full rounded-xl border-2 border-emerald-100 bg-white shadow-sm hover:border-emerald-500 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-200"
            />
        </div>

        <SidebarNav
            :is-collapsed="collapsed"
            :selected-keys="selectedKeys"
            @select="handleSelect"
        />

        <SidebarFooter :is-collapsed="collapsed" @go-home="handleGoHome" @logout="confirmLogout" />

        <CustomModal
            :show="showLogoutModal"
            :title="t('admin.sidebar.logout.prompt')"
            :message="t('admin.sidebar.logout.confirm_message')"
            :ok-text="t('admin.sidebar.logout.ok')"
            :cancel-text="t('admin.sidebar.logout.cancel')"
            centered
            @confirm="handleLogout"
            @cancel="showLogoutModal = false"
            @update:show="showLogoutModal = $event"
        />
    </div>
</template>

<style scoped>
/* No additional scoped styles needed, Tailwind handles most of it */
</style>
