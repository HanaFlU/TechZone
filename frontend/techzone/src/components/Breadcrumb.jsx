import React from "react";
import { Link } from "react-router-dom";
import { HomeIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

const Breadcrumb = ({ items = [] }) => (
  <nav className="flex items-center text-sm mb-4 text-secondary" aria-label="Breadcrumb">
    <Link to="/" className="flex items-center hover:text-emerald-700">
      <HomeIcon className="h-5 w-5 mr-1" />
    </Link>
    {items.map((item, idx) => (
      <span key={idx} className="flex items-center">
        <span className="mx-2">
            <ChevronRightIcon className="h-3 w-3" />
        </span>
        {item.to ? (
          <Link to={item.to} className="hover:text-emerald-700">{item.label}</Link>
        ) : (
          <span className="text-light-green font-medium">{item.label}</span>
        )}
      </span>
    ))}
  </nav>
);

export default Breadcrumb;