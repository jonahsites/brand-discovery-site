"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/store";

export default function SearchPage() {
  const { openSearch } = useApp();
  const router = useRouter();
  useEffect(() => { openSearch(true); router.replace("/"); }, [openSearch, router]);
  return null;
}
