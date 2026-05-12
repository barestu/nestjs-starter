import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserRole } from '../../common/enums/role.enum';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ default: false })
  isVerified: boolean;

  @Column({ nullable: true, type: 'varchar' })
  verificationToken: string | null;

  @Column({ nullable: true, type: 'timestamp' })
  verificationTokenExpiry: Date | null;

  @Column({ nullable: true, type: 'varchar' })
  resetPasswordToken: string | null;

  @Column({ nullable: true, type: 'timestamp' })
  resetPasswordTokenExpiry: Date | null;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @Column({ nullable: true, type: 'varchar' })
  name: string | null;

  @Column({ nullable: true, type: 'varchar' })
  avatar: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;
}
