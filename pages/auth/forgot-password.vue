<template>
    <div>
        <AuthForgotPasswordForm v-if="!emailSent" @request-success="onRequestSuccess" />
        <AuthResetPasswordRequestedForm v-else :email="requestedEmail" />
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
definePageMeta({ layout: 'empty' })
useHead({
    title: 'Mot de passe oublié | Eiffage'
});

const emailSent = ref(false);
const requestedEmail = ref('');

const onRequestSuccess = (email: string) => {
    requestedEmail.value = email;
    emailSent.value = true;
};
</script>