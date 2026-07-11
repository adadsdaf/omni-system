export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  stock: number;
  barcode: string;
  image: string;
}

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface SaleItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Sale {
  id: string;
  receiptNumber: string;
  items: SaleItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentMethod: 'cash' | 'card' | 'credit';
  cashier: string;
  timestamp: string;
}

export interface ServerStatus {
  isRunning: boolean;
  port: number;
  uptimeSeconds: number;
  url: string;
  posUrl: string;
  batchScript: {
    title: string;
    directory: string;
    commands: string[];
  };
  logs: string[];
}
