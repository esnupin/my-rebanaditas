export interface Producto {
  id: number;
  name: string;
  price: number;
  category: string;
  image: string;
}

//Extraccion de las propiedades nefcesarias para crear un nuevo producto
export type  ProductInput = Pick<Producto, 'name' | 'price' | 'category' | 'image' >;


