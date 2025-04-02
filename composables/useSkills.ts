import { ref } from 'vue'
import type {
    MacroSkillType,
    CreateMacroSkillTypeRequest,
    MacroSkill,
    CreateMacroSkillRequest,
    Skill,
    CreateSkillRequest
} from '~/types/skills'

export const useSkills = () => {
    const { $api } = useNuxtApp()

    // State
    const macroSkillTypes = ref<MacroSkillType[]>([])
    const macroSkills = ref<MacroSkill[]>([])
    const skills = ref<Skill[]>([])
    const loading = ref(false)
    const error = ref<string | null>(null)

    // Macro Skill Types
    async function getMacroSkillTypes(): Promise<MacroSkillType[]> {
        loading.value = true
        error.value = null

        try {
            const response = await $api<MacroSkillType[]>('/macro-skill-types', {
                method: 'GET'
            })

            macroSkillTypes.value = response
            return response
        } catch (err) {
            error.value = err instanceof Error ? err.message : 'Failed to fetch macro skill types'
            throw err
        } finally {
            loading.value = false
        }
    }

    async function getMacroSkillTypeById(id: string): Promise<MacroSkillType> {
        loading.value = true
        error.value = null

        try {
            const response = await $api<MacroSkillType>(`/macro-skill-types/${id}`, {
                method: 'GET'
            })

            return response
        } catch (err) {
            error.value = err instanceof Error ? err.message : 'Failed to fetch macro skill type'
            throw err
        } finally {
            loading.value = false
        }
    }

    async function createMacroSkillType(data: CreateMacroSkillTypeRequest): Promise<MacroSkillType> {
        loading.value = true
        error.value = null

        try {
            const response = await $api<MacroSkillType>('/macro-skill-types', {
                method: 'POST',
                body: data
            })

            macroSkillTypes.value.push(response)
            return response
        } catch (err) {
            error.value = err instanceof Error ? err.message : 'Failed to create macro skill type'
            throw err
        } finally {
            loading.value = false
        }
    }

    // Macro Skills
    async function getMacroSkills(): Promise<MacroSkill[]> {
        loading.value = true
        error.value = null

        try {
            const response = await $api<MacroSkill[]>('/macro-skills', {
                method: 'GET'
            })

            macroSkills.value = response
            return response
        } catch (err) {
            error.value = err instanceof Error ? err.message : 'Failed to fetch macro skills'
            throw err
        } finally {
            loading.value = false
        }
    }

    async function getMacroSkillById(id: string): Promise<MacroSkill> {
        loading.value = true
        error.value = null

        try {
            const response = await $api<MacroSkill>(`/macro-skills/${id}`, {
                method: 'GET'
            })

            return response
        } catch (err) {
            error.value = err instanceof Error ? err.message : 'Failed to fetch macro skill'
            throw err
        } finally {
            loading.value = false
        }
    }

    async function createMacroSkill(data: CreateMacroSkillRequest): Promise<MacroSkill> {
        loading.value = true
        error.value = null

        try {
            const response = await $api<MacroSkill>('/macro-skills', {
                method: 'POST',
                body: data
            })

            macroSkills.value.push(response)
            return response
        } catch (err) {
            error.value = err instanceof Error ? err.message : 'Failed to create macro skill'
            throw err
        } finally {
            loading.value = false
        }
    }

    // Skills
    async function getSkills(): Promise<Skill[]> {
        loading.value = true
        error.value = null

        try {
            const response = await $api<Skill[]>('/skills', {
                method: 'GET'
            })

            skills.value = response
            return response
        } catch (err) {
            error.value = err instanceof Error ? err.message : 'Failed to fetch skills'
            throw err
        } finally {
            loading.value = false
        }
    }

    async function getSkillById(id: string): Promise<Skill> {
        loading.value = true
        error.value = null

        try {
            const response = await $api<Skill>(`/skills/${id}`, {
                method: 'GET'
            })

            return response
        } catch (err) {
            error.value = err instanceof Error ? err.message : 'Failed to fetch skill'
            throw err
        } finally {
            loading.value = false
        }
    }

    async function createSkill(data: CreateSkillRequest): Promise<Skill> {
        loading.value = true
        error.value = null

        try {
            const response = await $api<Skill>('/skills', {
                method: 'POST',
                body: data
            })

            skills.value.push(response)
            return response
        } catch (err) {
            error.value = err instanceof Error ? err.message : 'Failed to create skill'
            throw err
        } finally {
            loading.value = false
        }
    }

    // Utility functions
    async function refreshAllData(): Promise<void> {
        await Promise.all([
            getMacroSkillTypes(),
            getMacroSkills(),
            getSkills()
        ])
    }

    // Get macro skills by type
    function getMacroSkillsByType(typeId: string): MacroSkill[] {
        return macroSkills.value.filter(skill => skill.macroSkillTypeId === typeId)
    }

    // Get skills by macro skill
    function getSkillsByMacroSkill(macroSkillId: string): Skill[] {
        return skills.value.filter(skill => skill.macroSkillId === macroSkillId)
    }

    return {
        // State
        macroSkillTypes,
        macroSkills,
        skills,
        loading,
        error,

        // Macro Skill Types
        getMacroSkillTypes,
        getMacroSkillTypeById,
        createMacroSkillType,

        // Macro Skills
        getMacroSkills,
        getMacroSkillById,
        createMacroSkill,

        // Skills
        getSkills,
        getSkillById,
        createSkill,

        // Utilities
        refreshAllData,
        getMacroSkillsByType,
        getSkillsByMacroSkill
    }
}
