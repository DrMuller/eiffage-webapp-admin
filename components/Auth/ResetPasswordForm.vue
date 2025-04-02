<template>
    <div class="min-h-screen flex items-center justify-center bg-blue-50">
        <div class="p-8 bg-white rounded-lg shadow-sm">
            <div class="mb-8 text-center">
                <!-- <img src="/logo.webp" alt="Eiffage" class="w-10 h-10 mb-6"> -->
                <h1 class="text-3xl font-bold">Créer un nouveau mot de passe</h1>
                <p class="text-sm text-gray-500 mt-2">
                    Veuillez entrer votre nouveau mot de passe ci-dessous
                </p>
            </div>

            <form @submit.prevent="onSubmit">
                <div class="mb-6">
                    <label for="password" class="block mb-2 text-gray-700">Nouveau mot de passe</label>
                    <div class="relative">
                        <input id="password" v-model="formState.password" :type="showPassword ? 'text' : 'password'"
                            required placeholder="Entrez votre nouveau mot de passe" autocomplete="new-password"
                            class="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <button type="button" class="absolute inset-y-0 right-0 flex items-center px-3 text-gray-600"
                            @click="showPassword = !showPassword">
                            <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24"
                                stroke="currentColor">
                                <path v-if="!showPassword" stroke-linecap="round" stroke-linejoin="round"
                                    stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path v-if="!showPassword" stroke-linecap="round" stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                <path v-if="showPassword" stroke-linecap="round" stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                            </svg>
                        </button>
                    </div>
                    <div class="text-xs space-y-1 mt-2">
                        <div class="flex items-center gap-1"
                            :class="passwordStrength.length >= 8 ? 'text-green-500' : 'text-gray-400'">
                            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24"
                                stroke="currentColor">
                                <path v-if="passwordStrength.length >= 8" stroke-linecap="round" stroke-linejoin="round"
                                    stroke-width="2" d="M5 13l4 4L19 7" />
                                <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            <span>Au moins 8 caractères</span>
                        </div>
                        <div class="flex items-center gap-1"
                            :class="passwordStrength.hasSpecial ? 'text-green-500' : 'text-gray-400'">
                            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24"
                                stroke="currentColor">
                                <path v-if="passwordStrength.hasSpecial" stroke-linecap="round" stroke-linejoin="round"
                                    stroke-width="2" d="M5 13l4 4L19 7" />
                                <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            <span>Au moins un caractère spécial</span>
                        </div>
                        <div class="flex items-center gap-1"
                            :class="passwordStrength.hasNumber ? 'text-green-500' : 'text-gray-400'">
                            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24"
                                stroke="currentColor">
                                <path v-if="passwordStrength.hasNumber" stroke-linecap="round" stroke-linejoin="round"
                                    stroke-width="2" d="M5 13l4 4L19 7" />
                                <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            <span>Au moins un chiffre</span>
                        </div>
                    </div>
                </div>

                <div class="mb-6">
                    <label for="confirmPassword" class="block mb-2 text-gray-700">Confirmer le mot de passe</label>
                    <input id="confirmPassword" v-model="formState.confirmPassword" type="password" required
                        placeholder="Confirmer votre nouveau mot de passe" autocomplete="new-password"
                        class="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                </div>

                <div v-if="errorMessage" class="mb-4 text-red-500 text-sm">
                    {{ errorMessage }}
                </div>

                <button type="submit" :disabled="isLoading || !isFormValid"
                    class="w-full py-3 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed">
                    {{ isLoading ? 'Réinitialisation en cours...' : 'Réinitialiser le mot de passe' }}
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
import { ref, computed, reactive, watch } from 'vue';
const { $api } = useNuxtApp()
const props = defineProps<{
    token: string;
}>();

const emit = defineEmits<{
    'password-reset-success': [];
}>();

const router = useRouter();
const showPassword = ref(false);
const isLoading = ref(false);
const errorMessage = ref('');

const formState = reactive({
    password: '',
    confirmPassword: ''
});

const passwordStrength = computed(() => {
    const password = formState.password;
    return {
        length: password.length,
        hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
        hasNumber: /\d/.test(password)
    };
});

const isPasswordValid = computed(() => {
    return passwordStrength.value.length >= 8 &&
        passwordStrength.value.hasSpecial &&
        passwordStrength.value.hasNumber;
});

const isFormValid = computed(() => {
    return isPasswordValid.value &&
        formState.password === formState.confirmPassword &&
        formState.confirmPassword.length > 0;
});

watch(() => formState.confirmPassword, (newVal) => {
    if (newVal && newVal !== formState.password) {
        errorMessage.value = 'Les mots de passe ne correspondent pas';
    } else {
        errorMessage.value = '';
    }
});

const onSubmit = async () => {
    if (!isFormValid.value) return;

    try {
        isLoading.value = true;
        await $api('/auth/reset-password', {
            method: 'POST',
            body: {
                token: props.token,
                password: formState.password
            }
        });
        emit('password-reset-success');
        router.push('/auth/signin');
    } catch (error) {
        console.error('Failed to reset password:', error);
        errorMessage.value = 'Erreur lors de la réinitialisation du mot de passe. Veuillez réessayer.';
    } finally {
        isLoading.value = false;
    }
};
</script>