import { PartialType } from '@nestjs/mapped-types';
import { CreateFunkoDto } from './create-funko.dto';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Min,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from "@nestjs/swagger";

export class UpdateFunkoDto extends PartialType(CreateFunkoDto) {
  @ApiProperty({
    example: 'Rampunzel',
    description: 'El nombre del funko',
  })
  @IsOptional()
  @IsString()
  @IsString({ message: 'El nombre solo puede ser String' })
  @IsNotEmpty({ message: 'El nombre no puede estar vacio' })
  @Length(3, 20, { message: 'El nombre debe tener entre 3 y 20 caracteres' })
  @Transform((value) => value.value.trim())
  @IsOptional()
  nombre?: string;

  @ApiProperty({ example: 9.99, description: 'El precio del funko' })
  @IsNumber({}, { message: 'El precio tiene que ser un numero' })
  @Min(0, { message: 'El precio no puede ser negativo' })
  @IsOptional()
  precio?: number;

  @ApiProperty({ example: 10, description: 'La cantidad del funko' })
  @IsInt({ message: 'La cantidad solo puede ser un numero entero' })
  @Min(0, { message: 'La cantidad no puede ser negativa' })
  @IsOptional()
  cantidad?: number;

  @ApiProperty({
    example: 'imagen.jpg',
    description: 'La URL de la imagen del funko',
  })
  @IsString({ message: 'La imagen solo puede ser String' })
  @IsNotEmpty({ message: 'La imagen no puede estar vacia' })
  @Length(3, 50, { message: 'La imagen debe tener entre 3 y 50 caracteres' })
  @Transform((imagen) => imagen.value.trim())
  @IsOptional()
  imagen?: string;

  @ApiProperty({
    example: 'DISNEY',
    description: 'El nombre de la categoría del funko',
  })
  @IsString({message: "La categoria solo puede ser un string"})
  @IsNotEmpty({message: "La categoria no puede estar vacia"})
  @Transform((categoria) => categoria.value.trim())
  @IsOptional()
  categoria?: string;

  @ApiProperty({
    example: true,
    description: 'Indica si el funko ha sido eliminado',
  })
  @IsBoolean({ message: 'La variable isDeleted debe ser un boolean' })
  @IsOptional()
  isDeleted?: boolean;
}
