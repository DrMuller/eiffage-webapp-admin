<template>
    <div>
        <!-- Part 1: Recherche -->
        <UCard>
            <template #header>
                <div class="flex items-center justify-between">
                    <div class="text-lg font-medium">Recherche</div>
                    <div class="flex gap-2">
                        <UButton color="secondary" variant="solid" @click="submitSearch">Rechercher</UButton>
                        <UButton icon="i-heroicons-x-mark" color="neutral" variant="soft" :loading="loading"
                            @click="handleReset">
                            Réinitialiser
                        </UButton>
                    </div>
                </div>
            </template>
            <div class="p-4 mt-4 max-w-[800px]">
                <div class="grid grid-cols-12 gap-4">
                    <!-- Row 1: 10 / 2 -->
                    <UFormField label="Rechercher (nom, email, matricule, rôle)" class="col-span-10">
                        <UInput v-model="searchQuery" placeholder="Rechercher (nom, email, matricule, rôle)"
                            class="w-full" @keyup.enter="submitSearch" />
                    </UFormField>
                    <UFormField label="Sexe" class="col-span-2">
                        <USelect v-model="selectedGender" :items="genderOptions" :value-key="'value'" class="w-full"
                            placeholder="Sexe" />
                    </UFormField>

                    <!-- Row 2: 6 / 6 -->
                    <UFormField label="Âge" class="col-span-6">
                        <div class="w-full">
                            <div class="text-xs text-gray-600 mb-2">
                                {{ ageRange[0] }} - {{ ageRange[1] }}
                            </div>
                            <USlider v-model="ageRange" color="info" :min="AGE_MIN" :max="AGE_MAX" :step="1" />
                        </div>
                    </UFormField>
                    <UFormField label="Ancienneté" class="col-span-6">
                        <div class="w-full">
                            <div class="text-xs text-gray-600 mb-2">
                                {{ seniorityRange[0] }} - {{ seniorityRange[1] }}
                            </div>
                            <USlider v-model="seniorityRange" color="info" :min="SENIORITY_MIN" :max="SENIORITY_MAX"
                                :step="0.5" />
                        </div>
                    </UFormField>

                    <!-- Row 3: 6 / 6 -->
                    <UFormField label="Etablissement" class="col-span-6">
                        <UInput v-model="establishmentName" placeholder="ex: (Lauterbourg|Velizy)" class="w-full"
                            @keyup.enter="submitSearch" />
                    </UFormField>
                    <UFormField label="Emplois" class="col-span-6">
                        <USelectMenu v-model="selectedJobIds" :items="jobsOptions" :value-key="'value'" multiple
                            searchable searchable-placeholder="Filtrer par emplois..." class="w-full"
                            placeholder="Emplois" />
                    </UFormField>
                </div>
            </div>
            <div class="p-4">
                <UButton color="secondary" variant="soft" icon="i-heroicons-plus" @click="isModalOpen = true">
                    Ajouter des compétences
                </UButton>
            </div>
            <div v-if="selectedSkillFilters.length > 0" class="flex flex-col gap-2 p-4">
                <div class="text-sm text-gray-600">Compétences sélectionnées et minimum requis</div>
                <div class="">
                    <div v-for="sel in selectedSkillFilters" :key="sel.skillId" class="flex gap-2 rounded pb-1">
                        <UButton icon="i-heroicons-x-mark" color="neutral" variant="soft"
                            @click="removeSelectedSkill(sel.skillId)" />
                        <USelect v-model="sel.minLevel" :items="levelOptions" :value-key="'value'" placeholder="Niveau"
                            class="w-[300px]" />
                        <div class="text-sm w-full border border-gray-300 bg-gray-50 rounded-md p-2">
                            {{ sel.name }}
                        </div>
                    </div>
                </div>
            </div>
            <template #footer>
                <div class="flex gap-2 justify-end">
                    <UButton color="secondary" variant="solid" @click="submitSearch">Rechercher</UButton>
                    <UButton icon="i-heroicons-x-mark" color="neutral" variant="soft" :loading="loading"
                        @click="handleReset">
                        Réinitialiser
                    </UButton>
                </div>
            </template>
        </UCard>

        <!-- Modal: Sélection de Compétences -->
        <UModal v-model:open="isModalOpen" title="Sélection des Compétences">
            <template #body>
                <div class="p-6 flex flex-col gap-2">
                    <UFormField label="Emplois">
                        <USelectMenu v-model="modalSelectedJobIds" class="w-full" :items="jobsOptions"
                            :value-key="'value'" multiple searchable searchable-placeholder="Filtrer par emplois..."
                            placeholder="Emplois (filtre compétences)" />
                    </UFormField>
                    <UFormField label="Types de Macro Compétence">
                        <USelectMenu v-model="selectedMacroSkillTypeIds" :items="macroSkillTypeOptions"
                            :value-key="'value'" multiple searchable class="w-full"
                            placeholder="Types de Macro Compétence" />
                    </UFormField>
                    <UFormField label="Macro Compétences">
                        <USelectMenu v-model="selectedMacroSkillIds" :items="macroSkillOptions" :value-key="'value'"
                            multiple searchable class="w-full" placeholder="Macro Compétences" />
                    </UFormField>
                    <UFormField label="Compétences">
                        <USelectMenu v-model="selectedSkillIds" :items="filteredSkillsOptions" :value-key="'value'"
                            multiple searchable searchable-placeholder="Filtrer par compétences..." class="w-full"
                            :placeholder="`Compétences (${filteredSkillsOptions.length})`"
                            :ui="{ itemLabel: 'overflow-visible text-ellipsis whitespace-wrap' }" />
                    </UFormField>
                    <div class="flex justify-start">
                        <UButton color="neutral" variant="soft" size="sm" icon="i-heroicons-check-circle"
                            :disabled="filteredSkillsOptions.length === 0" @click="selectAllFilteredSkills">
                            Tout sélectionner ({{ filteredSkillsOptions.length }})
                        </UButton>
                    </div>
                    <div class="flex gap-2 justify-end mt-4">
                        <UButton color="neutral" variant="outline" @click="isModalOpen = false">
                            Annuler
                        </UButton>
                        <UButton color="secondary" variant="solid" :disabled="selectedSkillIds.length === 0"
                            @click="addSkillsToSelection">
                            Ajouter {{ selectedSkillIds.length }} compétences à la recherche
                        </UButton>
                    </div>
                </div>
            </template>
        </UModal>
    </div>

</template>

<script setup lang="ts">
import { computed, watch } from 'vue'

const AGE_MIN = 16
const AGE_MAX = 70
const SENIORITY_MIN = 0
const SENIORITY_MAX = 50

const emit = defineEmits<{
    (e: 'search', payload: {
        q?: string;
        jobIds?: string[];
        skills?: Array<{ skillId: string; minLevel: number }>;
        gender?: 'MALE' | 'FEMALE';
        establishmentName?: string;
        ageMin?: number;
        ageMax?: number;
        seniorityMin?: number;
        seniorityMax?: number;
    }): void
}>()

const _props = defineProps<{ loading?: boolean }>()

// Composables (self-contained data)
const { jobs, getJobs } = useJobs()
const { skills, macroSkills, macroSkillTypes, getSkills, getMacroSkills, getMacroSkillTypes } = useSkills()

// Local state
const searchQuery = ref('')
const establishmentName = ref('')
const selectedJobIds = ref<string[]>([])
const ageRange = ref<[number, number]>([AGE_MIN, AGE_MAX])
const selectedGender = ref<'MALE' | 'FEMALE' | undefined>(undefined)
const seniorityRange = ref<[number, number]>([SENIORITY_MIN, SENIORITY_MAX])
const selectedSkillIds = ref<string[]>([])
const selectedMacroSkillTypeIds = ref<string[]>([])
const selectedMacroSkillIds = ref<string[]>([])
const selectedSkillFilters = ref<Array<{ skillId: string; name: string; minLevel: number }>>([])
const isModalOpen = ref(false)

// Modal-specific state (for filtering skills in modal only)
const modalSelectedJobIds = ref<string[]>([])

// Options
const jobsOptions = computed(() => jobs.value.map((j) => ({ label: j.name, value: j._id })))
const genderOptions = computed(() => ([
    { label: 'Tous', value: undefined },
    { label: 'H', value: 'MALE' },
    { label: 'F', value: 'FEMALE' }
] as Array<{ label: string; value: 'MALE' | 'FEMALE' | undefined }>))
const skillsOptions = computed(() => skills.value.map((s) => ({ label: s.name, value: s._id })))
const macroSkillTypeOptions = computed(() => macroSkillTypes.value.map((t) => ({ label: t.name, value: t._id })))
const macroSkillOptions = computed(() => {
    const list = selectedMacroSkillTypeIds.value.length
        ? macroSkills.value.filter(ms => selectedMacroSkillTypeIds.value.includes(ms.macroSkillTypeId))
        : macroSkills.value
    return list.map(ms => ({ label: ms.name, value: ms._id }))
})
const levelOptions = computed(() => [1, 2, 3, 4].map(v => ({ label: useSkillLevelLabel(v), value: v })))

// Watch modal job selection to filter selected skills
watch(modalSelectedJobIds, (ids) => {
    if (ids.length > 0) {
        selectedSkillIds.value = selectedSkillIds.value.filter(skillId => {
            const skill = skills.value.find(s => s._id === skillId)
            return !!skill && skill.jobIds?.some(jobId => ids.includes(jobId))
        })
    }
})

watch(selectedMacroSkillTypeIds, (typeIds) => {
    if (typeIds.length > 0) {
        selectedMacroSkillIds.value = selectedMacroSkillIds.value.filter(msId => {
            const ms = macroSkills.value.find(m => m._id === msId)
            return !!ms && typeIds.includes(ms.macroSkillTypeId)
        })
        selectedSkillIds.value = selectedSkillIds.value.filter(id => {
            const skill = skills.value.find(s => s._id === id)
            return !!skill && typeIds.includes(skill.macroSkill.macroSkillTypeId)
        })
    }
})

watch(selectedMacroSkillIds, (macroIds) => {
    if (macroIds.length > 0) {
        selectedSkillIds.value = selectedSkillIds.value.filter(id => {
            const skill = skills.value.find(s => s._id === id)
            return !!skill && macroIds.includes(skill.macroSkillId)
        })
    }
})

// Clear modal state when modal is closed
watch(isModalOpen, (isOpen) => {
    if (!isOpen) {
        selectedSkillIds.value = []
        modalSelectedJobIds.value = []
        selectedMacroSkillTypeIds.value = []
        selectedMacroSkillIds.value = []
    }
})

const filteredSkillsOptions = computed(() => {
    let opts = skillsOptions.value
    if (modalSelectedJobIds.value.length > 0) {
        opts = opts.filter(opt => {
            const skill = skills.value.find(s => s._id === opt.value)
            return !!skill && skill.jobIds?.some(jobId => modalSelectedJobIds.value.includes(jobId))
        })
    }
    if (selectedMacroSkillTypeIds.value.length > 0) {
        const typeIdSet = new Set(selectedMacroSkillTypeIds.value)
        opts = opts.filter(opt => {
            const skill = skills.value.find(s => s._id === opt.value)
            return !!skill && typeIdSet.has(skill.macroSkill.macroSkillTypeId)
        })
    }
    if (selectedMacroSkillIds.value.length > 0) {
        const macroIdSet = new Set(selectedMacroSkillIds.value)
        opts = opts.filter(opt => {
            const skill = skills.value.find(s => s._id === opt.value)
            return !!skill && macroIdSet.has(skill.macroSkillId)
        })
    }
    return opts
})

function selectAllFilteredSkills() {
    selectedSkillIds.value = filteredSkillsOptions.value.map(opt => opt.value)
}

function addSkillsToSelection() {
    if (!selectedSkillIds.value.length) return
    const existingIds = new Set(selectedSkillFilters.value.map(s => s.skillId))
    const additions = selectedSkillIds.value
        .filter(id => !existingIds.has(id))
        .map(id => {
            const skill = skills.value.find(s => s._id === id)
            return { skillId: id, name: skill?.name || id, minLevel: 3 }
        })
    if (additions.length) {
        selectedSkillFilters.value = [...selectedSkillFilters.value, ...additions]
    }
    // Close modal (watch will clear modal state)
    isModalOpen.value = false
}

function removeSelectedSkill(skillId: string) {
    selectedSkillFilters.value = selectedSkillFilters.value.filter(s => s.skillId !== skillId)
}

function submitSearch() {
    const trimmed = searchQuery.value.trim()
    const jobIds = selectedJobIds.value
    const skillsPayload = selectedSkillFilters.value.map(s => ({ skillId: s.skillId, minLevel: s.minLevel }))
    const ageMin = ageRange.value[0]
    const ageMax = ageRange.value[1]
    const seniorityMin = seniorityRange.value[0]
    const seniorityMax = seniorityRange.value[1]

    const isAgeDefault = ageMin === AGE_MIN && ageMax === AGE_MAX
    const isSeniorityDefault = seniorityMin === SENIORITY_MIN && seniorityMax === SENIORITY_MAX
    emit('search', {
        q: trimmed || undefined,
        establishmentName: establishmentName.value.trim() || undefined,
        jobIds: jobIds.length ? jobIds : undefined,
        skills: skillsPayload.length ? skillsPayload : undefined,
        gender: selectedGender.value || undefined,
        ageMin: isAgeDefault ? undefined : ageMin,
        ageMax: isAgeDefault ? undefined : ageMax,
        seniorityMin: isSeniorityDefault ? undefined : seniorityMin,
        seniorityMax: isSeniorityDefault ? undefined : seniorityMax,
    })
}

function handleReset() {
    searchQuery.value = ''
    establishmentName.value = ''
    selectedJobIds.value = []
    ageRange.value = [AGE_MIN, AGE_MAX]
    selectedGender.value = undefined
    seniorityRange.value = [SENIORITY_MIN, SENIORITY_MAX]
    selectedSkillIds.value = []
    selectedMacroSkillTypeIds.value = []
    selectedMacroSkillIds.value = []
    selectedSkillFilters.value = []
    submitSearch()
}

onMounted(async () => {
    await Promise.all([
        getJobs(),
        getMacroSkillTypes(),
        getMacroSkills(),
        getSkills()
    ])
})

</script>
