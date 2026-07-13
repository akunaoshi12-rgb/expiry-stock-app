"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { useProductSearch } from "@/hooks/use-product-search";
import type { Product } from "@/types";
import { Spinner } from "@/components/state-panels";

interface ProductSearchProps {
  selectedProduct: Product | null;
  onSelect: (product: Product | null) => void;
}

function productMeta(product: Product): string[] {
  return [
    product.barcode ? `Barcode ${product.barcode}` : "",
    product.internal_code ? `Kode ${product.internal_code}` : "",
    product.category?.name ?? ""
  ].filter(Boolean);
}

export function ProductSearch({ selectedProduct, onSelect }: ProductSearchProps) {
  const [query, setQuery] = useState(selectedProduct?.name ?? "");
  const [open, setOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const inputId = useId();
  const listboxId = useId();
  const optionBaseId = useId();
  const normalizedQuery = query.trim();
  const { results, status } = useProductSearch(query);
  const showDropdown = open && (normalizedQuery.length > 0 || status !== "idle");
  const activeOptionId =
    showDropdown && results[highlightedIndex] ? `${optionBaseId}-${results[highlightedIndex].id}` : undefined;

  useEffect(() => {
    function closeWhenOutside(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", closeWhenOutside);
    return () => document.removeEventListener("mousedown", closeWhenOutside);
  }, []);

  function chooseProduct(product: Product) {
    onSelect(product);
    setQuery(product.name);
    setOpen(false);
    setHighlightedIndex(0);
  }

  function clearSelectedProductIfNeeded(nextQuery: string) {
    if (selectedProduct && nextQuery !== selectedProduct.name) {
      onSelect(null);
    }
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Tab") {
      return;
    }

    if (event.key === "Escape") {
      setOpen(false);
      return;
    }

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
  }

  return (
    <div ref={rootRef} className="space-y-3">
      <div className="relative">
        <label className="label" htmlFor={inputId}>
          Cari nama produk, barcode, atau kode internal
        </label>
        <Search className="pointer-events-none absolute left-3 top-[2.95rem] h-4 w-4 text-muted" aria-hidden="true" />
        <input
          id={inputId}
          className="field mt-2 pl-9 pr-12"
          value={query}
          onChange={(event) => {
            const nextQuery = event.target.value;
            setQuery(nextQuery);
            setOpen(true);
            setHighlightedIndex(0);
            clearSelectedProductIfNeeded(nextQuery);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Contoh: almond atau 089686123456"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={showDropdown}
          aria-controls={listboxId}
          aria-activedescendant={activeOptionId}
          autoComplete="off"
        />
        <span className="pointer-events-none absolute bottom-3 right-4 text-sm font-semibold text-primary">
          Cari
        </span>

        {showDropdown ? (
          <div
            id={listboxId}
            className="absolute left-0 right-0 top-full z-20 mt-2 max-h-80 overflow-auto rounded-lg border border-border bg-white p-2 shadow-soft"
            role="listbox"
          >
            {normalizedQuery.length < 2 ? (
              <p className="min-h-12 p-3 text-sm text-muted">Ketik minimal 2 karakter untuk mencari produk.</p>
            ) : status === "loading" ? (
              <div className="flex min-h-12 items-center p-3 text-sm text-muted">
                <Spinner label="Mencari produk" />
              </div>
            ) : status === "error" ? (
              <p className="min-h-12 p-3 text-sm font-semibold text-danger">Gagal mencari produk. Coba lagi.</p>
            ) : status === "empty" ? (
              <p className="min-h-12 p-3 text-sm text-muted">Tidak ada produk ditemukan.</p>
            ) : (
              results.map((product, index) => {
                const metadata = productMeta(product);

                return (
                  <button
                    id={`${optionBaseId}-${product.id}`}
                    key={product.id}
                    className={`w-full rounded-md px-3 py-3 text-left transition-colors ${
                      index === highlightedIndex ? "bg-surface-soft" : "hover:bg-surface-soft"
                    }`}
                    type="button"
                    onMouseEnter={() => setHighlightedIndex(index)}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => chooseProduct(product)}
                    role="option"
                    aria-selected={index === highlightedIndex}
                  >
                    <span className="block text-sm font-semibold text-text">{product.name}</span>
                    {metadata.length > 0 ? (
                      <span className="mt-1 block text-xs text-muted">{metadata.join(" - ")}</span>
                    ) : null}
                  </button>
                );
              })
            )}
          </div>
        ) : null}
      </div>

      {selectedProduct ? (
        <div className="panel flex items-start justify-between gap-4 p-4">
          <div>
            <p className="text-xs font-semibold text-muted">Produk terpilih</p>
            <h3 className="mt-1 font-semibold text-text">{selectedProduct.name}</h3>
            {productMeta(selectedProduct).length > 0 ? (
              <p className="mt-1 text-sm text-muted">{productMeta(selectedProduct).join(" - ")}</p>
            ) : null}
          </div>
          <button
            className="btn-secondary min-h-9 px-3 py-1"
            type="button"
            onClick={() => {
              onSelect(null);
              setQuery("");
              setOpen(false);
            }}
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
            Ganti
          </button>
        </div>
      ) : null}
    </div>
  );
}
