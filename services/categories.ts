import api from "./api";
import type { Category } from "@/types/category";

export const fetchCategories = async (): Promise<Category[]> => {
    const data = await api.get<{ categories: Category[] }>("/admin/categories");

    return data.categories;
};

export const createCategory = async (payload: {
    name: string;
    description?: string;
}): Promise<Category> => {
    return api.post("/admin/categories", payload);
};

export const updateCategory = async (
    id: string,
    payload: { name?: string; description?: string }
): Promise<Category> => {
    return api.patch(`/admin/categories/${id}`, payload);
};

export const deleteCategory = async (id: string): Promise<{ deleted: boolean; id: string }> => {
    return api.delete(`/admin/categories/${id}`);
};
