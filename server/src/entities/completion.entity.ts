import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from "typeorm";
import { User } from "./user.entity";
import { Habit } from "./habit.entity";

@Entity("completions")
@Unique("UQ_completions_habit_id_completion_date", ["habitId", "completionDate"])
export class Completion {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "user_id", type: "uuid" })
  userId!: string;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user!: User;

  @Column({ name: "habit_id", type: "uuid" })
  habitId!: string;

  @ManyToOne(() => Habit, { onDelete: "CASCADE" })
  @JoinColumn({ name: "habit_id" })
  habit!: Habit;

  @Column({ name: "completion_date", type: "date" })
  completionDate!: string;

  @Column({ name: "completed_at", type: "timestamptz" })
  completedAt!: Date;

  @Column({ type: "boolean", default: false })
  skipped!: boolean;

  @Column({ type: "text", nullable: true })
  note!: string | null;

  @Column({ name: "xp_awarded", type: "int" })
  xpAwarded!: number;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
  updatedAt!: Date;
}
