import { useEffect, useState } from "react";
import { shelfApi } from "../api/client";

export function useShelf() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    loadShelf();
  }, []);

  async function loadShelf() {
    setError("");
    try {
      const data = await shelfApi.getAll();
      setItems(data.items || []);
    } catch (err) {
      setError(err.message);
    }
  }

  async function createItem(payload) {
    const data = await shelfApi.create(payload);
    setItems((prev) => [data.item, ...prev]);
  }

  async function removeItem(id) {
    await shelfApi.remove(id);
    setItems((prev) => prev.filter((item) => item._id !== id));
  }

  return { items, error, createItem, removeItem };
}
