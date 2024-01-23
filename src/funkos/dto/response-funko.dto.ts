import { ApiProperty } from "@nestjs/swagger";

export class ResponseFunkoDto {
  @ApiProperty({ example: 1, description: 'ID del funko' })
  id: number;

  @ApiProperty({ example: 'Hulk', description: 'Nombre del funko' })
  nombre: string;

  @ApiProperty({ example: 99.99, description: 'Precio del funko' })
  precio: number;

  @ApiProperty({ example: 20, description: 'Cantidad disponible de funkos' })
  cantidad: number;

  @ApiProperty({
    example: 'https://example.com/image.jpg',
    description: 'URL de la imagen del funko',
  })
  imagen: string;

  @ApiProperty({ example: 'MARVEL', description: 'Categoría del funko' })
  categoria: string;

  @ApiProperty({
    example: false,
    description: 'Indica si el funko ha sido eliminado',
  })
  isDeleted: boolean;
}
