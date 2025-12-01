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

    // Backend DTOs mapping helpers
    type SkillApi = {
        _id: string
        name: string
        macroSkillId: string
        macroSkillName: string
        macroSkillTypeId: string
        macroSkillTypeName: string
        jobSkills: { jobId: string; expectedLevel: number }[]
        createdAt: string | Date
    }

    function transformSkill(dto: SkillApi): Skill {
        return {
            _id: dto._id,
            name: dto.name,
            expectedLevel: null,
            macroSkillId: dto.macroSkillId,
            macroSkill: {
                _id: dto.macroSkillId,
                name: dto.macroSkillName,
                macroSkillTypeId: dto.macroSkillTypeId,
                macroSkillType: {
                    _id: dto.macroSkillTypeId,
                    name: dto.macroSkillTypeName,
                },
                createdAt: new Date(dto.createdAt),
            },
            jobIds: dto.jobSkills?.map(j => j.jobId) ?? [],
            createdAt: new Date(dto.createdAt),
        }
    }

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
            const response = await $api<SkillApi[]>('/skills', {
                method: 'GET'
            })

            const mapped = response.map(transformSkill)
            skills.value = mapped
            return mapped
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
            const response = await $api<SkillApi>(`/skills/${id}`, {
                method: 'GET'
            })

            return transformSkill(response)
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
            const response = await $api<SkillApi>('/skills', {
                method: 'POST',
                body: data
            })

            const mapped = transformSkill(response)
            skills.value.push(mapped)
            return mapped
        } catch (err) {
            error.value = err instanceof Error ? err.message : 'Failed to create skill'
            throw err
        } finally {
            loading.value = false
        }
    }

    async function updateSkill(id: string, data: Partial<CreateSkillRequest>): Promise<Skill> {
        loading.value = true
        error.value = null

        try {
            const response = await $api<SkillApi>(`/skills/${id}`, {
                method: 'PUT',
                body: data
            })

            const mapped = transformSkill(response)
            const index = skills.value.findIndex(s => s._id === id)
            if (index !== -1) {
                skills.value[index] = mapped
            }
            return mapped
        } catch (err) {
            error.value = err instanceof Error ? err.message : 'Failed to update skill'
            throw err
        } finally {
            loading.value = false
        }
    }

    async function deleteSkill(id: string): Promise<void> {
        loading.value = true
        error.value = null

        try {
            await $api(`/skills/${id}`, {
                method: 'DELETE'
            })

            skills.value = skills.value.filter(s => s._id !== id)
        } catch (err) {
            error.value = err instanceof Error ? err.message : 'Failed to delete skill'
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
        updateSkill,
        deleteSkill,

        // Utilities
        refreshAllData,
        getMacroSkillsByType,
        getSkillsByMacroSkill
    }
}
