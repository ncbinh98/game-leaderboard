import { LeaderboardEntry } from 'src/modules/scores/entities/leaderboard-entry.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';

export enum LeaderboardStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DELETED = 'deleted',
}

@Entity('leaderboards')
export class Leaderboard {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({
    type: 'enum',
    enum: LeaderboardStatus,
    default: LeaderboardStatus.ACTIVE,
  })
  status: LeaderboardStatus;

  @OneToMany(() => LeaderboardEntry, (entry) => entry.leaderboard)
  entries: LeaderboardEntry[];

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
