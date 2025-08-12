import React from 'react';
export function Card({ children, className="" }) {
  return <div className={`rounded-2xl border border-slate-200 bg-white shadow-sm ${className}`}>{children}</div>;
}
export function CardHeader({ title, subtitle, right }) {
  return (
    <div className="flex items-start justify-between p-4 border-b border-slate-200">
      <div>
        <h3 className="text-base font-semibold">{title}</h3>
        {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
      </div>
      {right}
    </div>
  );
}
export function CardBody({ children, className="" }) {
  return <div className={`p-4 ${className}`}>{children}</div>;
}
