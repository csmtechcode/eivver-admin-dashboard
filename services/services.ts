import api from "./api";
import type { Category } from "@/types/category";
import type { Service } from "@/types/service";

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

export const fetchServices = async (): Promise<Service[]> => {
    const data = await api.get<{ services: Service[] }>("/admin/services");

    return data.services;
};

export const createService = async (payload: {
    name: string;
    description?: string;
    categoryId: string;
}): Promise<Service> => {
    return api.post("/admin/services", payload);
};

export const updateService = async (
    id: string,
    payload: { name?: string; description?: string; categoryId?: string }
): Promise<Service> => {
    return api.patch(`/admin/services/${id}`, payload);
};

export const deleteService = async (id: string): Promise<{ deleted: boolean; id: string }> => {
    return api.delete(`/admin/services/${id}`);
};
