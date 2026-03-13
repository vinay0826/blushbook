import { useEffect, useState } from "react";
import { reviewApi } from "../api/client";

export function useReviews() {
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadReviews();
  }, []);

  async function loadReviews() {
    setIsLoading(true);
    setError("");
    try {
      const data = await reviewApi.getAll();
      setReviews(data.reviews || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  async function createReview(payload) {
    const data = await reviewApi.create(payload);
    setReviews((prev) => [data.review, ...prev]);
  }

  async function likeReview(reviewId) {
    const data = await reviewApi.like(reviewId);
    setReviews((prev) =>
      prev.map((review) => (review._id === reviewId ? data.review : review))
    );
  }

  return { reviews, isLoading, error, createReview, likeReview };
}
