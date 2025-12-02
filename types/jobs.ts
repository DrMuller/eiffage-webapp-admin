export type Job = {
    _id: string;
    name: string;
    code: string;
    jobProfile: string;
    jobFamily?: string;
    createdAt: string | Date;
};

export type JobSkillLink = {
    skill: import('./skills').Skill;
    levelExpected: string | null;
};

export type JobSkillResponse = {
    _id: string;
    skillId: string;
    skillName: string;
    macroSkillId: string;
    macroSkillName: string;
    macroSkillTypeId: string;
    macroSkillTypeName: string;
    jobId: string;
    expectedLevel: number;
};

export type JobSkillLevelDistribution = {
    skillId: string;
    skillName: string;
    macroSkillName: string;
    macroSkillTypeName: string;
    expectedLevel: number;
    levelDistribution: Record<number, number>;
};
