"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/lib/client";

type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  original_price: number;
  stock: number;
  badge: string | null;
  rating: number;
  review_count: number;
  description: string;
  image_url: string;
  is_featured: boolean;
  is_active: boolean;
};

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();

  const productId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState("");

  const [newImage, setNewImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");

  const [form, setForm] = useState({
    name: "",
    category: "",
    price: "",
    original_price: "",
    stock: "",
    badge: "",
    rating: "",
    review_count: "",
    description: "",
    image_url: "",
    is_featured: false,
    is_active: true,
  });

  useEffect(() => {
    async function loadProduct() {
      const supabase = createClient();

      setLoading(true);
      setMessage("");

      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", productId)
        .single();

      if (error || !data) {
        console.error(error);

        setMessage("Product could not be loaded.");

        setLoading(false);

        return;
      }

      const product = data as Product;

      setForm({
        name: product.name || "",
        category: product.category || "",
        price: String(product.price ?? ""),
        original_price: String(product.original_price ?? ""),
        stock: String(product.stock ?? ""),
        badge: product.badge || "",
        rating: String(product.rating ?? 0),
        review_count: String(product.review_count ?? 0),
        description: product.description || "",
        image_url: product.image_url || "",
        is_featured: product.is_featured ?? false,
        is_active: product.is_active ?? true,
      });

      setLoading(false);
    }

    if (productId) {
      loadProduct();
    }
  }, [productId]);

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  function updateField(field: string, value: string | boolean) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));

    setMessage("");
  }

  function handleImageChange(file: File | null) {
    if (!file) {
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setMessage("Please select a JPG, PNG or WEBP image.");

      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage("Image size must be less than 5 MB.");

      return;
    }

    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    const preview = URL.createObjectURL(file);

    setNewImage(file);
    setImagePreview(preview);
    setMessage("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.name.trim()) {
      setMessage("Product name is required.");
      return;
    }

    if (!form.category) {
      setMessage("Please select a category.");
      return;
    }

    if (!form.price) {
      setMessage("Selling price is required.");
      return;
    }

    if (!form.original_price) {
      setMessage("Original price is required.");
      return;
    }

    if (!form.stock) {
      setMessage("Stock quantity is required.");
      return;
    }

    if (!form.description.trim()) {
      setMessage("Product description is required.");
      return;
    }

    setUpdating(true);
    setMessage("");

    const supabase = createClient();

    try {
      let finalImageUrl = form.image_url;

      /*
      ==========================================
      UPLOAD NEW IMAGE IF ADMIN SELECTED ONE
      ==========================================
      */

      if (newImage) {
        const fileExtension =
          newImage.name.split(".").pop()?.toLowerCase() || "jpg";

        const fileName = `${productId}-${Date.now()}.${fileExtension}`;

        const filePath = `products/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("product-images")
          .upload(filePath, newImage, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) {
          console.error(uploadError);

          setMessage(`Image upload failed: ${uploadError.message}`);

          setUpdating(false);

          return;
        }

        const { data: publicUrlData } = supabase.storage
          .from("product-images")
          .getPublicUrl(filePath);

        finalImageUrl = publicUrlData.publicUrl;
      }

      /*
      ==========================================
      CALCULATE DISCOUNT
      ==========================================
      */

      const sellingPrice = Number(form.price);
      const originalPrice = Number(form.original_price);

      const discountPercent =
        originalPrice > 0
          ? Math.max(
              0,
              Math.round(
                ((originalPrice - sellingPrice) / originalPrice) * 100
              )
            )
          : 0;

      /*
      ==========================================
      UPDATE PRODUCT DATABASE
      ==========================================
      */

      const { error: updateError } = await supabase
        .from("products")
        .update({
          name: form.name.trim(),

          category: form.category,

          price: sellingPrice,

          original_price: originalPrice,

          discount_percent: discountPercent,

          stock: Number(form.stock),

          badge: form.badge || null,

          rating: Number(form.rating),

          review_count: Number(form.review_count),

          description: form.description.trim(),

          image_url: finalImageUrl,

          is_featured: form.is_featured,

          is_active: form.is_active,

          updated_at: new Date().toISOString(),
        })
        .eq("id", productId);

      if (updateError) {
        console.error(updateError);

        setMessage(`Update failed: ${updateError.message}`);

        setUpdating(false);

        return;
      }

      setMessage("Product and image updated successfully.");

      setTimeout(() => {
        router.push("/admin");
        router.refresh();
      }, 800);
    } catch (error) {
      console.error(error);

      setMessage("Something went wrong while updating the product.");

      setUpdating(false);
    }
  }

  if (loading) {
    return (
      <main
        style={{
          padding: "40px",
          fontFamily: "Arial, sans-serif",
        }}
      >
        Loading product...
      </main>
    );
  }

  return (
    <main className="edit-page">
      <button
        type="button"
        className="back-button"
        onClick={() => router.push("/admin")}
      >
        ← Back to Admin Dashboard
      </button>

      <section className="edit-card">
        <p className="small-heading">PRODUCT MANAGEMENT</p>

        <h1>Edit Product</h1>

        <p className="subtitle">
          Update product information and image in Paradise Collection.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="input-group">
              <label>Product Name *</label>

              <input
                type="text"
                value={form.name}
                onChange={(event) =>
                  updateField("name", event.target.value)
                }
              />
            </div>

            <div className="input-group">
              <label>Category *</label>

              <select
                value={form.category}
                onChange={(event) =>
                  updateField("category", event.target.value)
                }
              >
                <option value="">Select category</option>

                <option value="Festive">Festive</option>

                <option value="Festive Wear">Festive Wear</option>

                <option value="Wedding">Wedding</option>

                <option value="Wedding Collection">
                  Wedding Collection
                </option>

                <option value="Party Wear">Party Wear</option>

                <option value="Designer">Designer</option>
              </select>
            </div>

            <div className="input-group">
              <label>Selling Price (₹) *</label>

              <input
                type="number"
                min="0"
                value={form.price}
                onChange={(event) =>
                  updateField("price", event.target.value)
                }
              />
            </div>

            <div className="input-group">
              <label>Original Price / MRP (₹) *</label>

              <input
                type="number"
                min="0"
                value={form.original_price}
                onChange={(event) =>
                  updateField("original_price", event.target.value)
                }
              />
            </div>

            <div className="input-group">
              <label>Stock Quantity *</label>

              <input
                type="number"
                min="0"
                value={form.stock}
                onChange={(event) =>
                  updateField("stock", event.target.value)
                }
              />
            </div>

            <div className="input-group">
              <label>Product Badge</label>

              <select
                value={form.badge}
                onChange={(event) =>
                  updateField("badge", event.target.value)
                }
              >
                <option value="">No Badge</option>

                <option value="NEW">NEW</option>

                <option value="BESTSELLER">BESTSELLER</option>

                <option value="TRENDING">TRENDING</option>

                <option value="PREMIUM">PREMIUM</option>

                <option value="EXCLUSIVE">EXCLUSIVE</option>
              </select>
            </div>

            <div className="input-group">
              <label>Rating</label>

              <input
                type="number"
                min="0"
                max="5"
                step="0.1"
                value={form.rating}
                onChange={(event) =>
                  updateField("rating", event.target.value)
                }
              />
            </div>

            <div className="input-group">
              <label>Review Count</label>

              <input
                type="number"
                min="0"
                value={form.review_count}
                onChange={(event) =>
                  updateField("review_count", event.target.value)
                }
              />
            </div>
          </div>

          <div className="input-group description-group">
            <label>Product Description *</label>

            <textarea
              rows={6}
              value={form.description}
              onChange={(event) =>
                updateField("description", event.target.value)
              }
            />
          </div>

          <div className="image-section">
            <label className="image-title">Product Image</label>

            <div className="image-area">
              {(imagePreview || form.image_url) && (
                <div className="image-preview-box">
                  <img
                    src={imagePreview || form.image_url}
                    alt="Product Preview"
                  />
                </div>
              )}

              <div className="image-upload-area">
                <p>
                  {newImage
                    ? "New Image Selected"
                    : "Change Product Image"}
                </p>

                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(event) =>
                    handleImageChange(
                      event.target.files?.[0] || null
                    )
                  }
                />

                <small>JPG, PNG or WEBP — Maximum 5 MB</small>

                {newImage && (
                  <strong>{newImage.name}</strong>
                )}
              </div>
            </div>
          </div>

          <div className="checkbox-row">
            <label>
              <input
                type="checkbox"
                checked={form.is_featured}
                onChange={(event) =>
                  updateField("is_featured", event.target.checked)
                }
              />

              Featured Product
            </label>

            <label>
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(event) =>
                  updateField("is_active", event.target.checked)
                }
              />

              Active Product
            </label>
          </div>

          {message && <div className="message">{message}</div>}

          <div className="button-row">
            <button
              type="button"
              className="cancel-button"
              onClick={() => router.push("/admin")}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="update-button"
              disabled={updating}
            >
              {updating ? "Updating Product..." : "Update Product"}
            </button>
          </div>
        </form>
      </section>

      <style jsx>{`
        .edit-page {
          min-height: 100vh;
          background: #fffdfb;
          padding: 15px;
          color: #3d0715;
        }

        .back-button {
          border: none;
          background: transparent;
          color: #8a1238;
          cursor: pointer;
          margin-bottom: 18px;
          font-size: 14px;
        }

        .edit-card {
          width: 100%;
          max-width: 900px;
          box-sizing: border-box;
          border: 1px solid #ead6dc;
          background: #ffffff;
          padding: 30px;
        }

        .small-heading {
          letter-spacing: 5px;
          font-size: 11px;
          color: #c08446;
        }

        h1 {
          font-family: Georgia, serif;
          font-size: 32px;
          font-weight: normal;
          margin: 15px 0 8px;
        }

        .subtitle {
          color: #946b75;
          margin-bottom: 35px;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 24px 20px;
        }

        .input-group {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .input-group label,
        .image-title {
          font-size: 13px;
          font-weight: 600;
        }

        .input-group input,
        .input-group select,
        .input-group textarea {
          width: 100%;
          box-sizing: border-box;
          border: 1px solid #dec5cc;
          background: white;
          padding: 14px;
          color: #3d0715;
          outline: none;
          font-size: 14px;
        }

        .input-group input:focus,
        .input-group select:focus,
        .input-group textarea:focus {
          border-color: #8a1238;
        }

        .description-group {
          margin-top: 25px;
        }

        .image-section {
          margin-top: 25px;
        }

        .image-area {
          display: flex;
          align-items: stretch;
          gap: 20px;
          margin-top: 12px;
        }

        .image-preview-box {
          width: 150px;
          height: 190px;
          border: 1px solid #dec5cc;
          flex-shrink: 0;
          background: #fff8fa;
        }

        .image-preview-box img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .image-upload-area {
          flex: 1;
          min-height: 160px;
          border: 1px dashed #c89da9;
          background: #fffafb;
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 12px;
          padding: 20px;
          box-sizing: border-box;
        }

        .image-upload-area p {
          margin: 0;
          font-family: Georgia, serif;
          font-size: 20px;
        }

        .image-upload-area small {
          color: #946b75;
        }

        .image-upload-area strong {
          font-size: 13px;
          word-break: break-all;
        }

        .checkbox-row {
          display: flex;
          gap: 25px;
          margin-top: 25px;
        }

        .checkbox-row label {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
        }

        .message {
          margin-top: 20px;
          padding: 12px;
          border: 1px solid #dec5cc;
          background: #fff8fa;
        }

        .button-row {
          display: flex;
          gap: 12px;
          margin-top: 30px;
        }

        .cancel-button,
        .update-button {
          padding: 14px 25px;
          cursor: pointer;
          font-size: 14px;
        }

        .cancel-button {
          background: white;
          border: 1px solid #8a1238;
          color: #8a1238;
        }

        .update-button {
          background: #8a1238;
          border: 1px solid #8a1238;
          color: white;
        }

        .update-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        @media (max-width: 700px) {
          .edit-page {
            padding: 10px;
          }

          .edit-card {
            padding: 20px;
          }

          .form-grid {
            grid-template-columns: 1fr;
          }

          .image-area {
            flex-direction: column;
          }

          .image-preview-box {
            width: 100%;
            max-width: 250px;
            height: 300px;
          }

          .checkbox-row {
            flex-direction: column;
          }

          .button-row {
            flex-direction: column;
          }

          .cancel-button,
          .update-button {
            width: 100%;
          }
        }
      `}</style>
    </main>
  );
}