"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { products } from "@/lib/dummy-data";
import type { Product } from "@/types";
import { ErrorState, Spinner } from "@/components/state-panels";

interface ProductSearchProps {
  selectedProduct: Product | null;
  onSelect: (product: Product | null) => void;
}

export function ProductSearch({ selectedProduct, onSelect }: ProductSearchProps) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => window.clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    function closeWhenOutside(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", closeWhenOutside);
    return () => document.removeEventListener("mousedown", closeWhenOutside);
  }, []);

  const results = useMemo(() => {
    const normalized = debouncedQuery.trim().toLowerCase();

    if (!normalized || normalized.length < 2) {
      return [];
    }

    const activeProducts = products.filter((product) => product.active);
    const exactBarcode = activeProducts.filter((product) => product.barcode === normalized);
    const partialMatches = activeProducts.filter((product) => {
      const matchesName = product.name.toLowerCase().includes(normalized);
      const matchesBarcode = product.barcode.includes(normalized);
      return (matchesName || matchesBarcode) && product.barcode !== normalized;
    });

    return [...exactBarcode, ...partialMatches].slice(0, 10);
  }, [debouncedQuery]);

  const hasError = debouncedQuery.trim().toLowerCase() === "error";
  const isLoading = query.trim().length > 0 && query !== debouncedQuery;
  const showDropdown = open && (query.trim().length > 0 || selectedProduct === null);

  function chooseProduct(product: Product) {
    onSelect(product);
    setQuery(product.name);
    setOpen(false);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (!open) {
      setOpen(true);
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlightedIndex((current) => Math.min(current + 1, Math.max(results.length - 1, 0)));
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlightedIndex((current) => Math.max(current - 1, 0));
    }

    if (event.key === "Enter" && results[highlightedIndex]) {
      event.preventDefault();
      chooseProduct(results[highlightedIndex]);
    }

    if (event.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div ref={rootRef} className="space-y-3">
      <div className="relative">
        <label className="label" htmlFor="product-search">
          Cari nama produk atau barcode
        </label>
        <input
          id="product-search"
          className="field mt-2 pr-12"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
            setHighlightedIndex(0);
            if (selectedProduct) {
              onSelect(null);
            }
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Contoh: Susu UHT atau 8991234567890"
          role="combobox"
          aria-expanded={showDropdown}
          aria-controls="product-search-results"
          autoComplete="off"
        />
        <span className="pointer-events-none absolute bottom-3 right-4 text-sm font-semibold text-primary">
          Cari
        </span>

        {showDropdown ? (
          <div
            id="product-search-results"
            className="absolute left-0 right-0 top-full z-20 mt-2 max-h-80 overflow-auto rounded-lg border border-border bg-white p-2 shadow-soft"
            role="listbox"
          >
            {isLoading ? (
              <div className="p-3 text-sm text-muted">
                <Spinner label="Mencari produk" />
              </div>
            ) : hasError ? (
              <ErrorState description="Pencarian produk belum dapat dilakukan. Coba ketik ulang kata kunci." />
            ) : debouncedQuery.trim().length < 2 ? (
              <p className="p-3 text-sm text-muted">Ketik minimal 2 karakter untuk mencari produk.</p>
            ) : results.length === 0 ? (
              <p className="p-3 text-sm text-muted">Produk tidak ditemukan. Periksa nama atau barcode.</p>
            ) : (
              results.map((product, index) => (
                <button
                  key={product.id}
                  className={`w-full rounded-lg px-3 py-3 text-left transition-colors ${
                    index === highlightedIndex ? "bg-surface-soft" : "hover:bg-surface-soft"
                  }`}
                  type="button"
                  onMouseEnter={() => setHighlightedIndex(index)}
                  onClick={() => chooseProduct(product)}
                  role="option"
                  aria-selected={index === highlightedIndex}
                >
                  <span className="block text-sm font-semibold text-text">{product.name}</span>
                  <span className="mt-1 block text-xs text-muted">
                    {product.category} - Barcode {product.barcode}
                  </span>
                </button>
              ))
            )}
          </div>
        ) : null}
      </div>

      {selectedProduct ? (
        <div className="card flex items-start justify-between gap-4 p-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">Produk terpilih</p>
            <h3 className="mt-1 font-semibold text-text">{selectedProduct.name}</h3>
            <p className="mt-1 text-sm text-muted">
              {selectedProduct.category} - {selectedProduct.barcode}
            </p>
          </div>
          <button className="btn-secondary min-h-9 px-3 py-1" type="button" onClick={() => onSelect(null)}>
            Ganti
          </button>
        </div>
      ) : null}
    </div>
  );
}
