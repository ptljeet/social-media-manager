// src/routes/guards.jsx
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { isAuthed, isAdmin } from '../util/auth';

export function RequireAuth() {
  const loc = useLocation();
  if (!isAuthed()) return <Navigate to="/login" replace state={{ from: loc }} />;
  return <Outlet />;
}

export function RequireAdmin() {
  const loc = useLocation();
  if (!isAuthed()) return <Navigate to="/login" replace state={{ from: loc }} />;
  if (!isAdmin()) return <Navigate to="/dashboard" replace state={{ from: loc }} />;
  return <Outlet />;
}
