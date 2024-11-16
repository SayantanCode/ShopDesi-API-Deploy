export interface IProduct {
    name: string;
    description: string;
    mrp: number;
    costPrice: number;
    sellingPrice: number;
    discount: number;
    category: string;
    subCategory: string;
    brand: string;
    stock: number;
    image: string[];
    oldImages: string[];
    status: string;
    launchDate: Date;
    rating: number;
    totalRating: number;
}