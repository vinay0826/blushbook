import { useEffect, useState } from "react";
import { authStorage, followApi, reviewApi, userApi } from "../api/client";

function initialsFromName(name) {
  return String(name || "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");
}

function currentUserFromStorage() {
  try {
    const raw = window.localStorage.getItem("between_the_lines_user");
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString();
}

export default function UserProfilePage() {
  const currentUser = currentUserFromStorage();
  const path = typeof window !== "undefined" ? window.location.pathname : "";
  const userId = path.split("/user/")[1] || "";

  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({ followersCount: 0, followingCount: 0, isFollowing: false });
  const [activeTab, setActiveTab] = useState("posts");
  const [posts, setPosts] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProfile() {
      setLoading(true);
      setError("");
      try {
        const [userData, followData] = await Promise.all([
          userApi.get(userId),
          followApi.get(userId)
        ]);
        setProfile(userData.user);
        setStats({
          followersCount: followData.followersCount || 0,
          followingCount: followData.followingCount || 0,
          isFollowing: Boolean(followData.isFollowing)
        });
      } catch (err) {
        setError(err.message || "Unable to load this profile.");
      } finally {
        setLoading(false);
      }
    }

    if (userId) loadProfile();
  }, [userId]);

  useEffect(() => {
    async function loadTab() {
      setLoading(true);
      setError("");
      try {
        if (activeTab === "posts") {
          const data = await reviewApi.listByUser(userId, { sort: "recent", limit: 20, type: "posts" });
          setPosts(data.reviews || []);
        }
        if (activeTab === "followers") {
          const data = await followApi.listFollowers(userId);
          setFollowers(data.users || []);
        }
        if (activeTab === "following") {
          const data = await followApi.listFollowing(userId);
          setFollowing(data.users || []);
        }
      } catch (err) {
        setError(err.message || "Unable to load profile data.");
      } finally {
        setLoading(false);
      }
    }

    if (userId) loadTab();
  }, [userId, activeTab]);

  async function handleFollow() {
    const token = window.localStorage.getItem(authStorage.tokenKey);
    if (!token) {
      window.location.assign("/login");
      return;
    }

    try {
      const data = await followApi.toggle(userId);
      setStats((prev) => ({
        ...prev,
        isFollowing: Boolean(data.following),
        followersCount: prev.followersCount + (data.following ? 1 : -1)
      }));
    } catch (err) {
      setError(err.message || "Unable to update follow status.");
    }
  }

  if (loading && !profile) {
    return (
      <div className="profile-page fade-in">
        <p className="profile-info">Loading profile...</p>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="profile-page fade-in">
        <button type="button" className="post-back" onClick={() => window.history.back()}>
          Back
        </button>
        <p className="profile-error">{error}</p>
      </div>
    );
  }

  const name = profile?.name || "Reader";
  const canFollow = currentUser && String(currentUser.id) !== String(userId);

  return (
    <div className="profile-page fade-in">
      <div className="profile-header">
        <div className="profile-card">
          <div className="profile-avatar">{initialsFromName(name)}</div>
          <div>
            <p className="profile-name">{name}</p>
            <p className="profile-email">{profile?.email || ""}</p>
          </div>
          <div className="profile-actions">
            <button type="button" className="profile-back" onClick={() => window.history.back()}>
              Back
            </button>
            {canFollow && (
              <>
                <button type="button" className="profile-follow" onClick={handleFollow}>
                  {stats.isFollowing ? "Following" : "Follow"}
                </button>
                <button
                  type="button"
                  className="profile-message"
                  onClick={() => window.location.assign(`/chat/${userId}`)}
                >
                  Message
                </button>
              </>
            )}
          </div>
        </div>

        <div className="profile-stats">
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
          Posts
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
        {loading && <p className="profile-info">Loading...</p>}
        {error && <p className="profile-error">{error}</p>}

        {!loading && !error && activeTab === "posts" && posts.length === 0 && (
          <p className="profile-empty">No posts yet.</p>
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

        {!loading && !error && (activeTab === "followers" || activeTab === "following") && (
          <div className="profile-list">
            {(activeTab === "followers" ? followers : following).map((person) => (
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
