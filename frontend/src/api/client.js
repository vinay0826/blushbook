const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";
const AUTH_TOKEN_KEY = "between_the_lines_token";

async function apiRequest(path, options = {}) {
  const token = window.localStorage.getItem(AUTH_TOKEN_KEY);
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    ...options
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.message || "Request failed");
  }

  return response.json();
}

export const authStorage = {
  tokenKey: AUTH_TOKEN_KEY,
  saveAuth: (token, user) => {
    window.localStorage.setItem(AUTH_TOKEN_KEY, token);
    window.localStorage.setItem("between_the_lines_user", JSON.stringify(user));
  },
  clear: () => {
    window.localStorage.removeItem(AUTH_TOKEN_KEY);
    window.localStorage.removeItem("between_the_lines_user");
  }
};

export const authApi = {
  register: (payload) =>
    apiRequest("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  login: (payload) =>
    apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  me: () => apiRequest("/auth/me")
};

export const reviewApi = {
  list: (params = {}) => {
    const query = new URLSearchParams(
      Object.entries(params).reduce((acc, [key, value]) => {
        if (value === undefined || value === null || value === "") return acc;
        acc[key] = String(value);
        return acc;
      }, {})
    );
    return apiRequest(`/reviews${query.toString() ? `?${query.toString()}` : ""}`);
  },
  listByUser: (userId, params = {}) => {
    const query = new URLSearchParams(
      Object.entries(params).reduce((acc, [key, value]) => {
        if (value === undefined || value === null || value === "") return acc;
        acc[key] = String(value);
        return acc;
      }, {})
    );
    return apiRequest(
      `/reviews/user/${userId}${query.toString() ? `?${query.toString()}` : ""}`
    );
  },
  listMine: (params = {}) => {
    const query = new URLSearchParams(
      Object.entries(params).reduce((acc, [key, value]) => {
        if (value === undefined || value === null || value === "") return acc;
        acc[key] = String(value);
        return acc;
      }, {})
    );
    return apiRequest(`/reviews/mine${query.toString() ? `?${query.toString()}` : ""}`);
  },
  create: (payload) =>
    apiRequest("/reviews", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  getById: (reviewId) => apiRequest(`/reviews/${reviewId}`),
  like: (reviewId) =>
    apiRequest(`/reviews/${reviewId}/like`, {
      method: "PATCH"
    }),
  repost: (reviewId) =>
    apiRequest(`/reviews/${reviewId}/repost`, {
      method: "POST"
    }),
  remove: (reviewId) =>
    apiRequest(`/reviews/${reviewId}`, {
      method: "DELETE"
    })
};

export const commentApi = {
  list: (reviewId) => apiRequest(`/reviews/${reviewId}/comments`),
  create: (reviewId, payload) =>
    apiRequest(`/reviews/${reviewId}/comments`, {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  listMine: () => apiRequest("/comments/mine")
};

export const followApi = {
  get: (userId) => apiRequest(`/follows/${userId}`),
  listFollowers: (userId) => apiRequest(`/follows/${userId}/followers`),
  listFollowing: (userId) => apiRequest(`/follows/${userId}/following`),
  toggle: (userId) =>
    apiRequest(`/follows/${userId}`, {
      method: "POST"
    })
};

export const userApi = {
  get: (userId) => apiRequest(`/users/${userId}`),
  search: (term) => {
    const query = new URLSearchParams({ search: term });
    return apiRequest(`/users?${query.toString()}`);
  }
};

export const shelfApi = {
  getAll: () => apiRequest("/shelf"),
  create: (payload) =>
    apiRequest("/shelf", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  remove: (id) =>
    apiRequest(`/shelf/${id}`, {
      method: "DELETE"
    })
};

export const chatApi = {
  list: () => apiRequest("/chats"),
  listWith: (userId, params = {}) => {
    const query = new URLSearchParams(
      Object.entries(params).reduce((acc, [key, value]) => {
        if (value === undefined || value === null || value === "") return acc;
        acc[key] = String(value);
        return acc;
      }, {})
    );
    return apiRequest(
      `/chats/with/${userId}${query.toString() ? `?${query.toString()}` : ""}`
    );
  },
  send: (userId, payload) =>
    apiRequest(`/chats/with/${userId}`, {
      method: "POST",
      body: JSON.stringify(payload)
    })
};
