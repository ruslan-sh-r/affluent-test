import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity()
export class DateInfo {
  @PrimaryColumn()
  date!: Date;

  @Column()
  commisions!: string;

  @Column()
  sales!: number;

  @Column()
  leads!: number;

  @Column()
  clics!: number;

  @Column()
  epc!: string;

  @Column()
  impressions!: number;

  @Column()
  cr!: string;
}
