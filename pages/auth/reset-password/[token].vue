<template>
    <div>
        <AuthResetPasswordForm :token="token" @password-reset-success="onResetSuccess" />
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

const route = useRoute();
const token = ref('');
const isInvalidToken = ref(false);
definePageMeta({
    layout: 'empty'
});
useHead({
    title: 'Réinitialiser le mot de passe | Futurz'
});

onMounted(() => {
    token.value = route.params.token as string;

    // TODO: Validate the token with an API call
    // This would be a call to check if the token is valid
    // For now, we'll assume the token is valid if it's at least 32 characters long
    if (!token.value || token.value.length < 32) {
        isInvalidToken.value = true;
    }
});

const onResetSuccess = () => {
    // We'll let the component navigate to the login page
    console.log('Password reset successful');
};
</script>