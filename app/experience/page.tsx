"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ExperiencePage() {
  const router = useRouter();

  const [started, setStarted] = useState(false);
  const [doorsOpen, setDoorsOpen] = useState(false);
  const [entering, setEntering] = useState(false);

  useEffect(() => {
    if (!started) return;

    const doorTimer = setTimeout(() => {
      setDoorsOpen(true);
    }, 1800);

    const enterTimer = setTimeout(() => {
      setEntering(true);
    }, 4500);

    const redirectTimer = setTimeout(() => {
      router.push("/assistant");
    }, 6500);

    return () => {
      clearTimeout(doorTimer);
      clearTimeout(enterTimer);
      clearTimeout(redirectTimer);
    };
  }, [started, router]);

  function startExperience() {
    setStarted(true);
  }

  function skipIntro() {
    router.push("/assistant");
  }

  return (
    <main
      className={`mansion-page ${
        started ? "experience-started" : ""
      } ${entering ? "entering-mansion" : ""}`}
    >
      {/* CINEMATIC BACKGROUND */}

      <div className="mansion-background" />

      <div className="mansion-dark-overlay" />

      {/* LIGHT EFFECT */}

      <div
        className={`door-light ${
          doorsOpen ? "door-light-active" : ""
        }`}
      />

      {/* PARTICLES */}

      <div className="particles">
        {Array.from({ length: 25 }).map((_, index) => (
          <span
            key={index}
            style={{
              left: `${(index * 37) % 100}%`,
              animationDelay: `${(index % 8) * 0.5}s`,
              animationDuration: `${5 + (index % 6)}s`,
            }}
          />
        ))}
      </div>

      {/* BRAND */}

      <header className="experience-header">
        <div className="experience-logo">
          <div className="experience-logo-icon">P</div>

          <div>
            <strong>PARADISE</strong>
            <span>COLLECTION</span>
          </div>
        </div>

        {started && (
          <button
            className="skip-intro-button"
            onClick={skipIntro}
          >
            Skip Intro
          </button>
        )}
      </header>

      {/* DOOR AREA */}

      <section
        className={`door-stage ${
          doorsOpen ? "doors-are-open" : ""
        }`}
      >
        <div className="door-frame">
          <div className="door-inner-light" />

          <div className="mansion-door mansion-door-left">
            <div className="door-design">
              <div className="door-panel door-panel-top" />

              <div className="door-emblem">P</div>

              <div className="door-panel door-panel-bottom" />
            </div>

            <div className="door-handle left-handle" />
          </div>

          <div className="mansion-door mansion-door-right">
            <div className="door-design">
              <div className="door-panel door-panel-top" />

              <div className="door-emblem">C</div>

              <div className="door-panel door-panel-bottom" />
            </div>

            <div className="door-handle right-handle" />
          </div>
        </div>
      </section>

      {/* INTRO CONTENT */}

      {!started && (
        <section className="experience-content">
          <p>YOUR PRIVATE FASHION DESTINATION</p>

          <h1>
            Welcome To
            <br />
            Paradise
          </h1>

          <span>
            Beyond these doors awaits a shopping experience
            created especially for you.
          </span>

          <button onClick={startExperience}>
            Enter Paradise

            <b>→</b>
          </button>

          <small>
            Best experienced with sound enabled
          </small>
        </section>
      )}

      {/* CINEMATIC TEXT */}

      {started && !doorsOpen && (
        <div className="cinematic-message">
          <p>WELCOME</p>

          <h2>Your Paradise Awaits</h2>
        </div>
      )}

      {doorsOpen && (
        <div className="enter-message">
          <span>ENTERING PARADISE COLLECTION</span>
        </div>
      )}
    </main>
  );
}