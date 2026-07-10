"use client";

import { useEffect, useRef, useState } from "react";
import { searchProducts } from "@/lib/api";
import type { Product } from "@/types";

export type ProductSearchStatus = "idle" | "loading" | "success" | "empty" | "error";

interface ProductSearchState {
  query: string;
  results: Product[];
  status: Exclude<ProductSearchStatus, "idle" | "loading"> | "idle";
}

interface UseProductSearchResult {
  debouncedQuery: string;
  results: Product[];
  status: ProductSearchStatus;
}

export function useProductSearch(query: string): UseProductSearchResult {
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [searchState, setSearchState] = useState<ProductSearchState>({
    query: "",
    results: [],
    status: "idle"
  });
  const requestIdRef = useRef(0);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 300);

    return () => window.clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    if (debouncedQuery.length === 0 || debouncedQuery.length < 2) {
      return undefined;
    }

    const controller = new AbortController();
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    async function runSearch() {
      try {
        const data = await searchProducts(debouncedQuery, controller.signal);

        if (requestIdRef.current !== requestId) {
          return;
        }

        setSearchState({
          query: debouncedQuery,
          results: data,
          status: data.length > 0 ? "success" : "empty"
        });
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        if (requestIdRef.current !== requestId) {
          return;
        }

        setSearchState({
          query: debouncedQuery,
          results: [],
          status: "error"
        });
      }
    }

    void runSearch();

    return () => controller.abort();
  }, [debouncedQuery]);

  if (debouncedQuery.length === 0 || debouncedQuery.length < 2) {
    return {
      debouncedQuery,
      results: [],
      status: "idle"
    };
  }

  if (searchState.query !== debouncedQuery) {
    return {
      debouncedQuery,
      results: [],
      status: "loading"
    };
  }

  return {
    debouncedQuery,
    results: searchState.results,
    status: searchState.status
  };
}
