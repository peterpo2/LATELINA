import { useState, useEffect, useCallback, useRef, DependencyList } from "react";
import { apiClient, ApiCart, ProductFilter } from "../services/api";

// ===== Generic API Hook =====
export function useApi<T>(
  apiCall: (signal?: AbortSignal) => Promise<T>,
  dependencies: DependencyList = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);

  const fetchData = useCallback(async () => {
    abortRef.current?.abort(); // cancel previous request
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      setLoading(true);
      setError(null);

      const result = await apiCall(controller.signal);
      setData(result);
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === "AbortError") return; // ignore cancelled requests
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  useEffect(() => {
    fetchData();
    return () => abortRef.current?.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);

  return { data, loading, error, refetch: fetchData };
}

// ===== Specific API hooks =====
export function useProducts(filter: ProductFilter = {}) {
  return useApi(() => apiClient.getProducts(filter), [JSON.stringify(filter)]);
}

export function useProduct(id: number) {
  return useApi(() => apiClient.getProduct(id), [id]);
}

export function useCategories() {
  return useApi(() => apiClient.getCategories(), []);
}

// ===== Cart Hook (extended API) =====
export function useCart() {
  const {
    data: cart,
    loading,
    error,
    refetch,
  } = useApi<ApiCart>(() => apiClient.getCart(), []);

  const addToCart = async (productId: number, quantity = 1) => {
    const updatedCart = await apiClient.addToCart(productId, quantity);
    await refetch();
    return updatedCart;
  };

  const updateCartItem = async (cartItemId: number, quantity: number) => {
    const updatedCart = await apiClient.updateCartItem(cartItemId, quantity);
    await refetch();
    return updatedCart;
  };

  const removeFromCart = async (cartItemId: number) => {
    const updatedCart = await apiClient.removeFromCart(cartItemId);
    await refetch();
    return updatedCart;
  };

  const clearCart = async () => {
    const updatedCart = await apiClient.clearCart();
    await refetch();
    return updatedCart;
  };

  return {
    cart,
    loading,
    error,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    refetch,
  };
}

// ===== Assistant Hook =====
export function useAssistant() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const askQuestion = async (question: string, productId?: number) => {
    try {
      setLoading(true);
      setError(null);
      return await apiClient.askAssistant(question, productId);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to get assistant response";
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  return { askQuestion, loading, error };
}
