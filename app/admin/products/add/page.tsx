"use client";

import { ChangeEvent, FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/lib/client";

type ProductForm = {
  name: string;
  category: string;
  description: string;
  price: string;
  originalPrice: string;
  stock: string;
  badge: string;
  rating: string;
  reviewCount: string;
  isFeatured: boolean;
  isActive: boolean;
};

export default function AddProductPage() {
  const router = useRouter();
  const supabase = createClient();

  const [form, setForm] = useState<ProductForm>({
    name: "",
    category: "",
    description: "",
    price: "",
    originalPrice: "",
    stock: "",
    badge: "",
    rating: "0",
    reviewCount: "0",
    isFeatured: false,
    isActive: true,
  });

  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  function createSlug(value: string) {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  }

  function updateField(
    field: keyof ProductForm,
    value: string | boolean
  ) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));

    setMessage("");
  }

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) {
      return;
    }

    if (!selectedFile.type.startsWith("image/")) {
      setMessage("Please select a valid image file.");
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      setMessage("Image size must be less than 5 MB.");
      return;
    }

    setImage(selectedFile);
    setImagePreview(URL.createObjectURL(selectedFile));
    setMessage("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.name.trim()) {
      setMessage("Product name is required.");
      return;
    }

    if (!form.category.trim()) {
      setMessage("Product category is required.");
      return;
    }

    if (!form.description.trim()) {
      setMessage("Product description is required.");
      return;
    }

    if (!form.price || Number(form.price) <= 0) {
      setMessage("Please enter a valid selling price.");
      return;
    }

    if (!form.originalPrice || Number(form.originalPrice) <= 0) {
      setMessage("Please enter a valid original price.");
      return;
    }

    if (Number(form.originalPrice) < Number(form.price)) {
      setMessage(
        "Original price cannot be less than selling price."
      );
      return;
    }

    if (form.stock === "" || Number(form.stock) < 0) {
      setMessage("Please enter valid stock quantity.");
      return;
    }

    if (!image) {
      setMessage("Please select a product image.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const slug = createSlug(form.name);

      /*
       * CHECK IF PRODUCT SLUG ALREADY EXISTS
       */

      const { data: existingProduct, error: checkError } =
        await supabase
          .from("products")
          .select("id")
          .eq("slug", slug)
          .maybeSingle();

      if (checkError) {
        throw checkError;
      }

      if (existingProduct) {
        setMessage(
          "A product with this name already exists."
        );
        return;
      }

      /*
       * CREATE UNIQUE IMAGE NAME
       */

      const fileExtension =
        image.name.split(".").pop()?.toLowerCase() || "jpg";

      const imageFileName =
        `${slug}-${Date.now()}.${fileExtension}`;

      /*
       * UPLOAD IMAGE TO SUPABASE STORAGE
       */

      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(imageFileName, image, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      /*
       * GET PUBLIC IMAGE URL
       */

      const { data: publicUrlData } = supabase.storage
        .from("product-images")
        .getPublicUrl(imageFileName);

      const imageUrl = publicUrlData.publicUrl;

      /*
       * CALCULATE DISCOUNT
       */

      const sellingPrice = Number(form.price);
      const originalPrice = Number(form.originalPrice);

      const discountPercent =
        originalPrice > sellingPrice
          ? Math.round(
              ((originalPrice - sellingPrice) /
                originalPrice) *
                100
            )
          : 0;

      /*
       * INSERT PRODUCT INTO DATABASE
       */

      const { error: insertError } = await supabase
        .from("products")
        .insert({
          name: form.name.trim(),
          slug,
          description: form.description.trim(),
          category: form.category.trim(),

          price: sellingPrice,
          original_price: originalPrice,
          discount_percent: discountPercent,

          stock: Number(form.stock),

          image_url: imageUrl,

          badge: form.badge.trim() || null,

          rating: Number(form.rating) || 0,
          review_count: Number(form.reviewCount) || 0,

          is_featured: form.isFeatured,
          is_active: form.isActive,
        });

      if (insertError) {
        /*
         * REMOVE IMAGE IF DATABASE INSERT FAILS
         */

        await supabase.storage
          .from("product-images")
          .remove([imageFileName]);

        throw insertError;
      }

      setMessage("Product added successfully.");

      setTimeout(() => {
        router.push("/admin");
        router.refresh();
      }, 1000);
    } catch (error) {
      console.error("Add product error:", error);

      if (error instanceof Error) {
        setMessage(error.message);
      } else {
        setMessage(
          "Something went wrong while adding the product."
        );
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#fbf8f6",
        padding: "40px 20px",
      }}
    >
      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
        }}
      >
        <button
          type="button"
          onClick={() => router.push("/admin")}
          style={{
            background: "transparent",
            border: "none",
            color: "#7d1638",
            cursor: "pointer",
            marginBottom: "20px",
            fontSize: "14px",
          }}
        >
          ← Back to Admin Dashboard
        </button>

        <div
          style={{
            background: "#ffffff",
            border: "1px solid #eadde1",
            padding: "35px",
          }}
        >
          <p
            style={{
              color: "#b77b43",
              fontSize: "11px",
              letterSpacing: "4px",
              marginBottom: "8px",
            }}
          >
            PRODUCT MANAGEMENT
          </p>

          <h1
            style={{
              color: "#3b0d1b",
              fontFamily: "Georgia, serif",
              fontSize: "36px",
              marginBottom: "8px",
            }}
          >
            Add New Product
          </h1>

          <p
            style={{
              color: "#806c72",
              marginBottom: "35px",
            }}
          >
            Add a new product to Paradise Collection.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="add-product-grid">
              <div>
                <label style={labelStyle}>
                  Product Name *
                </label>

                <input
                  style={inputStyle}
                  type="text"
                  placeholder="Example: Royal Designer Suit"
                  value={form.name}
                  onChange={(event) =>
                    updateField("name", event.target.value)
                  }
                />
              </div>

              <div>
                <label style={labelStyle}>
                  Category *
                </label>

                <select
                  style={inputStyle}
                  value={form.category}
                  onChange={(event) =>
                    updateField(
                      "category",
                      event.target.value
                    )
                  }
                >
                  <option value="">
                    Select category
                  </option>

                  <option value="Festive Wear">
                    Festive Wear
                  </option>

                  <option value="Wedding">
                    Wedding
                  </option>

                  <option value="Wedding Collection">
                    Wedding Collection
                  </option>

                  <option value="Party Wear">
                    Party Wear
                  </option>

                  <option value="Designer">
                    Designer
                  </option>

                  <option value="Festive">
                    Festive
                  </option>
                </select>
              </div>

              <div>
                <label style={labelStyle}>
                  Selling Price (₹) *
                </label>

                <input
                  style={inputStyle}
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="2499"
                  value={form.price}
                  onChange={(event) =>
                    updateField("price", event.target.value)
                  }
                />
              </div>

              <div>
                <label style={labelStyle}>
                  Original Price / MRP (₹) *
                </label>

                <input
                  style={inputStyle}
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="3499"
                  value={form.originalPrice}
                  onChange={(event) =>
                    updateField(
                      "originalPrice",
                      event.target.value
                    )
                  }
                />
              </div>

              <div>
                <label style={labelStyle}>
                  Stock Quantity *
                </label>

                <input
                  style={inputStyle}
                  type="number"
                  min="0"
                  placeholder="20"
                  value={form.stock}
                  onChange={(event) =>
                    updateField("stock", event.target.value)
                  }
                />
              </div>

              <div>
                <label style={labelStyle}>
                  Product Badge
                </label>

                <select
                  style={inputStyle}
                  value={form.badge}
                  onChange={(event) =>
                    updateField("badge", event.target.value)
                  }
                >
                  <option value="">No Badge</option>
                  <option value="NEW">NEW</option>
                  <option value="BESTSELLER">
                    BESTSELLER
                  </option>
                  <option value="TRENDING">
                    TRENDING
                  </option>
                  <option value="PREMIUM">
                    PREMIUM
                  </option>
                  <option value="EXCLUSIVE">
                    EXCLUSIVE
                  </option>
                </select>
              </div>

              <div>
                <label style={labelStyle}>
                  Rating
                </label>

                <input
                  style={inputStyle}
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  placeholder="4.8"
                  value={form.rating}
                  onChange={(event) =>
                    updateField("rating", event.target.value)
                  }
                />
              </div>

              <div>
                <label style={labelStyle}>
                  Review Count
                </label>

                <input
                  style={inputStyle}
                  type="number"
                  min="0"
                  placeholder="0"
                  value={form.reviewCount}
                  onChange={(event) =>
                    updateField(
                      "reviewCount",
                      event.target.value
                    )
                  }
                />
              </div>
            </div>

            <div style={{ marginTop: "25px" }}>
              <label style={labelStyle}>
                Product Description *
              </label>

              <textarea
                style={{
                  ...inputStyle,
                  minHeight: "140px",
                  resize: "vertical",
                }}
                placeholder="Enter complete product description..."
                value={form.description}
                onChange={(event) =>
                  updateField(
                    "description",
                    event.target.value
                  )
                }
              />
            </div>

            <div style={{ marginTop: "25px" }}>
              <label style={labelStyle}>
                Product Image *
              </label>

              <input
                style={inputStyle}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />

              {imagePreview && (
                <div style={{ marginTop: "20px" }}>
                  <img
                    src={imagePreview}
                    alt="Product Preview"
                    style={{
                      width: "220px",
                      height: "280px",
                      objectFit: "cover",
                      border: "1px solid #eadde1",
                    }}
                  />
                </div>
              )}
            </div>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "30px",
                marginTop: "30px",
              }}
            >
              <label style={checkboxStyle}>
                <input
                  type="checkbox"
                  checked={form.isFeatured}
                  onChange={(event) =>
                    updateField(
                      "isFeatured",
                      event.target.checked
                    )
                  }
                />

                Featured Product
              </label>

              <label style={checkboxStyle}>
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(event) =>
                    updateField(
                      "isActive",
                      event.target.checked
                    )
                  }
                />

                Active Product
              </label>
            </div>

            {message && (
              <div
                style={{
                  marginTop: "25px",
                  padding: "14px 16px",
                  background: "#f9eef1",
                  color: "#7d1638",
                  border: "1px solid #ead1d9",
                }}
              >
                {message}
              </div>
            )}

            <div
              style={{
                display: "flex",
                gap: "15px",
                marginTop: "35px",
              }}
            >
              <button
                type="button"
                disabled={loading}
                onClick={() => router.push("/admin")}
                style={cancelButtonStyle}
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                style={submitButtonStyle}
              >
                {loading
                  ? "Adding Product..."
                  : "+ Add Product"}
              </button>
            </div>
          </form>
        </div>
      </div>

      <style jsx>{`
        .add-product-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 25px;
        }

        @media (max-width: 700px) {
          .add-product-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </main>
  );
}

const labelStyle = {
  display: "block",
  marginBottom: "8px",
  color: "#4b2631",
  fontSize: "13px",
  fontWeight: "600",
};

const inputStyle = {
  boxSizing: "border-box" as const,
  width: "100%",
  padding: "14px",
  border: "1px solid #dfcfd4",
  background: "#ffffff",
  color: "#3b0d1b",
  fontSize: "14px",
  outline: "none",
};

const checkboxStyle = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  color: "#4b2631",
  cursor: "pointer",
};

const cancelButtonStyle = {
  padding: "14px 25px",
  background: "#ffffff",
  color: "#7d1638",
  border: "1px solid #7d1638",
  cursor: "pointer",
};

const submitButtonStyle = {
  padding: "14px 30px",
  background: "#7d1638",
  color: "#ffffff",
  border: "1px solid #7d1638",
  cursor: "pointer",
};