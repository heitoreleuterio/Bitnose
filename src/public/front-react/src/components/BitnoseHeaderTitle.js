import React from "react";
import { Link } from "react-router-dom";
import "../styles/bitnose-header-title.css"

export default function BitnoseHeaderTitle() {
    return (
        <Link className="bitnose-title" to="/" > <i className="bitnose-title-decorated">B</i>itnose</Link>
    );
}