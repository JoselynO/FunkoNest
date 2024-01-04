import { IsNotEmpty, IsString, Length } from 'class-validator'
import { Transform } from "class-transformer";

export class CreateCategoriaDto {
  @IsString()
  @IsNotEmpty()
  @Length(3, 100, { message: 'El nombre debe tener entre 3 y 100 caracteres' })
  @Transform((nombre) => nombre.value.trim())
  nombre: string
}
