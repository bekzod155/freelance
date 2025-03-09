import React from "react";
import { Link } from "react-router-dom";
import logo from "../assets/gerb.png"; // Adjust the path to your image

const Navbar = () => {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark">
      <div className="container">
        {/* Image as a Link */}
        <Link className="navbar-brand" to="/">
          <img src={logo} alt="Logo" width="100" height="100" className="d-inline-block align-top" />
        </Link>
				<h2 className="text-light me-auto">Urganch shahar hokimligi</h2>

			<div id="phone" className="navbar-nav d-flex flex-column text-light text-center ">
				<h2>1088</h2>
				<p>Ishonch telefoni</p>
			</div>
      </div>
    </nav>
  );
};

export default Navbar;
