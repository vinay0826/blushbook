import HomePage from "./pages/HomePage";
import AuthNotebookPage from "./pages/AuthNotebookPage";
import FeedPage from "./pages/FeedPage";
import BlueprintPage from "./pages/BlueprintPage";
import ProfilePage from "./pages/ProfilePage";
import PostPage from "./pages/PostPage";
import UserProfilePage from "./pages/UserProfilePage";
import ChatPage from "./pages/ChatPage";

export default function App() {
  const pathname = typeof window !== "undefined" ? window.location.pathname : "/";
  const normalizedPathname = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  const isFeedPage = normalizedPathname === "/feed" || normalizedPathname === "/journal";
  const isBlueprintPage = normalizedPathname === "/blueprint";
  const isProfilePage = normalizedPathname === "/profile";
  const isPostPage = normalizedPathname.startsWith("/post/");
  const isUserProfilePage = normalizedPathname.startsWith("/user/");
  const isChatPage = normalizedPathname === "/chat" || normalizedPathname.startsWith("/chat/");
  const isLoginPage = normalizedPathname === "/login";
  const isRegisterPage =
    normalizedPathname === "/register" || normalizedPathname === "/create-account";
  const isAuthPage = isLoginPage || isRegisterPage;

  let page = <HomePage />;
  if (isFeedPage) page = <FeedPage />;
  if (isBlueprintPage) page = <BlueprintPage />;
  if (isProfilePage) page = <ProfilePage />;
  if (isPostPage) page = <PostPage />;
  if (isUserProfilePage) page = <UserProfilePage />;
  if (isChatPage) page = <ChatPage />;
  if (isLoginPage) page = <AuthNotebookPage initialMode="login" />;
  if (isRegisterPage) page = <AuthNotebookPage initialMode="register" />;

  return (
    <div
      className={`app-root ${isAuthPage ? "app-root-auth" : ""} ${isFeedPage || isProfilePage || isPostPage || isUserProfilePage || isChatPage ? "app-root-feed" : ""} ${isBlueprintPage ? "app-root-blueprint" : ""}`}
    >
      {page}
    </div>
  );
}
