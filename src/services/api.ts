// Normalize base URL (remove trailing slash)
const RAW_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080/api";
const API_BASE = RAW_BASE.replace(/\/+$/, "");

// ---------- Types ----------
export interface ApiProduct {
    id: number;
    name: string;
    description?: string;
    price: number;
    stockQuantity: number;
    imageUrl?: string;
    categoryId: number;
    categoryName?: string;
    requiresPrescription: boolean;
    activeIngredient?: string;
    dosage?: string;
    manufacturer?: string;
    rating?: number;
    reviewCount: number;
}

export interface ApiCategory {
    id: number;
    name: string;
    description?: string;
    icon: string;
    productCount: number;
}

export interface ApiCartItem {
    id: number;
    productId: number;
    productName: string;
    imageUrl?: string;
    activeIngredient?: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
}

export interface ApiCart {
    id: string | number;
    userId: string;
    items: ApiCartItem[];
    total: number;
    itemCount: number;
    createdAt: string;
    updatedAt: string;
}

export interface ApiPagedResult<T> {
    items: T[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
}

export interface ProductFilter {
    categoryId?: number;
    minPrice?: number;
    maxPrice?: number;
    searchTerm?: string;
    requiresPrescription?: boolean;
    pageNumber?: number;
    pageSize?: number;
}

export interface AssistantRequest { question: string; productId?: number; }
export interface AssistantResponse {
    question: string;
    answer: string;
    productId?: number;
    timestamp: string;
    disclaimer: string;
}

// ---------- Helpers ----------
function isAbortError(e: unknown): boolean {
    return typeof e === "object" && e !== null && "name" in e && (e as { name?: unknown }).name === "AbortError";
}

function getErrorMessage(e: unknown): string | undefined {
    if (e instanceof Error) return e.message;
    if (typeof e === "object" && e && "toString" in e) return String(e);
    return undefined;
}

// ---------- Client ----------
class ApiClient {
    private baseUrl: string;
    private userId = "demo-user";

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl.replace(/\/+$/, "");
    }

    private buildUrl(endpoint: string) {
        return `${this.baseUrl}/${endpoint.replace(/^\/+/, "")}`;
    }

    private async request<T>(
        endpoint: string,
        options: RequestInit = {},
        timeoutMs = 15000
    ): Promise<T> {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeoutMs);

        const headers: HeadersInit = {
            "Content-Type": "application/json",
            "X-User-Id": this.userId,
            ...(options.headers || {}),
        };

        try {
            const res = await fetch(this.buildUrl(endpoint), {
                ...options,
                headers,
                // credentials: "include", // if you switch to cookie auth later
                signal: controller.signal,
            });

            if (!res.ok) {
                let msg = `HTTP ${res.status}`;
                try {
                    const data = (await res.json()) as { message?: unknown };
                    if (typeof data?.message === "string") msg = data.message;
                } catch { /* no JSON body */ }
                throw new Error(msg);
            }

            if (res.status === 204) return undefined as T;
            return (await res.json()) as T;
        } catch (err: unknown) {
            if (isAbortError(err)) {
                throw new Error("Request timed out. Please try again.");
            }
            const msg = getErrorMessage(err);
            if (msg === "Failed to fetch") {
                // Usually CORS, wrong base URL, or backend down
                throw new Error("Cannot reach backend. Is the API running and CORS allowed?");
            }
            if (err instanceof Error) throw err;
            throw new Error("Unknown error occurred");
        } finally {
            clearTimeout(timer);
        }
    }

    // ----- Products -----
    getProducts(filter: ProductFilter = {}) {
        const params = new URLSearchParams();
        if (filter.categoryId != null) params.append("categoryId", String(filter.categoryId));
        if (filter.minPrice != null) params.append("minPrice", String(filter.minPrice));
        if (filter.maxPrice != null) params.append("maxPrice", String(filter.maxPrice));
        if (filter.searchTerm) params.append("searchTerm", filter.searchTerm);
        if (filter.requiresPrescription !== undefined)
            params.append("requiresPrescription", String(filter.requiresPrescription));
        if (filter.pageNumber != null) params.append("pageNumber", String(filter.pageNumber));
        if (filter.pageSize != null) params.append("pageSize", String(filter.pageSize));

        const qs = params.toString();
        return this.request<ApiPagedResult<ApiProduct>>(`/products${qs ? `?${qs}` : ""}`);
    }

    getProduct(id: number) {
        return this.request<ApiProduct>(`/products/${id}`);
    }

    searchProducts(searchTerm: string) {
        const params = new URLSearchParams({ searchTerm });
        return this.request<ApiProduct[]>(`/products/search?${params}`);
    }

    // ----- Categories -----
    getCategories() {
        return this.request<ApiCategory[]>("/categories");
    }

    getCategory(id: number) {
        return this.request<ApiCategory>(`/categories/${id}`);
    }

    // ----- Cart -----
    getCart() {
        return this.request<ApiCart>("/cart");
    }

    addToCart(productId: number, quantity = 1) {
        return this.request<ApiCart>("/cart/items", {
            method: "POST",
            body: JSON.stringify({ productId, quantity }),
        });
    }

    updateCartItem(cartItemId: number, quantity: number) {
        return this.request<ApiCart>(`/cart/items/${cartItemId}`, {
            method: "PUT",
            body: JSON.stringify({ quantity }),
        });
    }

    removeFromCart(cartItemId: number) {
        return this.request<ApiCart>(`/cart/items/${cartItemId}`, { method: "DELETE" });
    }

    clearCart() {
        return this.request<ApiCart>("/cart", { method: "DELETE" });
    }

    // ----- Assistant -----
    askAssistant(question: string, productId?: number) {
        return this.request<AssistantResponse>("/assistant/ask", {
            method: "POST",
            body: JSON.stringify({ question, productId }),
        });
    }

    // ----- Health -----
    healthCheck() {
        return this.request<{ status: string; timestamp: string; environment: string }>("/health");
    }
}

export const apiClient = new ApiClient(API_BASE);

// Convenience wrappers (keep `this` intact)
export function getProducts(filter?: ProductFilter) { return apiClient.getProducts(filter ?? {}); }
export function getProduct(id: number) { return apiClient.getProduct(id); }
export function searchProducts(searchTerm: string) { return apiClient.searchProducts(searchTerm); }
export function getCategories() { return apiClient.getCategories(); }
export function getCategory(id: number) { return apiClient.getCategory(id); }
export function getCart() { return apiClient.getCart(); }
export function addToCart(productId: number, quantity = 1) { return apiClient.addToCart(productId, quantity); }
export function updateCartItem(cartItemId: number, quantity: number) { return apiClient.updateCartItem(cartItemId, quantity); }
export function removeFromCart(cartItemId: number) { return apiClient.removeFromCart(cartItemId); }
export function clearCart() { return apiClient.clearCart(); }
export function askAssistant(question: string, productId?: number) { return apiClient.askAssistant(question, productId); }
export function healthCheck() { return apiClient.healthCheck(); }
