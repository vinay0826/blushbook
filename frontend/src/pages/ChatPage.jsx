import { useEffect, useMemo, useRef, useState } from "react";
import { authStorage, chatApi, userApi } from "../api/client";

function currentUserFromStorage() {
  try {
    const raw = window.localStorage.getItem("between_the_lines_user");
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function initialsFromName(name) {
  return String(name || "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");
}

function formatTime(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function ChatPage() {
  const user = currentUserFromStorage();
  const path = typeof window !== "undefined" ? window.location.pathname : "";
  const initialUserId = path.includes("/chat/") ? path.split("/chat/")[1] : "";

  const [conversations, setConversations] = useState([]);
  const [activeUserId, setActiveUserId] = useState(initialUserId);
  const [activeUser, setActiveUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingConvos, setLoadingConvos] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState("");
  const [draft, setDraft] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchingUsers, setSearchingUsers] = useState(false);

  const endRef = useRef(null);

  useEffect(() => {
    const token = window.localStorage.getItem(authStorage.tokenKey);
    if (!token) {
      window.location.assign("/login");
    }
  }, []);

  useEffect(() => {
    async function loadConversations() {
      setLoadingConvos(true);
      setError("");
      try {
        const data = await chatApi.list();
        setConversations(data.conversations || []);
      } catch (err) {
        setError(err.message || "Unable to load chats.");
      } finally {
        setLoadingConvos(false);
      }
    }

    loadConversations();
  }, []);

  useEffect(() => {
    if (!activeUserId && conversations.length > 0) {
      setActiveUserId(conversations[0].otherUserId);
    }
  }, [conversations, activeUserId]);

  useEffect(() => {
    async function loadMessages() {
      if (!activeUserId) return;
      setLoadingMessages(true);
      setError("");
      try {
        const data = await chatApi.listWith(activeUserId, { limit: 50 });
        setMessages(data.messages || []);
      } catch (err) {
        setError(err.message || "Unable to load messages.");
      } finally {
        setLoadingMessages(false);
      }
    }

    loadMessages();
  }, [activeUserId]);

  useEffect(() => {
    const convo = conversations.find((item) => item.otherUserId === activeUserId);
    if (convo?.user) {
      setActiveUser(convo.user);
      return;
    }

    async function loadUser() {
      if (!activeUserId) return;
      try {
        const data = await userApi.get(activeUserId);
        setActiveUser(data.user);
      } catch {
        setActiveUser(null);
      }
    }

    loadUser();
  }, [activeUserId, conversations]);

  useEffect(() => {
    if (!endRef.current) return;
    endRef.current.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const term = searchInput.trim();
    if (term.length < 2) {
      setSearchResults([]);
      return;
    }

    const timer = window.setTimeout(async () => {
      setSearchingUsers(true);
      try {
        const data = await userApi.search(term);
        setSearchResults(data.users || []);
      } catch (err) {
        setError(err.message || "Unable to search readers.");
      } finally {
        setSearchingUsers(false);
      }
    }, 300);

    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const filteredConversations = useMemo(() => {
    return conversations;
  }, [conversations]);

  function selectConversation(userId) {
    setActiveUserId(userId);
  }

  function openChatWith(userInfo) {
    setActiveUserId(userInfo.id);
    setActiveUser(userInfo);
    setMessages([]);
    setConversations((prev) => {
      if (prev.some((item) => item.otherUserId === userInfo.id)) return prev;
      return [
        {
          threadId: `new-${userInfo.id}`,
          otherUserId: userInfo.id,
          lastMessage: "",
          lastAt: null,
          user: userInfo
        },
        ...prev
      ];
    });
  }

  async function sendMessage(event) {
    event.preventDefault();
    if (!activeUserId) return;
    const clean = draft.trim();
    if (!clean) return;

    try {
      const data = await chatApi.send(activeUserId, { content: clean });
      setMessages((prev) => [...prev, data.message]);
      setDraft("");
      const convoData = await chatApi.list();
      setConversations(convoData.conversations || []);
    } catch (err) {
      setError(err.message || "Unable to send message.");
    }
  }

  return (
    <div className="chat-page fade-in">
      <header className="chat-header">
        <div>
          <p className="chat-title">Chats</p>
          <p className="chat-subtitle">Quiet notes between readers</p>
        </div>
        <button type="button" className="chat-back" onClick={() => window.location.assign("/feed")}>
          Back to feed
        </button>
      </header>

      <div className="chat-layout">
        <aside className="chat-list">
          <div className="chat-search">
            <input
              type="text"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search readers to message"
            />
          </div>

          {loadingConvos && <p className="chat-info">Loading chats...</p>}
          {searchInput.trim().length >= 2 && (
            <div className="chat-search-results">
              <p className="chat-search-title">Search results</p>
              {searchingUsers && <p className="chat-info">Searching readers...</p>}
              {!searchingUsers && searchResults.length === 0 && (
                <p className="chat-info">No readers found.</p>
              )}
              {!searchingUsers && searchResults.length > 0 && (
                <div className="chat-results-list">
                  {searchResults.map((result) => (
                    <button
                      type="button"
                      key={result.id}
                      className="chat-result"
                      onClick={() => openChatWith(result)}
                    >
                      <span className="chat-avatar">
                        {initialsFromName(result.name || "R")}
                      </span>
                      <span className="chat-item-body">
                        <span className="chat-item-name">{result.name}</span>
                        <span className="chat-item-preview">{result.email}</span>
                      </span>
                      <span className="chat-start">Message</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {!loadingConvos && filteredConversations.length === 0 && searchInput.trim().length < 2 && (
            <p className="chat-info">No chats yet. Search a reader above to start.</p>
          )}

          <div className="chat-items">
            {filteredConversations.map((item) => {
              const active = item.otherUserId === activeUserId;
              return (
                <button
                  type="button"
                  key={item.threadId}
                  className={active ? "chat-item active" : "chat-item"}
                  onClick={() => selectConversation(item.otherUserId)}
                >
                  <span className="chat-avatar">{initialsFromName(item.user?.name || "R")}</span>
                  <span className="chat-item-body">
                    <span className="chat-item-name">{item.user?.name || "Reader"}</span>
                    <span className="chat-item-preview">{item.lastMessage}</span>
                  </span>
                  <span className="chat-item-time">{formatTime(item.lastAt)}</span>
                </button>
              );
            })}
          </div>
        </aside>

        <section className="chat-thread">
          {error && <p className="chat-error">{error}</p>}

          {!activeUserId && (
            <div className="chat-empty">
              <p>Select a reader to start chatting.</p>
            </div>
          )}

          {activeUserId && (
            <>
              <div className="chat-thread-header">
                <div className="chat-thread-user">
                  <span className="chat-avatar large">
                    {initialsFromName(activeUser?.name || "Reader")}
                  </span>
                  <div>
                    <p className="chat-thread-name">{activeUser?.name || "Reader"}</p>
                    <p className="chat-thread-email">{activeUser?.email || ""}</p>
                  </div>
                </div>
                <button
                  type="button"
                  className="chat-thread-view"
                  onClick={() => window.location.assign(`/user/${activeUserId}`)}
                >
                  View profile
                </button>
              </div>

              <div className="chat-messages">
                {loadingMessages && <p className="chat-info">Loading messages...</p>}
                {!loadingMessages && messages.length === 0 && (
                  <p className="chat-info">No messages yet. Say hello.</p>
                )}
                {messages.map((message) => {
                  const isMine = String(message.senderId) === String(user?.id);
                  return (
                    <div key={message._id} className={isMine ? "chat-bubble mine" : "chat-bubble"}>
                      <p>{message.content}</p>
                      <span>{formatTime(message.createdAt)}</span>
                    </div>
                  );
                })}
                <div ref={endRef} />
              </div>

              <form className="chat-input" onSubmit={sendMessage}>
                <textarea
                  rows={2}
                  placeholder="Write a cozy note..."
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                />
                <button type="submit">Send</button>
              </form>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
