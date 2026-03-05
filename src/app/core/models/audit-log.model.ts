export type AuditAction = 'UPDATED_SKILL' | 'ADDED_SKILL' | 'UPDATED_PROFILE' | 'REMOVED_SKILL' | 'USER_DEACTIVATED' | 'SKILL_ADDED_TO_LIBRARY' | 'SKILL_REMOVED_FROM_LIBRARY';

export interface AuditLogEntry {
  timestamp: string;
  userId: string;
  action: AuditAction;
  detail: string;
}
