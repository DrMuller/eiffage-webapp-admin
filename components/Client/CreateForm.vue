<template>
    <form class="px-8 pb-8" @submit.prevent="onSubmit">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label for="companyName" class="block text-sm font-medium mb-1">Nom de l'entreprise<span
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
                <label for="contactName" class="block text-sm font-medium mb-1">Nom/Prénom du contact <span
                        class="text-red-500">*</span></label>
                <UInput id="contactName" v-model="clientData.contactName" placeholder="John Doe" required
                    class="w-full" />
            </div>

            <div>
                <label for="contactEmail" class="block text-sm font-medium mb-1">Email du contact <span
                        class="text-red-500">*</span></label>
                <UInput id="contactEmail" v-model="clientData.contactEmail" placeholder="john.doe@gmail.com"
                    class="w-full" type="email" required title="Veuillez entrer une adresse email valide" />
            </div>
        </div>

        <div class="mt-6">
            <label class="block text-sm font-medium mb-1">Logo</label>
            <div class="border border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center transition-colors duration-200"
                :class="{ 'border-blue-500 bg-blue-50': isDragging }" @dragover.prevent="isDragging = true"
                @dragleave.prevent="isDragging = false" @drop.prevent="handleDrop">
                <template v-if="!selectedLogo">
                    <UIcon name="i-heroicons-document" class="w-8 h-8 text-blue-500 mb-2" />
                    <div class="text-center">
                        <button type="button" class="text-blue-500 font-medium hover:text-blue-600 transition-colors"
                            @click="triggerFileInput">Cliquez pour
                            charger</button>
                        <span class="text-gray-500"> ou glisser-déposez</span>
                        <p class="text-gray-500 text-xs mt-1">(Max. Taille Fichier: 25 MB)</p>
                    </div>
                </template>
                <template v-else>
                    <div class="flex items-center gap-3">
                        <UIcon name="i-heroicons-document" class="w-6 h-6 text-blue-500" />
                        <span class="text-sm text-gray-700 truncate max-w-[200px]">{{ selectedLogo.name }}</span>
                        <button type="button" class="text-red-500 hover:text-red-600 transition-colors"
                            @click="removeFile">
                            <UIcon name="i-heroicons-x-mark" class="w-5 h-5" />
                        </button>
                    </div>
                </template>
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
    initialLogo?: File | null
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
const selectedLogo = ref<File | null>(props.initialLogo || null)
const fileInput = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)

// Trigger file input click
const triggerFileInput = () => {
    fileInput.value?.click()
}

// Handle logo file upload
const handleLogoUpload = (event: Event) => {
    const target = event.target as HTMLInputElement
    if (target.files && target.files.length > 0) {
        const file = target.files[0]
        if (file.size <= 25 * 1024 * 1024) { // 25MB in bytes
            selectedLogo.value = file
        } else {
            alert('Le fichier est trop volumineux. Taille maximum: 25 MB')
        }
    }
}

// Handle file drop
const handleDrop = (event: DragEvent) => {
    isDragging.value = false
    const files = event.dataTransfer?.files
    if (files && files.length > 0) {
        const file = files[0]
        if (file.type.startsWith('image/')) {
            if (file.size <= 25 * 1024 * 1024) { // 25MB in bytes
                selectedLogo.value = file
            } else {
                alert('Le fichier est trop volumineux. Taille maximum: 25 MB')
            }
        } else {
            alert('Veuillez sélectionner un fichier image valide')
        }
    }
}

// Remove selected file
const removeFile = () => {
    selectedLogo.value = null
    if (fileInput.value) {
        fileInput.value.value = ''
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