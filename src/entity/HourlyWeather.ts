import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm"

@Entity()
export class HourlyWeather {

    @PrimaryGeneratedColumn()
    id: number

    @CreateDateColumn()
    date: Date

    @Column()
    rain: number

    @Column({ type: 'decimal' })
    temp: number

}
