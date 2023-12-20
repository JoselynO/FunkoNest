import { Column, CreateDateColumn, Entity, OneToMany, PrimaryColumn, UpdateDateColumn } from "typeorm";
import { Funko } from '../../funkos/entities/funko.entity'

@Entity({ name: 'categorias'})
export class Categoria {
  @PrimaryColumn({type: 'uuid'})
  id: string;

  @Column({type: 'varchar', length: 255, unique: true})
  nombre: string;

  @CreateDateColumn({name: 'created', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP'})
  createdAt: Date;

  @UpdateDateColumn({name: 'updated', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP'})
  updatedAt: Date;

  @Column({name: 'isDeleted', type: 'boolean', default: false})
  isDeleted: boolean;

  @OneToMany(() => Funko, (funko) => funko.categoria)
  funkos: Funko[];
}
