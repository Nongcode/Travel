"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { packages as seedPackages, posts as seedPosts } from "../../data/travel";

type AdminPost = {
  id: number;
  title: string;
  category: string;
  date: string;
  status: string;
};

type AdminPackage = {
  id: number;
  name: string;
  destination: string;
  duration: string;
  price: string;
  status: string;
};

type AdminContextValue = {
  posts: AdminPost[];
  packages: AdminPackage[];
  addPost: (p: { title: string; category: string; status?: string; date?: string }) => void;
  updatePost: (id: number, updated: Partial<AdminPost>) => void;
  removePost: (id: number) => void;
  addPackage: (p: { name: string; destination: string; duration?: string; price?: string; status?: string }) => void;
  updatePackage: (id: number, updated: Partial<AdminPackage>) => void;
  removePackage: (id: number) => void;
  isAuthenticated: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  resetDatabase: () => void;
};

const AdminContext = createContext<AdminContextValue | undefined>(undefined);

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const postStorageKey = "vietvista-admin-posts";
  const packageStorageKey = "vietvista-admin-packages";
  const authStorageKey = "vietvista-admin-auth";

  const initialPosts: AdminPost[] = seedPosts.map(({ id, title, category, date, status }) => ({ id, title, category, date, status }));
  const initialPackages: AdminPackage[] = seedPackages.map(({ id, name, destination, duration, price, status }) => ({ id, name, destination, duration, price, status }));

  const [posts, setPosts] = useState<AdminPost[]>(() => {
    if (typeof window === "undefined") return initialPosts;
    const saved = window.localStorage.getItem(postStorageKey);
    return saved ? JSON.parse(saved) : initialPosts;
  });

  const [packages, setPackages] = useState<AdminPackage[]>(() => {
    if (typeof window === "undefined") return initialPackages;
    const saved = window.localStorage.getItem(packageStorageKey);
    return saved ? JSON.parse(saved) : initialPackages;
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return !!window.localStorage.getItem(authStorageKey);
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(postStorageKey, JSON.stringify(posts));
  }, [posts]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(packageStorageKey, JSON.stringify(packages));
  }, [packages]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (isAuthenticated) window.localStorage.setItem(authStorageKey, "1");
    else window.localStorage.removeItem(authStorageKey);
  }, [isAuthenticated]);

  function addPost(p: { title: string; category: string; status?: string; date?: string }) {
    setPosts((current) => [
      {
        id: Date.now(),
        title: p.title,
        category: p.category,
        date: p.date ?? new Date().toLocaleDateString("vi-VN"),
        status: p.status ?? "Bản nháp",
      },
      ...current,
    ]);
  }

  function updatePost(id: number, updated: Partial<AdminPost>) {
    setPosts((current) => current.map((post) => (post.id === id ? { ...post, ...updated } : post)));
  }

  function removePost(id: number) {
    setPosts((current) => current.filter((p) => p.id !== id));
  }

  function addPackage(p: { name: string; destination: string; duration?: string; price?: string; status?: string }) {
    setPackages((current) => [
      {
        id: Date.now(),
        name: p.name,
        destination: p.destination,
        duration: p.duration ?? "3 ngày 2 đêm",
        price: p.price ?? "Liên hệ",
        status: p.status ?? "Đang mở",
      },
      ...current,
    ]);
  }

  function updatePackage(id: number, updated: Partial<AdminPackage>) {
    setPackages((current) => current.map((it) => (it.id === id ? { ...it, ...updated } : it)));
  }

  function removePackage(id: number) {
    setPackages((current) => current.filter((i) => i.id !== id));
  }

  function login(username: string, password: string) {
    const ok = username === "admin" && password === "password";
    if (ok) setIsAuthenticated(true);
    return ok;
  }

  function logout() {
    setIsAuthenticated(false);
  }

  function resetDatabase() {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(postStorageKey);
      window.localStorage.removeItem(packageStorageKey);
    }
    setPosts(initialPosts);
    setPackages(initialPackages);
  }

  const value: AdminContextValue = {
    posts,
    packages,
    addPost,
    updatePost,
    removePost,
    addPackage,
    updatePackage,
    removePackage,
    isAuthenticated,
    login,
    logout,
    resetDatabase,
  };

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be used inside AdminProvider");
  return ctx;
}
