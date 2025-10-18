export const useSkillLevelLabel = (level?: number | null): string => {
    if (level === null || level === undefined || level === 0) return 'Non applicable'
    switch (level) {
        case 1:
            return '1 - Notion'
        case 2:
            return '2 - Application simple'
        case 3:
            return '3 - Maîtrise'
        case 4:
            return '4 - Expertise'
        default:
            return '0 - Non applicable'
    }
}


