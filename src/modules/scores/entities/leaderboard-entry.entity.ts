import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Leaderboard } from '../../leaderboards/entities/leaderboard.entity';

@Entity('leaderboard_entries')
@Unique(['userId', 'leaderboardId'])
export class LeaderboardEntry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'userId' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ name: 'leaderboardId' })
  leaderboardId: string;

  @ManyToOne(() => Leaderboard, (leaderboard) => leaderboard.entries, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'leaderboardId' })
  leaderboard: Leaderboard;

  @Column({ type: 'int', default: 0 })
  bestScore: number;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
