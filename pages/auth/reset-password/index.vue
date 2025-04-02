<template>
    <div>
        <AuthResetPasswordForm :token="token" @password-reset-success="onResetSuccess" />
    </div>
</template>

<script setup lang="ts">
import { ref, onBeforeMount } from 'vue';

const route = useRoute();
const token = ref('');
const isInvalidToken = ref(false);
definePageMeta({
    layout: 'empty'
});
useHead({
    title: 'Réinitialiser le mot de passe | Eiffage'
});

// Add this to handle both client and server rendering
onBeforeMount(() => {
    if (import.meta.client) {
        token.value = route.query.token as string;

        // Token validation logic
        if (!token.value || token.value.length < 32) {
            isInvalidToken.value = true;
        }
    }
});

const onResetSuccess = () => {
    // We'll let the component navigate to the login page
    console.log('Password reset successful');
};
</script>