export interface Usuario {
  id: number;
  email: string;
  username: string;
  password?: string;
  name: {
    firstname: string;
    lastname: string;
  };
  phone: string;
  address?: {
    city: string;
    street: string;
  };
}