import React from 'react';
const base = "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60";
const variants = {
  primary: "bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-600",
  secondary: "bg-white text-slate-900 border border-slate-300 hover:bg-slate-50 focus:ring-slate-400",
  danger: "bg-rose-600 text-white hover:bg-rose-700 focus:ring-rose-600",
  ghost: "bg-transparent text-slate-700 hover:bg-slate-100 focus:ring-slate-400",
};
export default function Button({ variant="primary", className="", ...props }) {
  return <button className={`${base} ${variants[variant]} ${className}`} {...props} />;
}
