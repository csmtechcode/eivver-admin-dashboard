import type { Category } from "./category";

export interface Service {
    id: string;
    name: string;
    description: string;
    categoryId: string | null;
    categoryName: string | null;
    createdAt: string;
    updatedAt: string;
}

export type { Category };
