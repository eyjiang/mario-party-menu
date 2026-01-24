"use client";

import { useState, useEffect, useRef } from "react";
import useSWR from "swr";
import { Bet, BetComment } from "@/lib/types";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface BetCardProps {
  bet: Bet;
  userId: string;
  isStaff: boolean;
  staffKey: string;
  onUpdate: () => void;
}

// Confetti/money animation component
const MoneyExplosion = () => {
  const emojis = ["💵", "💰", "🤑", "💸", "🎉", "✨"];
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="absolute text-2xl animate-bounce"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 0.5}s`,
            animationDuration: `${0.5 + Math.random() * 0.5}s`,
          }}
        >
          {emojis[Math.floor(Math.random() * emojis.length)]}
        </div>
      ))}
    </div>
  );
};

const BetCard = ({ bet, userId, isStaff, staffKey, onUpdate }: BetCardProps) => {
  const [expanded, setExpanded] = useState(false);
  const [venmoInput, setVenmoInput] = useState("");
  const [comment, setComment] = useState("");
  const [showTakeForm, setShowTakeForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [comments, setComments] = useState<BetComment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [takeError, setTakeError] = useState("");

  const isCreator = bet.creatorId === userId;
  const isTaker = bet.takerId === userId;
  const canTake = bet.status === "open" && !isCreator;
  const canVote = bet.status === "locked" && !isCreator && !isTaker;
  const justResolved = useRef(bet.status === "resolved");

  useEffect(() => {
    if (bet.status === "resolved" && !justResolved.current) {
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 3000);
    }
    justResolved.current = bet.status === "resolved";
  }, [bet.status]);

  const loadComments = async () => {
    if (loadingComments) return;
    setLoadingComments(true);
    try {
      const res = await fetch(`/api/bets/${bet.id}/comment`);
      const data = await res.json();
      setComments(data.comments || []);
    } catch {
      console.error("Failed to load comments");
    } finally {
      setLoadingComments(false);
    }
  };

  useEffect(() => {
    if (expanded) {
      loadComments();
    }
  }, [expanded]);

  const takeBet = async () => {
    setLoading(true);
    setTakeError("");
    try {
      const res = await fetch(`/api/bets/${bet.id}/take`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ venmo: venmoInput }),
      });
      const data = await res.json();
      if (res.ok) {
        setShowTakeForm(false);
        onUpdate();
      } else {
        setTakeError(data.error || "Failed to take bet");
      }
    } catch {
      setTakeError("Failed to take bet");
    } finally {
      setLoading(false);
    }
  };

  const vote = async (voteFor: "creator" | "taker") => {
    setLoading(true);
    try {
      await fetch(`/api/bets/${bet.id}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ voteFor }),
      });
      onUpdate();
    } catch {
      console.error("Failed to vote");
    } finally {
      setLoading(false);
    }
  };

  const addComment = async () => {
    if (!comment.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/bets/${bet.id}/comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: comment }),
      });
      if (res.ok) {
        setComment("");
        loadComments();
      }
    } catch {
      console.error("Failed to add comment");
    } finally {
      setLoading(false);
    }
  };

  const resolveBet = async (winnerId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/bets/${bet.id}/resolve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ staffKey, winnerId }),
      });
      if (res.ok) {
        onUpdate();
      }
    } catch {
      console.error("Failed to resolve bet");
    } finally {
      setLoading(false);
    }
  };

  const statusColors = {
    open: "from-green-500/20 to-emerald-600/20 border-green-500",
    locked: "from-yellow-500/20 to-orange-600/20 border-yellow-500",
    resolved: "from-purple-500/20 to-pink-600/20 border-purple-500",
  };

  const statusGlow = {
    open: "shadow-green-500/30",
    locked: "shadow-yellow-500/30",
    resolved: "shadow-purple-500/30",
  };

  return (
    <div
      className={`
        relative rounded-xl p-4 border-2 transition-all
        bg-gradient-to-br ${statusColors[bet.status]}
        ${bet.status === "open" ? `animate-pulse ${statusGlow.open} shadow-lg` : ""}
        ${bet.status === "locked" ? `${statusGlow.locked} shadow-lg` : ""}
        ${bet.status === "resolved" ? statusGlow.resolved : ""}
      `}
    >
      {showCelebration && <MoneyExplosion />}

      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs px-2 py-0.5 rounded-full font-bold uppercase" style={{
              backgroundColor: bet.status === "open" ? "#22c55e" : bet.status === "locked" ? "#eab308" : "#a855f7",
              color: "#000",
            }}>
              {bet.status === "open" ? "🎯 Open" : bet.status === "locked" ? "🔒 Locked" : "✅ Resolved"}
            </span>
            <span className="text-lg font-bold text-white">
              {bet.amount} {bet.amountType === "dollars" ? "💵" : "🥃"}
            </span>
          </div>
          <p className="text-white font-medium">{bet.description}</p>
        </div>
      </div>

      {/* Participants */}
      <div className="flex items-center gap-4 text-sm mb-3">
        <div className="flex-1">
          <span className="text-gray-400">Proposer: </span>
          <span className="text-green-400 font-bold">{bet.creatorName}</span>
          {bet.creatorVenmo && (
            <span className="text-blue-400 text-xs ml-1">@{bet.creatorVenmo}</span>
          )}
        </div>
        {bet.takerId && (
          <div className="flex-1">
            <span className="text-gray-400">Challenger: </span>
            <span className="text-orange-400 font-bold">{bet.takerName}</span>
            {bet.takerVenmo && (
              <span className="text-blue-400 text-xs ml-1">@{bet.takerVenmo}</span>
            )}
          </div>
        )}
      </div>

      {/* Winner display */}
      {bet.status === "resolved" && bet.winnerName && (
        <div className="bg-gradient-to-r from-yellow-500/30 to-amber-500/30 rounded-lg p-3 mb-3 text-center">
          <span className="text-yellow-400 font-bold text-lg">
            🏆 WINNER: {bet.winnerName} 🏆
          </span>
        </div>
      )}

      {/* Take bet form */}
      {canTake && !showTakeForm && (
        <button
          onClick={() => setShowTakeForm(true)}
          className="w-full bg-green-600 hover:bg-green-500 py-2 rounded-lg font-bold transition-colors mb-3"
        >
          🎲 TAKE THIS BET
        </button>
      )}

      {showTakeForm && (
        <div className="bg-black/30 rounded-lg p-3 mb-3">
          {takeError && (
            <div className="mb-2 text-red-400 text-xs bg-red-900/30 border border-red-500/50 rounded px-2 py-1">
              {takeError}
            </div>
          )}
          <input
            type="text"
            value={venmoInput}
            onChange={(e) => setVenmoInput(e.target.value)}
            placeholder="Your Venmo (optional)"
            className="w-full bg-black/50 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 mb-2"
          />
          <div className="flex gap-2">
            <button
              onClick={takeBet}
              disabled={loading}
              className="flex-1 bg-green-600 hover:bg-green-500 py-2 rounded-lg font-bold transition-colors disabled:opacity-50"
            >
              {loading ? "..." : "Confirm"}
            </button>
            <button
              onClick={() => { setShowTakeForm(false); setTakeError(""); }}
              className="px-4 bg-gray-600 hover:bg-gray-500 py-2 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Voting section */}
      {bet.status === "locked" && (
        <div className="bg-black/30 rounded-lg p-3 mb-3">
          <p className="text-xs text-gray-400 mb-2 text-center">Who do you think will win?</p>
          <div className="flex gap-2">
            <button
              onClick={() => vote("creator")}
              disabled={loading || isCreator || isTaker}
              className="flex-1 bg-green-600/50 hover:bg-green-600 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {bet.creatorName} ({bet.votesForCreator})
            </button>
            <button
              onClick={() => vote("taker")}
              disabled={loading || isCreator || isTaker}
              className="flex-1 bg-orange-600/50 hover:bg-orange-600 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {bet.takerName} ({bet.votesForTaker})
            </button>
          </div>
        </div>
      )}

      {/* Staff resolve section */}
      {isStaff && bet.status === "locked" && (
        <div className="bg-red-900/30 rounded-lg p-3 mb-3 border border-red-500/50">
          <p className="text-xs text-red-400 mb-2 font-bold">STAFF: Resolve this bet</p>
          <div className="flex gap-2">
            <button
              onClick={() => resolveBet(bet.creatorId)}
              disabled={loading}
              className="flex-1 bg-green-600 hover:bg-green-500 py-2 rounded-lg font-bold transition-colors disabled:opacity-50"
            >
              {bet.creatorName} Wins
            </button>
            <button
              onClick={() => resolveBet(bet.takerId!)}
              disabled={loading}
              className="flex-1 bg-orange-600 hover:bg-orange-500 py-2 rounded-lg font-bold transition-colors disabled:opacity-50"
            >
              {bet.takerName} Wins
            </button>
          </div>
        </div>
      )}

      {/* Comments toggle */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="text-xs text-gray-400 hover:text-white transition-colors"
      >
        {expanded ? "▼ Hide comments" : "▶ Show comments"}
      </button>

      {/* Comments section */}
      {expanded && (
        <div className="mt-3 border-t border-gray-700 pt-3">
          <div className="max-h-40 overflow-y-auto space-y-2 mb-3">
            {comments.length === 0 ? (
              <p className="text-gray-500 text-xs text-center">No comments yet</p>
            ) : (
              comments.map((c) => (
                <div key={c.id} className="text-xs">
                  <span className="text-cyan-400 font-bold">{c.userName}:</span>{" "}
                  <span className="text-gray-300">{c.message}</span>
                </div>
              ))
            )}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addComment()}
              placeholder="Add a comment..."
              maxLength={300}
              className="flex-1 bg-black/50 border border-gray-600 rounded-lg px-3 py-1 text-xs text-white placeholder-gray-500"
            />
            <button
              onClick={addComment}
              disabled={loading || !comment.trim()}
              className="bg-cyan-600 hover:bg-cyan-500 px-3 py-1 rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default function BettingSection({ userId }: { userId: string }) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [amountType, setAmountType] = useState<"dollars" | "shots">("dollars");
  const [venmo, setVenmo] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [staffKey, setStaffKey] = useState("");
  const [isStaff, setIsStaff] = useState(false);
  const [showStaffInput, setShowStaffInput] = useState(false);

  const { data, mutate } = useSWR<{ openBets: Bet[]; resolvedBets: Bet[] }>(
    "/api/bets",
    fetcher,
    { refreshInterval: 3000 }
  );

  const openBets = data?.openBets || [];
  const resolvedBets = data?.resolvedBets || [];

  useEffect(() => {
    const savedKey = localStorage.getItem("staffKey");
    if (savedKey) {
      setStaffKey(savedKey);
      setIsStaff(true);
    }
  }, []);

  const enableStaffMode = () => {
    if (staffKey.trim()) {
      localStorage.setItem("staffKey", staffKey.trim());
      setIsStaff(true);
      setShowStaffInput(false);
    }
  };

  const createBet = async () => {
    if (!description.trim() || !amount) {
      setError("Please fill in all fields");
      return;
    }

    const amountNum = Number(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    setCreating(true);
    setError("");

    try {
      const res = await fetch("/api/bets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: description.trim(),
          amount: amountNum,
          amountType,
          venmo: venmo.trim(),
        }),
      });

      if (res.ok) {
        setDescription("");
        setAmount("");
        setVenmo("");
        mutate();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to create bet");
      }
    } catch {
      setError("Failed to create bet");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Active Bets Section */}
      <div className="bg-gradient-to-b from-amber-900/80 to-gray-900/80 backdrop-blur-sm rounded-2xl p-6 border-2 border-amber-500/50 shadow-lg shadow-amber-500/20">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-2xl font-bold font-[family-name:var(--font-press-start)] text-amber-400 text-sm">
            🎰 BETTING ARENA
          </h2>
          <div className="flex items-center gap-2">
            {!isStaff && !showStaffInput && (
              <button
                onClick={() => setShowStaffInput(true)}
                className="text-xs text-gray-400 hover:text-yellow-400 transition-colors"
              >
                🔐 Staff
              </button>
            )}
            {isStaff && (
              <span className="text-xs text-green-400 font-bold bg-green-900/50 px-2 py-1 rounded">
                ✓ STAFF
              </span>
            )}
          </div>
        </div>

        {showStaffInput && (
          <div className="flex gap-2 mb-5">
            <input
              type="password"
              value={staffKey}
              onChange={(e) => setStaffKey(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && enableStaffMode()}
              placeholder="Staff passphrase"
              className="flex-1 bg-black/50 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500"
            />
            <button onClick={enableStaffMode} className="bg-green-600 hover:bg-green-500 px-3 py-2 rounded-lg text-sm font-bold">
              ✓
            </button>
            <button onClick={() => setShowStaffInput(false)} className="bg-gray-600 hover:bg-gray-500 px-3 py-2 rounded-lg text-sm">
              ✕
            </button>
          </div>
        )}

        {openBets.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-3">🎲</div>
            <p className="text-gray-400 text-sm">No active bets</p>
            <p className="text-gray-500 text-xs mt-1">Propose one below!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {openBets.map((bet) => (
              <BetCard
                key={bet.id}
                bet={bet}
                userId={userId}
                isStaff={isStaff}
                staffKey={staffKey}
                onUpdate={mutate}
              />
            ))}
          </div>
        )}
      </div>

      {/* Resolved Bets Section */}
      {resolvedBets.length > 0 && (
        <div className="bg-gradient-to-b from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-2xl p-6 border-2 border-gray-500/50">
          <h3 className="text-lg font-bold font-[family-name:var(--font-press-start)] text-gray-400 text-xs mb-4">
            📜 COMPLETED BETS
          </h3>
          <div className="space-y-3 opacity-75">
            {resolvedBets.map((bet) => (
              <BetCard
                key={bet.id}
                bet={bet}
                userId={userId}
                isStaff={isStaff}
                staffKey={staffKey}
                onUpdate={mutate}
              />
            ))}
          </div>
        </div>
      )}

      {/* Create Bet Form */}
      <div className="bg-gradient-to-b from-green-900/80 to-gray-900/80 backdrop-blur-sm rounded-2xl p-6 border-2 border-green-500/50 shadow-lg shadow-green-500/20">
        <h3 className="text-lg font-bold font-[family-name:var(--font-press-start)] text-green-400 text-xs mb-4">
          💡 PROPOSE A BET
        </h3>

        {error && (
          <div className="mb-4 text-red-400 text-sm bg-red-900/30 border border-red-500/50 rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        <div className="space-y-3">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What's the bet? (e.g., 'I bet Mario will win the next minigame')"
            maxLength={500}
            rows={2}
            className="w-full bg-black/50 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 resize-none"
          />

          <div className="flex gap-3">
            <div className="flex-1">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Amount"
                min="1"
                className="w-full bg-black/50 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500"
              />
            </div>
            <div className="flex bg-black/50 rounded-lg border border-gray-600 overflow-hidden">
              <button
                onClick={() => setAmountType("dollars")}
                className={`px-4 py-2 text-sm transition-colors ${amountType === "dollars" ? "bg-green-600 text-white" : "text-gray-400 hover:text-white"}`}
              >
                💵 $
              </button>
              <button
                onClick={() => setAmountType("shots")}
                className={`px-4 py-2 text-sm transition-colors ${amountType === "shots" ? "bg-orange-600 text-white" : "text-gray-400 hover:text-white"}`}
              >
                🥃 Shots
              </button>
            </div>
          </div>

          <input
            type="text"
            value={venmo}
            onChange={(e) => setVenmo(e.target.value)}
            placeholder="Your Venmo username (optional)"
            className="w-full bg-black/50 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500"
          />

          <button
            onClick={createBet}
            disabled={creating || !description.trim() || !amount}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 py-3 rounded-lg font-bold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {creating ? "Creating..." : "🎯 PROPOSE BET"}
          </button>
        </div>
      </div>
    </div>
  );
}
