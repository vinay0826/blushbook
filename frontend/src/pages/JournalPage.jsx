import HeroPanel from "../components/layout/HeroPanel";
import Navbar from "../components/layout/Navbar";
import ReviewComposer from "../components/reviews/ReviewComposer";
import ReviewFeed from "../components/reviews/ReviewFeed";
import ShelfManager from "../components/shelf/ShelfManager";
import { useReviews } from "../hooks/useReviews";
import { useShelf } from "../hooks/useShelf";

export default function JournalPage() {
  const {
    reviews,
    isLoading: isLoadingReviews,
    error: reviewError,
    createReview,
    likeReview
  } = useReviews();
  const { items, error: shelfError, createItem, removeItem } = useShelf();

  return (
    <>
      <Navbar />
      <main className="relative z-10 mx-auto max-w-7xl px-3 pb-14 pt-4 sm:px-6 sm:pb-16 sm:pt-6">
        <HeroPanel />

        <div className="mt-5 grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-5">
            <ReviewComposer onCreate={createReview} />
            <ReviewFeed
              reviews={reviews}
              isLoading={isLoadingReviews}
              error={reviewError}
              onLike={likeReview}
            />
          </div>
          <div className="space-y-5">
            <ShelfManager
              items={items}
              error={shelfError}
              onCreate={createItem}
              onRemove={removeItem}
            />
          </div>
        </div>
      </main>
    </>
  );
}
