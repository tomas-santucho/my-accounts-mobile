import { CategoryRepository } from "../../domain/category/categoryRepository";
import { Category } from "../../domain/category/category";
import { fetchAuthSession } from 'aws-amplify/auth';
import * as Sentry from '@sentry/react-native';

const API_URL = `${process.env.EXPO_PUBLIC_API_URL}api/categories`;

const getAuthHeaders = async () => {
    const session = await fetchAuthSession();
    const token = session.tokens?.accessToken?.toString();
    return {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
    };
};

export const createWebCategoryRepository = (): CategoryRepository => {
    return {
        async getCategories(): Promise<Category[]> {
            try {
                const headers = await getAuthHeaders();
                const response = await fetch(API_URL, {
                    headers
                });
                if (!response.ok) {
                    throw new Error(`Failed to fetch categories: ${response.statusText}`);
                }
                const data = await response.json();
                return data;
            } catch (error) {
                console.error("Error fetching categories:", error);
                Sentry.captureException(error);
                return [];
            }
        },

        async getCategory(id: string): Promise<Category | null> {
            try {
                const headers = await getAuthHeaders();
                const response = await fetch(`${API_URL}/${id}`, {
                    headers
                });
                if (!response.ok) {
                    if (response.status === 404) return null;
                    throw new Error(`Failed to fetch category: ${response.statusText}`);
                }
                const category = await response.json();
                return category;
            } catch (error) {
                console.error(`Error fetching category ${id}:`, error);
                Sentry.captureException(error);
                return null;
            }
        },

        async addCategory(category: Category): Promise<void> {
            try {
                const headers = await getAuthHeaders();
                const response = await fetch(API_URL, {
                    method: "POST",
                    headers,
                    body: JSON.stringify(category),
                });
                if (!response.ok) {
                    throw new Error(`Failed to add category: ${response.statusText}`);
                }
            } catch (error) {
                console.error("Error adding category:", error);
                Sentry.captureException(error);
                throw error;
            }
        },

        async updateCategory(category: Category): Promise<void> {
            try {
                const headers = await getAuthHeaders();
                const response = await fetch(`${API_URL}/${category.id}`, {
                    method: "PUT",
                    headers,
                    body: JSON.stringify(category),
                });
                if (!response.ok) {
                    throw new Error(`Failed to update category: ${response.statusText}`);
                }
            } catch (error) {
                console.error("Error updating category:", error);
                Sentry.captureException(error);
                throw error;
            }
        },

        async deleteCategory(id: string): Promise<void> {
            try {
                const headers = await getAuthHeaders();
                const response = await fetch(`${API_URL}/${id}`, {
                    method: "DELETE",
                    headers
                });
                if (!response.ok) {
                    throw new Error(`Failed to delete category: ${response.statusText}`);
                }
            } catch (error) {
                console.error("Error deleting category:", error);
                Sentry.captureException(error);
                throw error;
            }
        },
    };
};
