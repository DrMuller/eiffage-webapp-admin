<template>
    <form class="px-8 pb-8" @submit.prevent="onSubmit">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label for="companyName" class="block text-sm font-medium mb-1">Entreprise cliente <span
                        class="text-red-500">*</span></label>
                <UInput id="companyName" v-model="clientData.companyName" placeholder="Acme" required class="w-full" />
            </div>

            <div>
                <label for="siren" class="block text-sm font-medium mb-1">SIREN <span
                        class="text-red-500">*</span></label>
                <UInput id="siren" v-model="clientData.siren" placeholder="242 424 242" required class="w-full"
                    pattern="^\d{9}$" title="Le SIREN doit contenir exactement 9 chiffres" />
            </div>

            <div>
                <label for="contactName" class="block text-sm font-medium mb-1">Nom/Prenom client <span
                        class="text-red-500">*</span></label>
                <UInput id="contactName" v-model="clientData.contactName" placeholder="John Doe" required
                    class="w-full" />
            </div>

            <div>
                <label for="contactEmail" class="block text-sm font-medium mb-1">Email client <span
                        class="text-red-500">*</span></label>
                <UInput id="contactEmail" v-model="clientData.contactEmail" placeholder="john.doe@gmail.com"
                    class="w-full" type="email" required title="Veuillez entrer une adresse email valide" />
            </div>
        </div>

        <div class="mt-6">
            <label class="block text-sm font-medium mb-1">Logo client</label>
            <div class="border border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center">
                <UIcon name="i-heroicons-document" class="w-8 h-8 text-blue-500 mb-2" />
                <div class="text-center">
                    <button type="button" class="text-blue-500 font-medium" @click="triggerFileInput">Cliquez pour
                        charger</button>
                    <span class="text-gray-500"> ou glisser-déposez</span>
                    <p class="text-gray-500 text-xs mt-1">(Max. Taille Fichier: 25 MB)</p>
                </div>
                <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="handleLogoUpload">
            </div>
        </div>

        <div class="flex justify-end mt-6">
            <UButton type="submit" color="primary" :disabled="loading">
                Étape suivante
                <UIcon name="i-heroicons-arrow-right" class="w-4 h-4 ml-1" />
            </UButton>
        </div>
    </form>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'

const props = defineProps<{
    initialData?: {
        companyName: string
        contactName: string
        contactEmail: string
        siren: string
    }
    loading?: boolean
}>()

const emit = defineEmits<{
    next: [data: {
        clientData: {
            companyName: string
            contactName: string
            contactEmail: string
            siren: string
        },
        logo: File | null
    }]
}>()

// Client data form
const clientData = reactive({
    companyName: props.initialData?.companyName || '',
    contactName: props.initialData?.contactName || '',
    contactEmail: props.initialData?.contactEmail || '',
    siren: props.initialData?.siren || ''
})

// Logo handling
const selectedLogo = ref<File | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)

// Trigger file input click
const triggerFileInput = () => {
    fileInput.value?.click()
}

// Handle logo file upload
const handleLogoUpload = (event: Event) => {
    const target = event.target as HTMLInputElement
    if (target.files && target.files.length > 0) {
        selectedLogo.value = target.files[0]
    }
}

// Submit function
const onSubmit = async () => {
    emit('next', {
        clientData,
        logo: selectedLogo.value
    })
}
</script>