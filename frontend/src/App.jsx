import HomePage from "./pages/HomePage";
import AuthNotebookPage from "./pages/AuthNotebookPage";
import FeedPage from "./pages/FeedPage";
import BlueprintPage from "./pages/BlueprintPage";

export default function App() {
  const pathname = typeof window !== "undefined" ? window.location.pathname : "/";
  const normalizedPathname = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  const isFeedPage = normalizedPathname === "/feed" || normalizedPathname === "/journal";
  const isBlueprintPage = normalizedPathname === "/blueprint";
  const isLoginPage = normalizedPathname === "/login";
  const isRegisterPage =
    normalizedPathname === "/register" || normalizedPathname === "/create-account";
  const isAuthPage = isLoginPage || isRegisterPage;

  let page = <HomePage />;
  if (isFeedPage) page = <FeedPage />;
  if (isBlueprintPage) page = <BlueprintPage />;
  if (isLoginPage) page = <AuthNotebookPage initialMode="login" />;
  if (isRegisterPage) page = <AuthNotebookPage initialMode="register" />;

  return (
    <div
      className={`app-root ${isAuthPage ? "app-root-auth" : ""} ${isFeedPage ? "app-root-feed" : ""} ${isBlueprintPage ? "app-root-blueprint" : ""}`}
    >
      {page}
    </div>
  );
}
