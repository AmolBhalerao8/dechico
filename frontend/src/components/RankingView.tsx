import { useEffect, useState } from 'react';
import { apiFetch, withAuthHeaders } from '../services/apiClient';
import { useAuth } from '../hooks/useAuth';

type RankPollOption = {
  id: string;
  label: string;
  votes: number;
  percentage: number;
};

type RankPoll = {
  id: string;
  question: string;
  options: RankPollOption[];
};

type RankPollResponse = {
  polls: RankPoll[];
};

export const RankingView = () => {
  const [polls, setPolls] = useState<RankPoll[]>([]);
  const [loading, setLoading] = useState(true);
  const [votingKey, setVotingKey] = useState<string | null>(null);
  const { user } = useAuth();

  const loadPolls = async () => {
    setLoading(true);
    try {
      const data = await apiFetch<RankPollResponse>('/api/rank/polls');
      setPolls(data.polls ?? []);
    } catch (error) {
      console.error('Failed to load polls:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPolls();
  }, []);

  const handleVote = async (pollId: string, optionId: string) => {
    if (!user || !user.email) {
      alert('Log in to vote on polls.');
      return;
    }

    const key = `${pollId}:${optionId}`;
    setVotingKey(key);
    try {
      await apiFetch('/api/rank/vote', {
        method: 'POST',
        headers: withAuthHeaders(user.uid, user.email),
        body: JSON.stringify({ pollId, optionId }),
      });
      await loadPolls();
    } catch (error) {
      console.error('Failed to vote:', error);
    } finally {
      setVotingKey(null);
    }
  };

  if (loading && polls.length === 0) {
    return (
      <div className="p-6 text-center text-dchico-muted text-sm">
        Loading chaos…
      </div>
    );
  }

  if (!polls.length) {
    return (
      <div className="p-6 text-center text-dchico-muted text-sm">
        No polls yet. Come back later.
      </div>
    );
  }

  return (
    <section className="p-6 lg:p-10 space-y-6 max-w-4xl mx-auto">
      {polls.map((poll) => (
        <article
          key={poll.id}
          className="rounded-3xl bg-white/90 border border-dchico-border shadow-md shadow-dchico-border/20 p-6 lg:p-8"
        >
          <h2 className="text-lg lg:text-xl font-semibold mb-4">
            {poll.question}
          </h2>
          <div className="space-y-3">
            {poll.options.map((option) => {
              const barWidth = `${option.percentage}%`;
              const isVoting = votingKey === `${poll.id}:${option.id}`;

              return (
                <button
                  key={option.id}
                  type="button"
                  disabled={isVoting}
                  onClick={() => handleVote(poll.id, option.id)}
                  className="w-full text-left"
                >
                  <div className="flex justify-between text-[13px] mb-1">
                    <span className="font-medium">{option.label}</span>
                    <span className="text-dchico-muted">
                      {option.percentage}%
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-dchico-panel/60 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-dchico-accent transition-all"
                      style={{ width: barWidth }}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </article>
      ))}
    </section>
  );
};

