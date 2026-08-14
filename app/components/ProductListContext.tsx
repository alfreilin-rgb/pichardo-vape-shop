"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

export type ListProduct = {
  id: number;
  name: string;
  price: number;
  image?: string;
  quantity: number;
};

type ProductListContextType = {
  items: ListProduct[];

  addItem: (
    product: Omit<ListProduct, "quantity">,
    quantity?: number
  ) => void;

  removeItem: (id: number) => void;

  increase: (id: number) => void;

  decrease: (id: number) => void;

  clearList: () => void;

  totalItems: number;
};

const ProductListContext =
  createContext<ProductListContextType | undefined>(
    undefined
  );

export function ProductListProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [items, setItems] = useState<ListProduct[]>([]);

  const [ready, setReady] = useState(false);

  /* CARGAR LISTA GUARDADA */
  useEffect(() => {
    try {
      const saved =
        window.localStorage.getItem(
          "pichardo-product-list"
        );

      if (saved) {
        const parsed = JSON.parse(saved);

        if (Array.isArray(parsed)) {
          setItems(parsed);
        }
      }
    } catch (error) {
      console.error(
        "Error cargando la lista:",
        error
      );
    } finally {
      setReady(true);
    }
  }, []);

  /* GUARDAR LISTA */
  useEffect(() => {
    if (!ready) return;

    try {
      window.localStorage.setItem(
        "pichardo-product-list",
        JSON.stringify(items)
      );
    } catch (error) {
      console.error(
        "Error guardando la lista:",
        error
      );
    }
  }, [items, ready]);

  /* AGREGAR PRODUCTO */
  function addItem(
    product: Omit<ListProduct, "quantity">,
    quantity = 1
  ) {
    const safeQuantity = Math.max(
      1,
      Number(quantity) || 1
    );

    setItems((current) => {
      const existing = current.find(
        (item) =>
          item.id === product.id
      );

      /* SI YA EXISTE, SUMAR CANTIDAD */
      if (existing) {
        return current.map((item) =>
          item.id === product.id
            ? {
                ...item,

                quantity:
                  item.quantity +
                  safeQuantity,
              }
            : item
        );
      }

      /* SI NO EXISTE, AGREGAR */
      return [
        ...current,

        {
          ...product,

          quantity: safeQuantity,
        },
      ];
    });
  }

  /* ELIMINAR */
  function removeItem(id: number) {
    setItems((current) =>
      current.filter(
        (item) =>
          item.id !== id
      )
    );
  }

  /* AUMENTAR */
  function increase(id: number) {
    setItems((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,

              quantity:
                item.quantity + 1,
            }
          : item
      )
    );
  }

  /* DISMINUIR */
  function decrease(id: number) {
    setItems((current) =>
      current
        .map((item) =>
          item.id === id
            ? {
                ...item,

                quantity:
                  item.quantity - 1,
              }
            : item
        )
        .filter(
          (item) =>
            item.quantity > 0
        )
    );
  }

  /* VACIAR */
  function clearList() {
    setItems([]);
  }

  /* TOTAL DE UNIDADES */
  const totalItems =
    items.reduce(
      (total, item) =>
        total + item.quantity,
      0
    );

  return (
    <ProductListContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        increase,
        decrease,
        clearList,
        totalItems,
      }}
    >
      {children}
    </ProductListContext.Provider>
  );
}

export function useProductList() {
  const context =
    useContext(ProductListContext);

  if (!context) {
    throw new Error(
      "useProductList debe utilizarse dentro de ProductListProvider"
    );
  }

  return context;
}