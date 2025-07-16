"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Search } from "lucide-react";

export default function SearchInput() {
  const [query, setQuery] = useState("");

  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) {
      return; // لا تقم بالبحث إذا كان الحقل فارغًا
    }
    //   encodeURIComponent:  صالح URL تقوم بـ تحويل أي نص فيه مسافات أو رموز إلى تنسيق javascript هذه الدالة
    // إعادة التوجيه إلى صفحة البحث مع تمرير الاستعلام
    router.push(`/dashboard/search?q=${encodeURIComponent(query)}`);
  };
  return (
    <form
      onSubmit={handleSearch}
      className="flex w-full max-w-sm items-center space-x-2"
    >
      <Input
        type="text"
        placeholder="Search for posts..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="flex-grow"
      />
      <Button type="submit" size="icon">
        <Search className="h-4 w-4" />
      </Button>
    </form>
  );
}
