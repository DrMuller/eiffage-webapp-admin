<template>
    <div class="min-h-screen flex items-center justify-center bg-blue-50">
        <div class="p-8 bg-white rounded-lg shadow-sm">
            <div class="mb-8 text-center">
                <!-- <img src="/logo.webp" alt="Eiffage" class="w-10 h-10 mb-6"> -->
                <h1 class="text-3xl font-bold">Récupération de compte</h1>
                <p class="text-sm text-gray-500 mt-2">
                    Entrez votre adresse email pour réinitialiser votre mot de passe
                </p>
            </div>

            <form @submit.prevent="onSubmit">
                <div class="mb-6">
                    <label for="email" class="block mb-2 text-gray-700">Adresse email</label>
                    <input id="email" v-model="formState.email" type="email" required
                        placeholder="exemple@entreprise.com"
                        class="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                </div>

                <div v-if="errorMessage" class="mb-4 text-red-500 text-sm">
                    {{ errorMessage }}
                </div>

                <button type="submit" :disabled="isLoading || !isEmailValid"
                    class="w-full py-3 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed">
                    {{ isLoading ? 'Envoi en cours...' : 'Envoyer un lien de réinitialisation' }}
                </button>

                <div class="mt-6 text-center">
                    <p class="text-sm text-gray-600">
                        <NuxtLink to="/auth/signin" class="text-blue-600 hover:underline">
                            Retour à la connexion
                        </NuxtLink>
                    </p>
                </div>
            </form>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
const { $api } = useNuxtApp()
const emit = defineEmits<{
    'request-success': [email: string];
}>();

const isLoading = ref(false);
const errorMessage = ref('');

const formState = reactive({
    email: ''
});

const isEmailValid = computed(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(formState.email);
});

const onSubmit = async () => {
    if (!isEmailValid.value) return;

    try {
        isLoading.value = true;

        await $api('/auth/reset-password-token', {
            method: 'POST',
            body: {
                email: formState.email,
            }
        });

        // Success - emit event with the email
        emit('request-success', formState.email);

    } catch (error) {
        console.error('Failed to request password reset:', error);
        errorMessage.value = 'Erreur lors de la demande de réinitialisation. Veuillez réessayer.';
    } finally {
        isLoading.value = false;
    }
};
</script>