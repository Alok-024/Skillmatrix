export type SkillCategory = 'Technical' | 'Soft Skills' | 'Languages';

export interface Skill {
  id: string;
  name: string;
  category: SkillCategory;
}
