export class Funko {
  id: number;
  nombre: string;
  categoria: Categoria;
  precio: number;
  cantidad: number;
  imagen: string;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
}

export enum Categoria {
  DISNEY = 'DISNEY',
  SERIE = 'SERIE',
  OTROS = 'OTROS',
  SUPERHEROES = 'SUPERHEROES',
  MARVEL = 'MARVEL',
}
