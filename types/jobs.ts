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
