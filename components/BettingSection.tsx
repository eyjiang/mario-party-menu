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

const BetCard = ({ bet, userId, isStaff, staffKey, onUpdate }: BetCardProps) => {
  const [expanded, setExpanded] = useState(false);
  const [venmoInput, setVenmoInput] = useState("");
  const [comment, setComment] = useState("");
  const [showTakeForm, setShowTakeForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [comments, setComments] = useState<BetComment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [takeError, setTakeError] = useState("");

  const isCreator = bet.creatorId === userId;
  const isTaker = bet.takerId === userId;
  const canTake = bet.status === "open" && !isCreator;

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

  const statusStyles = {
    open: "border-emerald-800/40",
    locked: "border-amber-700/40",
    resolved: "border-amber-900/20",
  };

  return (
    <div className={`bg-black/20 rounded-xl p-4 border ${statusStyles[bet.status]} transition-all`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs px-2 py-0.5 rounded-full font-[family-name:var(--font-cormorant)] font-bold uppercase"
              style={{
                backgroundColor: bet.status === "open" ? "rgba(16,185,129,0.2)" : bet.status === "locked" ? "rgba(217,170,0,0.2)" : "rgba(139,90,43,0.2)",
                color: bet.status === "open" ? "#6ee7b7" : bet.status === "locked" ? "#fcd34d" : "#d4a840",
              }}>
              {bet.status === "open" ? "Open" : bet.status === "locked" ? "Locked" : "Resolved"}
            </span>
            <span className="text-lg font-bold text-amber-100 font-[family-name:var(--font-cormorant)]">
              {bet.amount} {bet.amountType === "dollars" ? "$" : "shots"}
            </span>
          </div>
          <p className="text-amber-100/80 font-[family-name:var(--font-cormorant)]">{bet.description}</p>
        </div>
      </div>

      {/* Participants */}
      <div className="flex items-center gap-4 text-sm mb-3 font-[family-name:var(--font-cormorant)]">
        <div className="flex-1">
          <span className="text-amber-700/50">Proposer: </span>
          <span className="text-emerald-400/80 font-bold">{bet.creatorName}</span>
          {bet.creatorVenmo && (
            <span className="text-amber-500/50 text-xs ml-1">@{bet.creatorVenmo}</span>
          )}
        </div>
        {bet.takerId && (
          <div className="flex-1">
            <span className="text-amber-700/50">Challenger: </span>
            <span className="text-amber-400/80 font-bold">{bet.takerName}</span>
            {bet.takerVenmo && (
              <span className="text-amber-500/50 text-xs ml-1">@{bet.takerVenmo}</span>
            )}
          </div>
        )}
      </div>

      {/* Winner display */}
      {bet.status === "resolved" && bet.winnerName && (
        <div className="bg-amber-900/20 rounded-lg p-3 mb-3 text-center border border-amber-700/20">
          <span className="text-amber-300 font-bold text-lg font-[family-name:var(--font-cormorant)]">
            Winner: {bet.winnerName}
          </span>
        </div>
      )}

      {/* Take bet */}
      {canTake && !showTakeForm && (
        <button
          onClick={() => setShowTakeForm(true)}
          className="w-full bg-emerald-800 hover:bg-emerald-700 py-2 rounded-lg font-bold transition-colors mb-3 font-[family-name:var(--font-cormorant)] text-emerald-50"
        >
          Take This Bet
        </button>
      )}

      {showTakeForm && (
        <div className="bg-black/20 rounded-lg p-3 mb-3">
          {takeError && (
            <div className="mb-2 text-red-300 text-xs bg-red-900/20 border border-red-800/30 rounded px-2 py-1 font-[family-name:var(--font-cormorant)]">
              {takeError}
            </div>
          )}
          <input
            type="text"
            value={venmoInput}
            onChange={(e) => setVenmoInput(e.target.value)}
            placeholder="Your Venmo (optional)"
            className="w-full bg-black/30 border border-amber-900/30 rounded-lg px-3 py-2 text-sm text-amber-50 placeholder-amber-800/40 mb-2 font-[family-name:var(--font-cormorant)]"
          />
          <div className="flex gap-2">
            <button
              onClick={takeBet}
              disabled={loading}
              className="flex-1 bg-emerald-800 hover:bg-emerald-700 py-2 rounded-lg font-bold transition-colors disabled:opacity-50 font-[family-name:var(--font-cormorant)] text-emerald-50"
            >
              {loading ? "..." : "Confirm"}
            </button>
            <button
              onClick={() => { setShowTakeForm(false); setTakeError(""); }}
              className="px-4 bg-gray-800 hover:bg-gray-700 py-2 rounded-lg transition-colors font-[family-name:var(--font-cormorant)] text-gray-300"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Voting */}
      {bet.status === "locked" && (
        <div className="bg-black/20 rounded-lg p-3 mb-3">
          <p className="text-xs text-amber-700/50 mb-2 text-center font-[family-name:var(--font-cormorant)]">Who do you think will win?</p>
          <div className="flex gap-2">
            <button
              onClick={() => vote("creator")}
              disabled={loading || isCreator || isTaker}
              className="flex-1 bg-emerald-900/30 hover:bg-emerald-800/40 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-[family-name:var(--font-cormorant)] text-emerald-200"
            >
              {bet.creatorName} ({bet.votesForCreator})
            </button>
            <button
              onClick={() => vote("taker")}
              disabled={loading || isCreator || isTaker}
              className="flex-1 bg-amber-900/30 hover:bg-amber-800/40 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-[family-name:var(--font-cormorant)] text-amber-200"
            >
              {bet.takerName} ({bet.votesForTaker})
            </button>
          </div>
        </div>
      )}

      {/* Staff resolve */}
      {isStaff && bet.status === "locked" && (
        <div className="bg-red-900/10 rounded-lg p-3 mb-3 border border-red-900/20">
          <p className="text-xs text-red-300/60 mb-2 font-bold font-[family-name:var(--font-cormorant)]">Staff: Resolve this bet</p>
          <div className="flex gap-2">
            <button
              onClick={() => resolveBet(bet.creatorId)}
              disabled={loading}
              className="flex-1 bg-emerald-800 hover:bg-emerald-700 py-2 rounded-lg font-bold transition-colors disabled:opacity-50 font-[family-name:var(--font-cormorant)] text-emerald-50"
            >
              {bet.creatorName} Wins
            </button>
            <button
              onClick={() => resolveBet(bet.takerId!)}
              disabled={loading}
              className="flex-1 bg-amber-800 hover:bg-amber-700 py-2 rounded-lg font-bold transition-colors disabled:opacity-50 font-[family-name:var(--font-cormorant)] text-amber-50"
            >
              {bet.takerName} Wins
            </button>
          </div>
        </div>
      )}

      {/* Comments toggle */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="text-xs text-amber-700/40 hover:text-amber-300 transition-colors font-[family-name:var(--font-cormorant)]"
      >
        {expanded ? "Hide comments" : "Show comments"}
      </button>

      {/* Comments */}
      {expanded && (
        <div className="mt-3 border-t border-amber-900/20 pt-3">
          <div className="max-h-40 overflow-y-auto space-y-2 mb-3">
            {comments.length === 0 ? (
              <p className="text-amber-800/30 text-xs text-center font-[family-name:var(--font-cormorant)]">No comments yet</p>
            ) : (
              comments.map((c) => (
                <div key={c.id} className="text-xs font-[family-name:var(--font-cormorant)]">
                  <span className="text-amber-400/70 font-bold">{c.userName}:</span>{" "}
                  <span className="text-amber-100/70">{c.message}</span>
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
              className="flex-1 bg-black/30 border border-amber-900/30 rounded-lg px-3 py-1 text-xs text-amber-50 placeholder-amber-800/40 font-[family-name:var(--font-cormorant)]"
            />
            <button
              onClick={addComment}
              disabled={loading || !comment.trim()}
              className="bg-amber-800 hover:bg-amber-700 px-3 py-1 rounded-lg text-xs font-bold transition-colors disabled:opacity-50 font-[family-name:var(--font-cormorant)] text-amber-50"
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
      {/* Active Bets */}
      <div className="hawaiian-card rounded-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold font-[family-name:var(--font-playfair)] gold-text">
            Wagers
          </h2>
          <div className="flex items-center gap-2">
            {!isStaff && !showStaffInput && (
              <button
                onClick={() => setShowStaffInput(true)}
                className="text-xs text-amber-700/40 hover:text-amber-400 transition-colors font-[family-name:var(--font-cormorant)]"
              >
                Staff
              </button>
            )}
            {isStaff && (
              <span className="text-xs text-emerald-400 font-[family-name:var(--font-cormorant)] bg-emerald-900/30 px-2 py-1 rounded">
                Staff
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
              className="flex-1 bg-black/30 border border-amber-900/30 rounded-lg px-3 py-2 text-sm text-amber-50 placeholder-amber-800/40 font-[family-name:var(--font-cormorant)]"
            />
            <button onClick={enableStaffMode} className="bg-emerald-800 hover:bg-emerald-700 px-3 py-2 rounded-lg text-sm font-bold text-emerald-50">
              Go
            </button>
            <button onClick={() => setShowStaffInput(false)} className="bg-gray-800 hover:bg-gray-700 px-3 py-2 rounded-lg text-sm text-gray-300">
              &times;
            </button>
          </div>
        )}

        {openBets.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-amber-700/40 text-sm font-[family-name:var(--font-cormorant)] italic">No active wagers</p>
            <p className="text-amber-800/30 text-xs mt-1 font-[family-name:var(--font-cormorant)]">Propose one below</p>
          </div>
        ) : (
          <div className="space-y-4">
            {openBets.map((bet) => (
              <BetCard key={bet.id} bet={bet} userId={userId} isStaff={isStaff} staffKey={staffKey} onUpdate={mutate} />
            ))}
          </div>
        )}
      </div>

      {/* Resolved */}
      {resolvedBets.length > 0 && (
        <div className="hawaiian-card rounded-2xl p-6 opacity-75">
          <h3 className="text-lg font-bold font-[family-name:var(--font-playfair)] text-amber-600/50 mb-4">
            Completed Wagers
          </h3>
          <div className="space-y-3">
            {resolvedBets.map((bet) => (
              <BetCard key={bet.id} bet={bet} userId={userId} isStaff={isStaff} staffKey={staffKey} onUpdate={mutate} />
            ))}
          </div>
        </div>
      )}

      {/* Create Bet */}
      <div className="hawaiian-card rounded-2xl p-6">
        <h3 className="text-lg font-bold font-[family-name:var(--font-playfair)] gold-text mb-4">
          Propose a Wager
        </h3>

        {error && (
          <div className="mb-4 text-red-300 text-sm bg-red-900/20 border border-red-800/30 rounded-lg px-3 py-2 font-[family-name:var(--font-cormorant)]">
            {error}
          </div>
        )}

        <div className="space-y-3">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What's the wager?"
            maxLength={500}
            rows={2}
            className="w-full bg-black/30 border border-amber-900/30 rounded-lg px-3 py-2 text-sm text-amber-50 placeholder-amber-800/40 resize-none font-[family-name:var(--font-cormorant)]"
          />

          <div className="flex gap-3">
            <div className="flex-1">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Amount"
                min="1"
                className="w-full bg-black/30 border border-amber-900/30 rounded-lg px-3 py-2 text-sm text-amber-50 placeholder-amber-800/40 font-[family-name:var(--font-cormorant)]"
              />
            </div>
            <div className="flex bg-black/30 rounded-lg border border-amber-900/30 overflow-hidden">
              <button
                onClick={() => setAmountType("dollars")}
                className={`px-4 py-2 text-sm transition-colors font-[family-name:var(--font-cormorant)] ${amountType === "dollars" ? "bg-amber-800 text-amber-50" : "text-amber-700/50 hover:text-amber-200"}`}
              >
                $
              </button>
              <button
                onClick={() => setAmountType("shots")}
                className={`px-4 py-2 text-sm transition-colors font-[family-name:var(--font-cormorant)] ${amountType === "shots" ? "bg-amber-800 text-amber-50" : "text-amber-700/50 hover:text-amber-200"}`}
              >
                Shots
              </button>
            </div>
          </div>

          <input
            type="text"
            value={venmo}
            onChange={(e) => setVenmo(e.target.value)}
            placeholder="Your Venmo username (optional)"
            className="w-full bg-black/30 border border-amber-900/30 rounded-lg px-3 py-2 text-sm text-amber-50 placeholder-amber-800/40 font-[family-name:var(--font-cormorant)]"
          />

          <button
            onClick={createBet}
            disabled={creating || !description.trim() || !amount}
            className="w-full bg-amber-800 hover:bg-amber-700 py-3 rounded-lg font-bold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed font-[family-name:var(--font-cormorant)] text-amber-50 tracking-wider uppercase"
          >
            {creating ? "Creating..." : "Propose Wager"}
          </button>
        </div>
      </div>
    </div>
  );
}
