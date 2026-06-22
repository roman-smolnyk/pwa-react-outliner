import yjs from "@/store/yjsManager";
import { getBookmarks } from "esm-treero-api";
import { useEffect, useState } from "react";

export default function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<string[]>([]);

  useEffect(() => {
    const ybookmarks = getBookmarks(yjs.ydoc);
    setBookmarks(ybookmarks.toArray());

    function observer() {
      console.debug("Explorer:observer", ybookmarks.toArray());
      setBookmarks(ybookmarks.toArray());
    }
    ybookmarks.observe(observer);
    return () => {
      ybookmarks.unobserve(observer);
    };
  }, []);

  return bookmarks;
}
