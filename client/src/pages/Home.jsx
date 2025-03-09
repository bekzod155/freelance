import React, { useEffect,useRef } from "react";
import { ReactTyped } from "react-typed";
const baseURL = process.env.BASE_URL || 'http://localhost:5000';

const Home = () => {
  // Add useEffect to make the GET request when the component mounts
  const hasMounted = useRef(false); // Tracks if component has mounted

  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true; // Mark as mounted
      fetch(`${baseURL}/home_visits`, { method: "GET" })
        .then((response) => {
          if (!response.ok) {
            console.error("Failed to track home visit");
          }
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    }
  }, []); // Empty dependency array means it runs on mount
  return (
    <div id="homeCont" className="container d-flex flex-column text-center ">
      <div id="animation" className="mt-5 animation-height">
        <h2>
          <ReactTyped
            strings={[
              "Ushbu loyiha Urganch shahar hokimligi tomonidan yoʻlga qoʻyilgan va sinov tarzida ishlamoqda. Ish beruvchi va ish izlovchilar oʻrtasida toʻgʻridan toʻgʻri muloqot boʻlishi tufayli shaxsga doir ma'lumotlar va pul munosabatlarida ehtiyot boʻlishingizni soʻraymiz.",
            ]}
            typeSpeed={4}
          />
        </h2>
      </div>

      <div className="mt-3 flex-row container justify-content-center align-items-center text-center">
        <a id="btn" href="/auth" className="btn fs-4 me-5">
          ISH BERUVCHI
        </a>
        <a id="btn" href="/worker" className="btn fs-4">
          ISH IZLOVCHI
        </a>
      </div>
    </div>
  );
};

export default Home;