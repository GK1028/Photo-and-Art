export enum Category {
  PHOTO = 'Photo',
  FRAME = 'Frame',
  ART = 'Art',
}

export enum Role {
  USER = 'USER',
  SELLER = 'SELLER',
  ADMIN = 'ADMIN',
}

export interface Product {
  id: number;
  name: string;
  category: Category;
  price: number;
  imageUrl: string;
  seller: string;
  description: string;
  rating: number;
  reviewCount: number;
}

export interface User {
  id: string;
  email: string;
  role: Role;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Review {
  id: number;
  productId: number;
  author: string;
  rating: number;
  comment: string;
  date: string;
}
