"use client";

import "./product.css";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/lib/client";



type Product = {
  id: number;
  name: string;
  category: string;
  price: number;
  mrp: number;
  image: string;
  images: string[];
  description: string;
  sizes: string[];
  colors: string[];
  rating: number;
  reviews: number;
};

const products: Product[] = [
  {
    id: 1,
    name: "Noor Embroidered Anarkali Suit",
    category: "Party Wear",
    price: 1999,
    mrp: 2999,
    image:
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=85",
    images: [
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=85",
      "https://images.unsplash.com/photo-1583391733956-6c78276477e2?auto=format&fit=crop&w=900&q=85",
    ],
    description:
      "A premium embroidered Anarkali suit designed for elegant celebrations and special occasions.",
    sizes: ["free Size"],
    colors: ["Wine", "Black", "Maroon"],
    rating: 4.8,
    reviews: 128,
  },
  {
    id: 2,
    name: "Meher Premium Festive Suit",
    category: "Festive",
    price: 2499,
    mrp: 3499,
    image:
      "https://images.unsplash.com/photo-1583391733956-6c78276477e2?auto=format&fit=crop&w=900&q=85",
    images: [
      "https://images.unsplash.com/photo-1583391733956-6c78276477e2?auto=format&fit=crop&w=900&q=85",
    ],
    description:
      "Premium festive wear crafted for graceful celebrations.",
    sizes: ["free Size"],
    colors: ["Pink", "Wine", "Green"],
    rating: 4.7,
    reviews: 94,
  },
  {
    id: 3,
    name: "Royal Wedding Collection Suit",
    category: "Wedding",
    price: 3299,
    mrp: 4999,
    image:
      "https://images.unsplash.com/photo-1597983073512-90bd150e19f6?auto=format&fit=crop&w=900&q=85",
    images: [
      "https://images.unsplash.com/photo-1597983073512-90bd150e19f6?auto=format&fit=crop&w=900&q=85",
    ],
    description:
      "An elegant premium wedding collection suit for memorable occasions.",
    sizes: ["free Size"],
    colors: ["Red", "Maroon", "Gold"],
    rating: 4.9,
    reviews: 215,
  },
  {
    id: 4,
    name: "Aayat Designer Party Suit",
    category: "Party Wear",
    price: 1799,
    mrp: 2699,
    image:
      "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=900&q=85",
    images: [
      "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=900&q=85",
    ],
    description:
      "A stylish designer party suit made for modern celebrations.",
    sizes: ["free Size"],
    colors: ["Black", "Blue", "Wine"],
    rating: 4.6,
    reviews: 76,
  },
  {
    id: 5,
    name: "Zara Elegant Cotton Suit",
    category: "Daily Wear",
    price: 1299,
    mrp: 1999,
    image:
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=900&q=85",
    images: [
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=900&q=85",
    ],
    description:
      "Comfortable and elegant cotton wear for everyday style.",
    sizes: ["free Size"],
    colors: ["White", "Pink", "Blue"],
    rating: 4.5,
    reviews: 89,
  },
  {
    id: 6,
    name: "Inaya Luxury Designer Suit",
    category: "Designer",
    price: 2899,
    mrp: 4299,
    image:
      "https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=900&q=85",
    images: [
      "https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=900&q=85",
    ],
    description:
      "Luxury designer fashion with a sophisticated Paradise Collection finish.",
    sizes: ["free Size"],
    colors: ["Black", "Gold", "Wine"],
    rating: 4.8,
    reviews: 145,
  },
  {
    id: 7,
    name: "Mahira Festive Embroidered Suit",
    category: "Festive",
    price: 2199,
    mrp: 3199,
    image:
      "https://images.unsplash.com/photo-1612336307429-8a898d10e223?auto=format&fit=crop&w=900&q=85",
    images: [
      "https://images.unsplash.com/photo-1612336307429-8a898d10e223?auto=format&fit=crop&w=900&q=85",
    ],
    description:
      "Beautiful embroidered festive wear for elegant celebrations.",
    sizes: ["free Size"],
    colors: ["Green", "Pink", "Maroon"],
    rating: 4.7,
    reviews: 110,
  },
  {
    id: 8,
    name: "Safa Premium Wedding Suit",
    category: "Wedding",
    price: 3999,
    mrp: 5999,
    image:
      "https://images.unsplash.com/photo-1594552072238-b8a33785b261?auto=format&fit=crop&w=900&q=85",
    images: [
      "https://images.unsplash.com/photo-1594552072238-b8a33785b261?auto=format&fit=crop&w=900&q=85",
    ],
    description:
      "A premium wedding collection created for luxurious celebrations.",
    sizes: ["free Size"],
    colors: ["Red", "Gold", "Maroon"],
    rating: 4.9,
    reviews: 187,
  },
];

export default function ProductPage() {
  const router = useRouter();
  const supabase = createClient();
  async function requireLogin(
  redirect: string
) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    router.push(
      `/auth?redirect=${encodeURIComponent(
        redirect
      )}`
    );

    return false;
  }

  return true;
}
  const params = useParams();

  const productId = Number(params.id);

  const product =
    products.find((item) => item.id === productId) || products[0];

  const [selectedImage, setSelectedImage] = useState(product.image);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState(product.colors[0]);
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState("");
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);

  useEffect(() => {
    setSelectedImage(product.image);
    setSelectedSize("");
    setSelectedColor(product.colors[0]);
    setQuantity(1);

    try {
      const cart = JSON.parse(
        localStorage.getItem("paradise-cart") || "[]"
      );

      const wishlist = JSON.parse(
        localStorage.getItem("paradise-wishlist") || "[]"
      );

      setCartCount(cart.length);
      setWishlistCount(wishlist.length);
    } catch {
      setCartCount(0);
      setWishlistCount(0);
    }
  }, [product]);

  
  

  async function addToCart()  {

    const allowed = await requireLogin("/cart");

if (!allowed) {
  return;
}
    if (!selectedSize) {
      setMessage("Please select your size first.");
      return;
    }

    try {
      const currentCart: number[] = JSON.parse(
        localStorage.getItem("paradise-cart") || "[]"
      );

      const updatedCart = [...currentCart];

      for (let index = 0; index < quantity; index++) {
        updatedCart.push(product.id);
      }

      localStorage.setItem(
        "paradise-cart",
        JSON.stringify(updatedCart)
      );

      setCartCount(updatedCart.length);
      setMessage("Product added to your Paradise bag.");
    } catch {
      setMessage("Unable to add product to cart.");
    }
  }

  async function buyNow() {
    const allowed = await requireLogin("/checkout");

if (!allowed) {
  return;
}
    if (!selectedSize) {
      setMessage("Please select your size first.");
      return;
    }

    const buyNowProduct = {
      id: product.id,
      name: product.name,
      category: product.category,
      price: product.price,
      mrp: product.mrp,
      image: product.image,
      quantity,
      selectedSize,
      selectedColor,
    };

    /*
      IMPORTANT:
      Purana cart checkout data remove kar rahe hain
      taaki direct Buy Now me wahi product checkout par aaye.
    */

    localStorage.removeItem("paradise-checkout");

    localStorage.setItem(
      "paradise-buy-now",
      JSON.stringify(buyNowProduct)
    );

    router.push("/checkout");
  }

  async function addToWishlist() {
    const allowed = await requireLogin("/wishlist");

    if (!allowed) {
      return;
    }

    try {
      const currentWishlist: number[] = JSON.parse(
        localStorage.getItem("paradise-wishlist") || "[]"
      );

      if (currentWishlist.includes(product.id)) {
        setMessage("This product is already in your wishlist.");
        return;
      }

      const updatedWishlist = [...currentWishlist, product.id];

      localStorage.setItem(
        "paradise-wishlist",
        JSON.stringify(updatedWishlist)
      );

      setWishlistCount(updatedWishlist.length);
      setMessage("Product added to your wishlist.");
    } catch {
      setMessage("Unable to add product to wishlist.");
    }
  }

  const discount = Math.round(
    ((product.mrp - product.price) / product.mrp) * 100
  );

  return (
    <main className="product-page">
      <div className="product-top-offer">
        <span>FREE SHIPPING ON ORDERS ABOVE ₹999</span>
        <span>WELCOME TO PARADISE COLLECTION</span>
      </div>

      <header className="product-header">
        <button
          className="product-brand"
          onClick={() => router.push("/shop")}
        >
          <div className="product-brand-logo">P</div>

          <div>
            <strong>PARADISE</strong>
            <span>COLLECTION</span>
          </div>
        </button>

        <nav className="product-navigation">
          <button onClick={() => router.push("/shop")}>Home</button>
          <button onClick={() => router.push("/shop")}>New Arrivals</button>
          <button onClick={() => router.push("/shop")}>Party Wear</button>
          <button onClick={() => router.push("/shop")}>Wedding</button>
          <button onClick={() => router.push("/shop")}>Festive</button>
        </nav>

        <div className="product-header-actions">
          <button onClick={() => router.push("/wishlist")}>
            ♡
            {wishlistCount > 0 && <span>{wishlistCount}</span>}
          </button>

          <button onClick={() => router.push("/account")}>♙</button>

          <button onClick={() => router.push("/cart")}>
            ♧
            {cartCount > 0 && <span>{cartCount}</span>}
          </button>
        </div>
      </header>

      <div className="product-breadcrumb">
        <button onClick={() => router.push("/shop")}>Home</button>
        <span>›</span>
        <button onClick={() => router.push("/shop")}>
          {product.category}
        </button>
        <span>›</span>
        <strong>{product.name}</strong>
      </div>

      <section className="product-details-section">
        <div className="product-gallery">
          <div className="product-thumbnails">
            {product.images.map((image, index) => (
              <button
                key={index}
                className={
                  selectedImage === image
                    ? "product-thumbnail active-thumbnail"
                    : "product-thumbnail"
                }
                onClick={() => setSelectedImage(image)}
              >
                <img src={image} alt={`${product.name} ${index + 1}`} />
              </button>
            ))}
          </div>

          <div className="product-main-image">
            <span className="product-discount-badge">
              {discount}% OFF
            </span>

            <button
              className="product-wishlist-floating"
              onClick={addToWishlist}
            >
              ♡
            </button>

            <img src={selectedImage} alt={product.name} />
          </div>
        </div>

        <div className="product-information">
          <p className="product-category">{product.category}</p>

          <h1>{product.name}</h1>

          <div className="product-rating">
            <strong>★ {product.rating}</strong>
            <span>{product.reviews} Reviews</span>
          </div>

          <div className="product-price">
            <strong>₹{product.price.toLocaleString()}</strong>
            <del>₹{product.mrp.toLocaleString()}</del>
            <span>{discount}% OFF</span>
          </div>

          <small>Inclusive of all taxes</small>

          <p className="product-description">
            {product.description}
          </p>

          <div className="product-divider" />

          <div className="product-option">
            <div className="product-option-heading">
              <strong>Select Size</strong>
              <button>Size Guide</button>
            </div>

            <div className="product-size-options">
              {product.sizes.map((size) => (
                <button
                  key={size}
                  className={
                    selectedSize === size ? "selected-size" : ""
                  }
                  onClick={() => {
                    setSelectedSize(size);
                    setMessage("");
                  }}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div className="product-option">
            <strong>Select Colour</strong>

            <div className="product-color-options">
              {product.colors.map((color) => (
                <button
                  key={color}
                  className={
                    selectedColor === color ? "selected-color" : ""
                  }
                  onClick={() => setSelectedColor(color)}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>

          <div className="product-option">
            <strong>Quantity</strong>

            <div className="product-quantity">
              <button
                onClick={() =>
                  setQuantity((current) => Math.max(1, current - 1))
                }
              >
                −
              </button>

              <span>{quantity}</span>

              <button
                onClick={() =>
                  setQuantity((current) => current + 1)
                }
              >
                +
              </button>
            </div>
          </div>

          {message && <div className="product-message">{message}</div>}

          <div className="product-purchase-buttons">
            <button
              className="product-add-cart"
              onClick={addToCart}
            >
              Add To Bag
            </button>

            <button className="product-buy-now" onClick={buyNow}>
              Buy Now →
            </button>
          </div>

          <button
            className="product-wishlist-button"
            onClick={addToWishlist}
          >
            ♡ Add To Wishlist
          </button>

          <div className="product-benefits">
            <div>
              <strong>◇</strong>
              <span>
                <b>Free Delivery</b>
                Orders above ₹999
              </span>
            </div>

            <div>
              <strong>↻</strong>
              <span>
                <b>Easy Returns</b>
                Hassle-free shopping
              </span>
            </div>

            <div>
              <strong>♢</strong>
              <span>
                <b>Secure Shopping</b>
                Protected checkout
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="product-extra-information">
        <p>PARADISE COLLECTION</p>
        <h2>Thoughtfully Curated For You</h2>

        <div className="product-info-grid">
          <div>
            <strong>Premium Quality</strong>
            <span>Carefully selected fabrics and craftsmanship.</span>
          </div>

          <div>
            <strong>Elegant Design</strong>
            <span>Created for every woman and every occasion.</span>
          </div>

          <div>
            <strong>Trusted Shopping</strong>
            <span>Secure checkout and reliable delivery.</span>
          </div>
        </div>
      </section>
    </main>
  );
}

