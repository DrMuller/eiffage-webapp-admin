export interface EvaluationSkill {
    _id: string;
    evaluationId: string;
    skillId: string;
    macroSkillId: string;
    macroSkillTypeId: string;
    expectedLevel: number | null;
    observedLevel: number | null;
    gap: number | null;
    createdAt: Date;
    skill: {
        _id: string;
        name: string;
        expectedLevel: number | null;
        macroSkill: {
            _id: string;
            name: string;
            macroSkillType: {
                _id: string;
                name: string;
                createdAt?: Date;
            };
            createdAt?: Date;
        };
        createdAt: Date;
    };
}

export interface Evaluation {
    _id: string;
    userJobId?: string;
    userJobCode?: string;
    userId: string;
    managerUserId?: string;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    evaluationSkills?: EvaluationSkill[];
}

export interface CreateEvaluationRequest {
    userJobId?: string;
    userJobCode?: string;
    userId: string;
    managerUserId?: string;
}

export interface CreateCompleteEvaluationRequest {
    evaluation: CreateEvaluationRequest;
    skills: Array<{
        skillId: string;
        expectedLevel: number | null;
        observedLevel: number | null;
    }>;
}

