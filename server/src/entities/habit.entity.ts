import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { User } from "./user.entity";

export type HabitFrequency = "daily" | "weekly" | "custom";

@Entity("habits")
export class Habit {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "user_id", type: "uuid" })
  userId!: string;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user!: User;

  @Column({ type: "varchar", length: 255 })
  name!: string;

  @Column({ type: "varchar", length: 64 })
  icon!: string;

  @Column({ type: "varchar", length: 32 })
  color!: string;

  @Column({ type: "varchar", length: 16 })
  frequency!: HabitFrequency;

  @Column({ name: "custom_weekdays", type: "jsonb", nullable: true })
  customWeekdays!: number[] | null;

  @Column({ name: "reminder_time", type: "varchar", length: 8, nullable: true })
  reminderTime!: string | null;

  @Column({ name: "xp_reward", type: "int" })
  xpReward!: number;

  @Column({ type: "boolean", default: false })
  archived!: boolean;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
  updatedAt!: Date;
}
