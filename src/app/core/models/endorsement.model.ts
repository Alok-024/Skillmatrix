export interface Endorsement {
  endorserId: string;
  targetUserId: string;
  skillId: string;
  timestamp: number;
}

export interface Vouch {
  voucherId: string;
  targetUserId: string;
  skillId: string;
  timestamp: number;
}
