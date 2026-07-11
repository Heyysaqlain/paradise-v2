"use client";

import "./account.css";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/lib/client";
import type { User } from "@supabase/supabase-js";

export default function AccountPage() {
  const router = useRouter();

  const [loaded, setLoaded] = useState(false);
  const [authUser, setAuthUser] = useState<User | null>(null);

  const [wishlistCount, setWishlistCount] = useState(0);
  const [cartCount, setCartCount] = useState(0);
  const [ordersCount, setOrdersCount] = useState(0);

  useEffect(() => {
    const supabase = createClient();

    async function loadAccount() {
      try {
        // =====================================================
        // GET CURRENT LOGGED-IN USER
        // =====================================================

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          router.replace("/");
          return;
        }

        setAuthUser(user);

        // =====================================================
        // GET USER-SPECIFIC COUNTS FROM SUPABASE
        // =====================================================

        const [
          wishlistResult,
          cartResult,
          ordersResult,
        ] = await Promise.all([
          supabase
            .from("wishlist_items")
            .select("*", {
              count: "exact",
              head: true,
            })
            .eq("user_id", user.id),

          supabase
            .from("cart_items")
            .select("*", {
              count: "exact",
              head: true,
            })
            .eq("user_id", user.id),

          supabase
            .from("orders")
            .select("*", {
              count: "exact",
              head: true,
            })
            .eq("user_id", user.id),
        ]);

        // =====================================================
        // LOG ERRORS IF ANY
        // =====================================================

        if (wishlistResult.error) {
          console.error(
            "Wishlist count error:",
            wishlistResult.error
          );
        }

        if (cartResult.error) {
          console.error(
            "Cart count error:",
            cartResult.error
          );
        }

        if (ordersResult.error) {
          console.error(
            "Orders count error:",
            ordersResult.error
          );
        }

        // =====================================================
        // SET COUNTS
        // =====================================================

        setWishlistCount(wishlistResult.count ?? 0);

        setCartCount(cartResult.count ?? 0);

        setOrdersCount(ordersResult.count ?? 0);
      } catch (error) {
        console.error("Could not load account:", error);

        router.replace("/");
      } finally {
        setLoaded(true);
      }
    }

    loadAccount();

    // =========================================================
    // LISTEN FOR AUTH CHANGES
    // =========================================================

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        router.replace("/");
        return;
      }

      setAuthUser(session.user);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  // ===========================================================
  // LOGOUT
  // ===========================================================

  async function logout() {
    const supabase = createClient();

    try {
      await supabase.auth.signOut();

      router.replace("/");

      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
    }
  }

  // ===========================================================
  // USER NAME
  // ===========================================================

  function getFullName() {
    if (!authUser) {
      return "Paradise Customer";
    }

    return (
      authUser.user_metadata?.full_name ||
      authUser.user_metadata?.name ||
      authUser.email?.split("@")[0] ||
      "Paradise Customer"
    );
  }

  // ===========================================================
  // EMAIL
  // ===========================================================

  function getEmail() {
    return authUser?.email || "No email available";
  }

  // ===========================================================
  // MOBILE
  // ===========================================================

  function getMobile() {
    const mobile =
      authUser?.user_metadata?.mobile ||
      authUser?.phone ||
      "";

    if (!mobile) {
      return "Not added";
    }

    if (mobile.startsWith("+")) {
      return mobile;
    }

    return `+91 ${mobile}`;
  }

  // ===========================================================
  // AVATAR LETTER
  // ===========================================================

  function getAvatarLetter() {
    const fullName = getFullName();

    return fullName.charAt(0).toUpperCase();
  }

  // ===========================================================
  // LOADING SCREEN
  // ===========================================================

  if (!loaded) {
    return (
      <main className="account-loading">
        <div className="account-loading-logo">P</div>

        <p>PARADISE COLLECTION</p>

        <span>Preparing your account...</span>
      </main>
    );
  }

  // ===========================================================
  // NO USER
  // ===========================================================

  if (!authUser) {
    return (
      <main className="account-loading">
        <div className="account-loading-logo">P</div>

        <p>PARADISE COLLECTION</p>

        <span>Redirecting to login...</span>
      </main>
    );
  }

  const fullName = getFullName();

  const email = getEmail();

  const mobile = getMobile();

  return (
    <main className="account-page">
      {/* TOP BAR */}

      <div className="account-offer-bar">
        <span>FREE SHIPPING ON ORDERS ABOVE ₹999</span>

        <span>WELCOME TO PARADISE COLLECTION</span>
      </div>

      {/* HEADER */}

      <header className="account-header">
        <button
          className="account-brand"
          onClick={() => router.push("/shop")}
        >
          <div className="account-logo">P</div>

          <div>
            <strong>PARADISE</strong>

            <span>COLLECTION</span>
          </div>
        </button>

        <nav className="account-navigation">
          <button onClick={() => router.push("/shop")}>
            Shop
          </button>

          <button onClick={() => router.push("/orders")}>
            My Orders
          </button>

          <button onClick={() => router.push("/wishlist")}>
            Wishlist
          </button>
        </nav>

        <div className="account-header-actions">
          <button onClick={() => router.push("/wishlist")}>
            <span>♡</span>

            <small>Wishlist</small>

            {wishlistCount > 0 && <b>{wishlistCount}</b>}
          </button>

          <button onClick={() => router.push("/account")}>
            <span>♙</span>

            <small>Account</small>
          </button>

          <button onClick={() => router.push("/cart")}>
            <span>◇</span>

            <small>Cart</small>

            {cartCount > 0 && <b>{cartCount}</b>}
          </button>
        </div>
      </header>

      {/* ACCOUNT HERO */}

      <section className="account-profile-hero">
        <p>YOUR PARADISE ACCOUNT</p>

        <h1>
          Welcome,
          <br />

          <em>{fullName}.</em>
        </h1>

        <span>
          Manage your Paradise orders, favourites and account
          information.
        </span>
      </section>

      {/* DASHBOARD */}

      <section className="account-dashboard">
        {/* SIDEBAR */}

        <div className="account-sidebar">
          <div className="account-user-card">
            <div className="account-avatar">
              {getAvatarLetter()}
            </div>

            <div>
              <p>PARADISE MEMBER</p>

              <h3>{fullName}</h3>

              <span>{email}</span>
            </div>
          </div>

          <div className="account-menu">
            <button className="account-menu-active">
              <span>♙</span>

              My Profile
            </button>

            <button onClick={() => router.push("/orders")}>
              <span>◇</span>

              My Orders
            </button>

            <button onClick={() => router.push("/wishlist")}>
              <span>♡</span>

              My Wishlist
            </button>

            <button onClick={() => router.push("/shop")}>
              <span>⌂</span>

              Continue Shopping
            </button>

            <button
              className="account-logout-menu"
              onClick={logout}
            >
              <span>↪</span>

              Logout
            </button>
          </div>
        </div>

        {/* MAIN CONTENT */}

        <div className="account-dashboard-content">
          <div className="account-dashboard-heading">
            <div>
              <p>ACCOUNT OVERVIEW</p>

              <h2>My Paradise</h2>
            </div>

            <button
              className="account-logout-button"
              onClick={logout}
            >
              Logout
            </button>
          </div>

          {/* STATS */}

          <div className="account-stats">
            <button onClick={() => router.push("/orders")}>
              <strong>{ordersCount}</strong>

              <span>My Orders</span>

              <small>View purchases →</small>
            </button>

            <button onClick={() => router.push("/wishlist")}>
              <strong>{wishlistCount}</strong>

              <span>Wishlist Items</span>

              <small>View favourites →</small>
            </button>

            <button onClick={() => router.push("/cart")}>
              <strong>{cartCount}</strong>

              <span>Shopping Bag</span>

              <small>View shopping bag →</small>
            </button>
          </div>

          {/* PROFILE INFORMATION */}

          <div className="account-information-card">
            <div className="account-card-heading">
              <div>
                <p>PERSONAL INFORMATION</p>

                <h3>Profile Details</h3>
              </div>

              <span>PARADISE MEMBER</span>
            </div>

            <div className="account-information-grid">
              <div>
                <small>FULL NAME</small>

                <strong>{fullName}</strong>
              </div>

              <div>
                <small>EMAIL ADDRESS</small>

                <strong>{email}</strong>
              </div>

              <div>
                <small>MOBILE NUMBER</small>

                <strong>{mobile}</strong>
              </div>

              <div>
                <small>ACCOUNT STATUS</small>

                <strong className="account-active-status">
                  ✓ Active
                </strong>
              </div>
            </div>
          </div>

          {/* QUICK ACTIONS */}

          <div className="account-quick-actions">
            <p>QUICK ACCESS</p>

            <h3>Continue Your Paradise Journey</h3>

            <div>
              <button onClick={() => router.push("/shop")}>
                <span>◇</span>

                <strong>Explore Collection</strong>

                <small>
                  Discover new Paradise styles
                </small>
              </button>

              <button
                onClick={() => router.push("/wishlist")}
              >
                <span>♡</span>

                <strong>My Wishlist</strong>

                <small>
                  View your saved favourites
                </small>
              </button>

              <button onClick={() => router.push("/orders")}>
                <span>♧</span>

                <strong>Track Orders</strong>

                <small>
                  View your Paradise purchases
                </small>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* BENEFITS */}

      <section className="account-benefits">
        <div>
          <strong>◇</strong>

          <span>
            <b>Premium Quality</b>

            Curated Collections
          </span>
        </div>

        <div>
          <strong>♧</strong>

          <span>
            <b>Free Delivery</b>

            Orders Above ₹999
          </span>
        </div>

        <div>
          <strong>↻</strong>

          <span>
            <b>Easy Returns</b>

            Hassle-Free Shopping
          </span>
        </div>

        <div>
          <strong>♙</strong>

          <span>
            <b>Secure Shopping</b>

            Trusted Checkout
          </span>
        </div>
      </section>

      {/* FOOTER */}

      <footer className="account-footer">
        <div className="account-footer-brand">
          <div className="account-footer-logo">
            <div className="account-logo">P</div>

            <div>
              <strong>PARADISE</strong>

              <span>COLLECTION</span>
            </div>
          </div>

          <p>
            Premium fashion, thoughtfully curated for every woman
            and every occasion.
          </p>
        </div>

        <div>
          <strong>SHOP</strong>

          <button onClick={() => router.push("/shop")}>
            New Arrivals
          </button>

          <button onClick={() => router.push("/shop")}>
            Party Wear
          </button>

          <button onClick={() => router.push("/shop")}>
            Wedding
          </button>

          <button onClick={() => router.push("/shop")}>
            Festive
          </button>
        </div>

        <div>
          <strong>HELP</strong>

          <button onClick={() => router.push("/orders")}>
            My Orders
          </button>

          <button>Returns</button>

          <button>Shipping</button>

          <button>Contact Us</button>
        </div>

        <div>
          <strong>ABOUT</strong>

          <button>Our Story</button>

          <button>Privacy Policy</button>

          <button>Terms</button>
        </div>
      </footer>
    </main>
  );
}