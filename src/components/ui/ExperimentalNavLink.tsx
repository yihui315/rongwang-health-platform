"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { isExperimentalEnabled } from "@/lib/experimental";

export default function ExperimentalNavLink() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const sync = () => setShow(isExperimentalEnabled());
    sync();
    window.addEventListener("experimental-change", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("experimental-change", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  if (!show) return null;

  return (
    <Link href="/experimental" className="text-orange font-medium">
      🧪 实验
    </Link>
  );
}
