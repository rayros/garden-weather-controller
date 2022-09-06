import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm"

class ColumnNumericTransformer {
    to(data: number): number {
        return data;
    }
    from(data: string): number {
        return parseFloat(data);
    }
}

@Entity()
export class HourlyWeather {

    @PrimaryGeneratedColumn()
    id: number

    @CreateDateColumn()
    date: Date

    @Column({
        type: 'decimal',
        transformer: new ColumnNumericTransformer(),
    })
    rain: number

    @Column({
        type: 'decimal',
        transformer: new ColumnNumericTransformer(),
    })
    temp: number

}
