import { Categoria } from '../entities/funko.entity';
export class ResponseFunkoDto {
  id: number;
  nombre: string;
  categoria: string;
  precio: number;
  cantidad: number;
  imagen: string;
  isDeleted: boolean;
}
