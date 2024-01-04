import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Min,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateFunkoDto {
  @IsString({ message: 'El nombre solo puede ser String' })
  @IsNotEmpty({ message: 'El nombre no puede estar vacio' })
  @Length(3, 20, { message: 'El nombre debe tener entre 3 y 20 caracteres' })
  @Transform((value) => value.value.trim())
  nombre: string;

  @IsNumber({}, { message: 'El precio tiene que ser un numero' })
  @Min(0, { message: 'El precio no puede ser negativo' })
  precio: number;

  @IsInt({ message: 'La cantidad solo puede ser un numero entero' })
  @Min(0, { message: 'La cantidad no puede ser negativa' })
  cantidad: number;

  @IsString({ message: 'La imagen solo puede ser String' })
  @IsNotEmpty({ message: 'La imagen no puede estar vacia' })
  @Length(3, 50, { message: 'La imagen debe tener entre 3 y 50 caracteres' })
  @Transform((imagen) => imagen.value.trim())
  @IsOptional()
  imagen: string;

  @IsString({message: "La categoria solo puede ser un string"})
  @IsNotEmpty({message: "La categoria no puede estar vacia"})
  @Transform((categoria) => categoria.value.trim())
  categoria: string;
}
