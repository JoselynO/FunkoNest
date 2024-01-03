import { Categoria } from '../entities/funko.entity';
export class ResponseFunkoDto {
  id: number;
  nombre: string;
  precio: number;
  cantidad: number;
  imagen: string;
  categoria: string;
  isDeleted: boolean;
}
