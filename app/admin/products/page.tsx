"use client";

import "../admin.css";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/lib/client";

type Product = {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string | null;
  price: number;
  original_price: number | null;
  image_url: string;
  stock: number;
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
};

const fallbackImage =
  "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=500&q=80";

export default function AdminProductsPage() {
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setMessage("");

    try {
      const supabase = createClient();

      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        setMessage(error.message);
        setProducts([]);
        return;
      }

      setProducts((data as Product[]) || []);
    } catch (error) {
      console.error(error);
      setMessage("Could not load products.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const filteredProducts = useMemo(() => {
    const value = search.toLowerCase().trim();

    if (!value) return products;

    return products.filter((product) => {
      return (
        product.name.toLowerCase().includes(value) ||
        product.category.toLowerCase().includes(value) ||
        product.slug.toLowerCase().includes(value)
      );
    });
  }, [products, search]);

  async function deleteProduct(product: Product) {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${product.name}"?`
    );

    if (!confirmDelete) return;

    try {
      const supabase = createClient();

      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", product.id);

      if (error) {
        alert(`Delete failed: ${error.message}`);
        return;
      }

      setProducts((currentProducts) =>
        currentProducts.filter(
          (currentProduct) => currentProduct.id !== product.id
        )
      );

      alert("Product deleted successfully.");
    } catch (error) {
      console.error(error);
      alert("Something went wrong while deleting the product.");
    }
  }

  return (
    <main className="admin-page">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <div className="admin-logo">P</div>

          <div>
            <strong>PARADISE</strong>
            <span>ADMIN PANEL</span>
          </div>
        </div>

        <nav className="admin-menu">
          <button onClick={() => router.push("/admin")}>
            <span>⌂</span>
            Dashboard
          </button>

          <button
            className="admin-menu-active"
            onClick={() => router.push("/admin/products")}
          >
            <span>◇</span>
            Products
          </button>

          <button onClick={() => router.push("/admin/orders")}>
            <span>♧</span>
            Orders
          </button>

          <button onClick={() => router.push("/admin/customers")}>
            <span>♙</span>
            Customers
          </button>

          <button onClick={() => router.push("/admin/coupons")}>
            <span>％</span>
            Coupons
          </button>

          <button onClick={() => router.push("/admin/analytics")}>
            <span>⌁</span>
            Analytics
          </button>

          <button onClick={() => router.push("/admin/settings")}>
            <span>⚙</span>
            Settings
          </button>
        </nav>

        <div className="admin-sidebar-footer">
          <button onClick={() => router.push("/shop")}>
            <span>←</span>
            View Store
          </button>
        </div>
      </aside>

      <section className="admin-main">
        <header className="admin-header">
          <div>
            <p>PARADISE COLLECTION</p>
            <h1>Product Management</h1>
          </div>

          <div className="admin-header-actions">
            <button
              className="admin-refresh-button"
              onClick={loadProducts}
            >
              ↻ Refresh
            </button>

            <button className="admin-profile-button">
              <span>A</span>

              <div>
                <strong>Administrator</strong>
                <small>Paradise Admin</small>
              </div>
            </button>
          </div>
        </header>

        <section className="admin-content">
          <div className="admin-welcome">
            <div>
              <p>PRODUCT MANAGEMENT</p>

              <h2>Paradise Products</h2>

              <span>
                Add, edit, view and manage your Paradise Collection products.
              </span>
            </div>

            <button
              className="admin-add-product-button"
              onClick={() => router.push("/admin/products/add")}
            >
              + Add New Product
            </button>
          </div>

          <section className="admin-products-card">
            <div className="admin-products-heading">
              <div>
                <p>PRODUCT INVENTORY</p>
                <h2>All Products</h2>

                <span>
                  {products.length} products available in your database.
                </span>
              </div>

              <div className="admin-search">
                <span>⌕</span>

                <input
                  type="text"
                  placeholder="Search products..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />

                {search && (
                  <button onClick={() => setSearch("")}>×</button>
                )}
              </div>
            </div>

            {message && (
              <div className="admin-message">{message}</div>
            )}

            {loading ? (
              <div className="admin-empty-state">
                <div className="admin-loading-circle">P</div>

                <h3>Loading Products...</h3>

                <p>Fetching Paradise Collection inventory.</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="admin-empty-state">
                <span>◇</span>

                <h3>No Products Found</h3>

                <p>No products match your current search.</p>
              </div>
            ) : (
              <div className="admin-table-container">
                <table className="admin-products-table">
                  <thead>
                    <tr>
                      <th>PRODUCT</th>
                      <th>CATEGORY</th>
                      <th>PRICE</th>
                      <th>STOCK</th>
                      <th>STATUS</th>
                      <th>FEATURED</th>
                      <th>ACTIONS</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredProducts.map((product) => (
                      <tr key={product.id}>
                        <td>
                          <div className="admin-product-info">
                            <img
                              src={product.image_url || fallbackImage}
                              alt={product.name}
                              onError={(event) => {
                                event.currentTarget.onerror = null;
                                event.currentTarget.src = fallbackImage;
                              }}
                            />

                            <div>
                              <strong>{product.name}</strong>
                              <span>{product.slug}</span>
                            </div>
                          </div>
                        </td>

                        <td>
                          <span className="admin-category">
                            {product.category}
                          </span>
                        </td>

                        <td>
                          <div className="admin-price">
                            <strong>
                              ₹{Number(product.price).toLocaleString("en-IN")}
                            </strong>

                            {product.original_price && (
                              <del>
                                ₹
                                {Number(
                                  product.original_price
                                ).toLocaleString("en-IN")}
                              </del>
                            )}
                          </div>
                        </td>

                        <td>
                          <span
                            className={
                              product.stock > 5
                                ? "admin-stock-good"
                                : product.stock > 0
                                ? "admin-stock-low"
                                : "admin-stock-empty"
                            }
                          >
                            {product.stock}
                          </span>
                        </td>

                        <td>
                          <span
                            className={
                              product.is_active
                                ? "admin-status-active"
                                : "admin-status-inactive"
                            }
                          >
                            {product.is_active ? "Active" : "Inactive"}
                          </span>
                        </td>

                        <td>
                          {product.is_featured ? "★ Yes" : "—"}
                        </td>

                        <td>
                          <div className="admin-product-actions">
                            <button
                              className="admin-view-button"
                              onClick={() =>
                                router.push(`/product/${product.id}`)
                              }
                            >
                              View
                            </button>

                            <button
                              className="admin-edit-button"
                              onClick={() =>
                                router.push(
                                  `/admin/products/edit/${product.id}`
                                )
                              }
                            >
                              Edit
                            </button>

                            <button
                              className="admin-delete-button"
                              onClick={() => deleteProduct(product)}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </section>
      </section>
    </main>
  );
}