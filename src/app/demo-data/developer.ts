export type DeveloperStatus = 'available' | 'interviewing' | 'unavailable';

export interface Developer {
  readonly id: number;
  readonly name: string;
  readonly email: string;
  readonly role: string;
  readonly company: {
    readonly name: string;
  };
  readonly location: string;
  readonly hourlyRate: number;
  readonly remote: boolean;
  readonly status: DeveloperStatus;
  readonly joinedAt: string;
}
