import { z } from 'zod';

// ─── Enums ───────────────────────────────────────────────────────────────────

export const LanguageEnum = z.enum(['english', 'urdu', 'arabic']);
export type Language = z.infer<typeof LanguageEnum>;

export const ExplanationLevelEnum = z.enum(['beginner', 'intermediate', 'advanced', 'researcher']);
export type ExplanationLevel = z.infer<typeof ExplanationLevelEnum>;

export const ResponseLengthEnum = z.enum(['short', 'moderate', 'detailed']);
export type ResponseLength = z.infer<typeof ResponseLengthEnum>;

export const ExplanationStyleEnum = z.enum(['analytical', 'reflective', 'simplified', 'scholarly']);
export type ExplanationStyle = z.infer<typeof ExplanationStyleEnum>;

export const UserRoleEnum = z.enum(['user', 'admin']);
export type UserRole = z.infer<typeof UserRoleEnum>;

export const LearningObjectiveEnum = z.enum([
  'general_knowledge',
  'spiritual_development',
  'academic_research',
  'leadership',
  'ethics',
  'character_development',
]);
export type LearningObjective = z.infer<typeof LearningObjectiveEnum>;

export const TopicEnum = z.enum([
  'justice',
  'patience',
  'leadership',
  'knowledge',
  'governance',
  'human_rights',
  'piety',
  'worldly_detachment',
  'death_afterlife',
  'prayer_worship',
  'quran',
  'prophet_muhammad',
  'ethics_morality',
  'wisdom',
  'war_jihad',
  'community',
  'family',
  'wealth_poverty',
  'friendship',
  'self_discipline',
  'truthfulness',
  'gratitude',
  'forgiveness',
  'responsibility',
  'eloquence',
]);
export type Topic = z.infer<typeof TopicEnum>;

// ─── Schemas ─────────────────────────────────────────────────────────────────

export const DailyWisdomPrefsSchema = z.object({
  enabled: z.boolean().default(true),
  frequency: z.enum(['daily', 'weekly', 'custom']).default('daily'),
  preferredTopics: z.array(z.string()).default([]),
  preferredTime: z.string().nullable().default(null),
});

export const AccessibilityPrefsSchema = z.object({
  showArabicText: z.boolean().default(true),
  showTransliteration: z.boolean().default(false),
  fontSize: z.enum(['small', 'medium', 'large']).default('medium'),
});

export const UserPreferencesSchema = z.object({
  language: LanguageEnum.default('english'),
  explanationLevel: ExplanationLevelEnum.default('intermediate'),
  responseLength: ResponseLengthEnum.default('moderate'),
  learningObjectives: z.array(LearningObjectiveEnum).default(['general_knowledge']),
  topicsOfInterest: z.array(z.string()).default([]),
  preferredTranslator: z.string().nullable().default(null),
  explanationStyle: ExplanationStyleEnum.default('reflective'),
  dailyWisdom: DailyWisdomPrefsSchema.default({
    enabled: true,
    frequency: 'daily',
    preferredTopics: [],
    preferredTime: null,
  }),
  accessibility: AccessibilityPrefsSchema.default({
    showArabicText: true,
    showTransliteration: false,
    fontSize: 'medium',
  }),
});

export type UserPreferences = z.infer<typeof UserPreferencesSchema>;

export const UpdatePreferencesSchema = UserPreferencesSchema.partial();
export type UpdatePreferencesInput = z.infer<typeof UpdatePreferencesSchema>;

export const RegisterUserSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(128),
});
export type RegisterUserInput = z.infer<typeof RegisterUserSchema>;

export const LoginUserSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});
export type LoginUserInput = z.infer<typeof LoginUserSchema>;

export const UpdateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  image: z.string().url().nullable().optional(),
});
export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;

// ─── Interfaces ──────────────────────────────────────────────────────────────

export interface IUser {
  _id: string;
  email: string;
  name: string;
  passwordHash: string;
  role: UserRole;
  emailVerified: Date | null;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt: Date;
  isActive: boolean;
}

export interface IUserPreferences {
  _id: string;
  userId: string;
  language: Language;
  explanationLevel: ExplanationLevel;
  responseLength: ResponseLength;
  learningObjectives: LearningObjective[];
  topicsOfInterest: string[];
  preferredTranslator: string | null;
  explanationStyle: ExplanationStyle;
  dailyWisdom: {
    enabled: boolean;
    frequency: 'daily' | 'weekly' | 'custom';
    preferredTopics: string[];
    preferredTime: string | null;
  };
  accessibility: {
    showArabicText: boolean;
    showTransliteration: boolean;
    fontSize: 'small' | 'medium' | 'large';
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPublicProfile {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: UserRole;
  createdAt: Date;
}
