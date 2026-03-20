import { useEffect, useState } from "react";
import { authStorage, commentApi, followApi, reviewApi } from "../api/client";

function currentUserFromStorage() {
  try {
    const raw = window.localStorage.getItem("between_the_lines_user");
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function displayUserName(user) {
  if (!user) return "Reader";
  const full = `${user.firstName || ""} ${user.lastName || ""}`.trim();
  return full || user.email || "Reader";
}

function initialsFromName(name) {
  return String(name || "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");
}

function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString();
}

export default function ProfilePage() {
  const user = currentUserFromStorage();
  const [activeTab, setActiveTab] = useState("posts");
  const [posts, setPosts] = useState([]);
  const [reposts, setReposts] = useState([]);
  const [comments, setComments] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [counts, setCounts] = useState({ posts: 0, reposts: 0, comments: 0 });
  const [stats, setStats] = useState({ followersCount: 0, followingCount: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = window.localStorage.getItem(authStorage.tokenKey);
    if (!token) {
      window.location.assign("/login");
    }
  }, []);

  useEffect(() => {
    if (!user?.id) return;

    async function loadStats() {
      try {
        const data = await followApi.get(user.id);
        setStats({
          followersCount: data.followersCount || 0,
          followingCount: data.followingCount || 0
        });
      } catch {
        setStats({ followersCount: 0, followingCount: 0 });
      }
    }

    loadStats();
  }, [user?.id]);

  useEffect(() => {
    async function loadTab() {
      setLoading(true);
      setError("");
      try {
        if (activeTab === "posts") {
          const data = await reviewApi.listMine({ type: "posts", sort: "recent", limit: 20 });
          setPosts(data.reviews || []);
          setCounts((prev) => ({
            ...prev,
            posts: data.pagination?.total ?? (data.reviews || []).length
          }));
        }

        if (activeTab === "reposts") {
          const data = await reviewApi.listMine({ type: "reposts", sort: "recent", limit: 20 });
          setReposts(data.reviews || []);
          setCounts((prev) => ({
            ...prev,
            reposts: data.pagination?.total ?? (data.reviews || []).length
          }));
        }

        if (activeTab === "comments") {
          const data = await commentApi.listMine();
          setComments(data.comments || []);
          setCounts((prev) => ({ ...prev, comments: (data.comments || []).length }));
        }

        if (activeTab === "followers") {
          const data = await followApi.listFollowers(user.id);
          setFollowers(data.users || []);
        }

        if (activeTab === "following") {
          const data = await followApi.listFollowing(user.id);
          setFollowing(data.users || []);
        }
      } catch (err) {
        setError(err.message || "Unable to load your profile yet.");
      } finally {
        setLoading(false);
      }
    }

    loadTab();
  }, [activeTab]);

  return (
    <div className="profile-page fade-in">
      <div className="profile-header">
        <div className="profile-card">
          <div className="profile-avatar">{initialsFromName(displayUserName(user))}</div>
          <div>
            <p className="profile-name">{displayUserName(user)}</p>
            <p className="profile-email">{user?.email || ""}</p>
          </div>
          <button type="button" className="profile-back" onClick={() => window.location.assign("/feed")}>
            Back to feed
          </button>
        </div>

        <div className="profile-stats">
          <div className="profile-stat">
            <span className="profile-stat-value">{counts.posts}</span>
            <span className="profile-stat-label">Posts</span>
          </div>
          <div className="profile-stat">
            <span className="profile-stat-value">{counts.reposts}</span>
            <span className="profile-stat-label">Reposts</span>
          </div>
          <div className="profile-stat">
            <span className="profile-stat-value">{counts.comments}</span>
            <span className="profile-stat-label">Comments</span>
          </div>
          <div className="profile-stat">
            <span className="profile-stat-value">{stats.followersCount}</span>
            <span className="profile-stat-label">Followers</span>
          </div>
          <div className="profile-stat">
            <span className="profile-stat-value">{stats.followingCount}</span>
            <span className="profile-stat-label">Following</span>
          </div>
        </div>
      </div>

      <div className="profile-tabs">
        <button
          type="button"
          className={activeTab === "posts" ? "profile-tab active" : "profile-tab"}
          onClick={() => setActiveTab("posts")}
        >
          My Posts
        </button>
        <button
          type="button"
          className={activeTab === "reposts" ? "profile-tab active" : "profile-tab"}
          onClick={() => setActiveTab("reposts")}
        >
          My Reposts
        </button>
        <button
          type="button"
          className={activeTab === "comments" ? "profile-tab active" : "profile-tab"}
          onClick={() => setActiveTab("comments")}
        >
          My Comments
        </button>
        <button
          type="button"
          className={activeTab === "followers" ? "profile-tab active" : "profile-tab"}
          onClick={() => setActiveTab("followers")}
        >
          Followers
        </button>
        <button
          type="button"
          className={activeTab === "following" ? "profile-tab active" : "profile-tab"}
          onClick={() => setActiveTab("following")}
        >
          Following
        </button>
      </div>

      <section className="profile-section">
        {loading && <p className="profile-info">Loading your shelf...</p>}
        {error && <p className="profile-error">{error}</p>}

        {!loading && !error && activeTab === "posts" && posts.length === 0 && (
          <p className="profile-empty">You have not posted yet.</p>
        )}

        {!loading && !error && activeTab === "reposts" && reposts.length === 0 && (
          <p className="profile-empty">No reposts yet. Save your favorite reads here.</p>
        )}

        {!loading && !error && activeTab === "comments" && comments.length === 0 && (
          <p className="profile-empty">No comments yet. Join a thread to start chatting.</p>
        )}

        {!loading && !error && activeTab === "followers" && followers.length === 0 && (
          <p className="profile-empty">No followers yet.</p>
        )}

        {!loading && !error && activeTab === "following" && following.length === 0 && (
          <p className="profile-empty">Not following anyone yet.</p>
        )}

        {!loading && !error && activeTab === "posts" && (
          <div className="profile-list">
            {posts.map((review) => (
              <article key={review._id} className="profile-item">
                <div className="profile-item-header">
                  <h3>{review.bookTitle}</h3>
                  <span className="profile-badge">Post</span>
                </div>
                <p className="profile-item-meta">
                  {review.author ? `by ${review.author} • ` : ""}{formatDate(review.createdAt)}
                </p>
                <p className="profile-item-body">
                  {review.review.length > 180
                    ? `${review.review.slice(0, 180)}...`
                    : review.review}
                </p>
                <div className="profile-item-tags">
                  <span>{review.genre}</span>
                  {review.mood && <span>{review.mood}</span>}
                </div>
              </article>
            ))}
          </div>
        )}

        {!loading && !error && activeTab === "reposts" && (
          <div className="profile-list">
            {reposts.map((review) => (
              <article key={review._id} className="profile-item">
                <div className="profile-item-header">
                  <h3>{review.bookTitle}</h3>
                  <span className="profile-badge">Repost</span>
                </div>
                <p className="profile-item-meta">
                  {review.author ? `by ${review.author} • ` : ""}{formatDate(review.createdAt)}
                </p>
                <p className="profile-item-body">
                  {review.review.length > 180
                    ? `${review.review.slice(0, 180)}...`
                    : review.review}
                </p>
                <div className="profile-item-tags">
                  <span>{review.genre}</span>
                  {review.mood && <span>{review.mood}</span>}
                </div>
              </article>
            ))}
          </div>
        )}

        {!loading && !error && activeTab === "comments" && (
          <div className="profile-list">
            {comments.map((comment) => (
              <article key={comment._id} className="profile-item">
                <div className="profile-item-header">
                  <h3>{comment.reviewTitle || "Review"}</h3>
                  <span className="profile-badge">Comment</span>
                </div>
                <p className="profile-item-meta">{formatDate(comment.createdAt)}</p>
                <p className="profile-item-body">{comment.content}</p>
              </article>
            ))}
          </div>
        )}

        {!loading && !error && activeTab === "followers" && (
          <div className="profile-list">
            {followers.map((person) => (
              <article key={person.id} className="profile-item profile-person">
                <div className="profile-avatar small">{initialsFromName(person.name)}</div>
                <div>
                  <p className="profile-name">{person.name}</p>
                  <p className="profile-email">{person.email || ""}</p>
                </div>
                <button
                  type="button"
                  className="profile-visit"
                  onClick={() => window.location.assign(`/user/${person.id}`)}
                >
                  View
                </button>
              </article>
            ))}
          </div>
        )}

        {!loading && !error && activeTab === "following" && (
          <div className="profile-list">
            {following.map((person) => (
              <article key={person.id} className="profile-item profile-person">
                <div className="profile-avatar small">{initialsFromName(person.name)}</div>
                <div>
                  <p className="profile-name">{person.name}</p>
                  <p className="profile-email">{person.email || ""}</p>
                </div>
                <button
                  type="button"
                  className="profile-visit"
                  onClick={() => window.location.assign(`/user/${person.id}`)}
                >
                  View
                </button>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
