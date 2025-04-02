<template>
    <div class="min-h-screen flex items-center justify-center bg-blue-50">

        <div class="p-8 bg-white rounded-lg shadow-sm">
            <div class="mb-8 text-center">>
                <!-- <img src="/logo.webp" alt="Eiffage" class="w-10 h-10 mb-6"> -->
                <h1 class="text-3xl font-bold">Réinitialisation de mot de passe</h1>
            </div>

            <div class="text-center">
                <div class="mb-6">
                    <Icon name="material-symbols-light:mark-email-unread-outline-rounded"
                        class="text-primary-500 h-16 w-16 mx-auto mb-4" />
                    <p class="text-gray-700 mb-2">Un email de réinitialisation a été envoyé à :</p>
                    <p class="font-medium">{{ email }}</p>
                </div>

                <div class="text-sm text-gray-600 mb-6">
                    <p>Veuillez vérifier votre boîte de réception et suivre les instructions pour réinitialiser votre
                        mot de passe.</p>
                    <p class="mt-2">L'email peut prendre quelques minutes pour arriver. Pensez à vérifier vos spams.</p>
                </div>

                <button
                    class="w-full py-3 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    @click="navigateToLogin">
                    Retourner à la page de connexion
                </button>

                <div class="mt-4 text-sm text-center">
                    <p>
                        Vous n'avez pas reçu l'email ?
                        <button class="text-blue-600 hover:underline focus:outline-none" @click="resendEmail">
                            Renvoyer
                        </button>
                    </p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
const { $api } = useNuxtApp()
const props = defineProps<{
    email: string;
}>();

const router = useRouter();

const navigateToLogin = () => {
    router.push('/auth/signin');
};

const resendEmail = async () => {
    await $api('/auth/reset-password-token', {
        method: 'POST',
        body: {
            email: props.email,
        }
    });
};
</script>