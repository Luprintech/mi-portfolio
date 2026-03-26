import { useState, useEffect } from 'react';

export default function PollBlock({ question = '', options = [], style = 'cards', pollId = null }) {
  const [selectedOption, setSelectedOption] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [results, setResults] = useState({});

  // Generate a stable poll ID based on question if not provided
  const stablePollId = pollId || `poll_${btoa(question).replace(/[^a-zA-Z0-9]/g, '').slice(0, 20)}`;
  const storageKey = `poll_${stablePollId}`;

  useEffect(() => {
    // Check if user has already voted
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const data = JSON.parse(stored);
        setSelectedOption(data.selectedOption);
        setHasVoted(true);
        setResults(data.results || {});
      }
    } catch (err) {
      console.error('Error loading poll data:', err);
    }
  }, [storageKey]);

  if (!question || !options || options.length === 0) {
    return null;
  }

  const handleVote = () => {
    if (selectedOption === null) return;

    // Generate mock results
    const mockResults = {};
    let total = 0;

    options.forEach((opt) => {
      if (opt.id === selectedOption) {
        // Voted option gets base + random boost
        const votes = Math.floor(Math.random() * 50) + 30;
        mockResults[opt.id] = votes;
        total += votes;
      } else {
        // Other options get random votes
        const votes = Math.floor(Math.random() * 40) + 10;
        mockResults[opt.id] = votes;
        total += votes;
      }
    });

    // Calculate percentages
    const percentages = {};
    Object.keys(mockResults).forEach((optId) => {
      percentages[optId] = Math.round((mockResults[optId] / total) * 100);
    });

    setResults(percentages);
    setHasVoted(true);

    // Save to localStorage
    try {
      localStorage.setItem(
        storageKey,
        JSON.stringify({
          selectedOption,
          results: percentages,
          timestamp: Date.now(),
        })
      );
    } catch (err) {
      console.error('Error saving poll vote:', err);
    }
  };

  const handleChangeVote = () => {
    setHasVoted(false);
    setSelectedOption(null);
    setResults({});
    try {
      localStorage.removeItem(storageKey);
    } catch (err) {
      console.error('Error clearing poll vote:', err);
    }
  };

  const getPercentage = (optionId) => {
    return results[optionId] || 0;
  };

  const gridClasses = 
    style === 'grid' ? 'grid grid-cols-2 gap-3' : 
    style === 'list' ? 'flex flex-col gap-3' : 
    'grid grid-cols-1 sm:grid-cols-2 gap-3';

  return (
    <div className="my-10" data-poll="">
      <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-elevated)]/50 p-6 shadow-lg">
        {/* Question */}
        <div className="mb-6 flex items-start gap-3">
          <span className="text-3xl">📊</span>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-[var(--text-primary)]">
              {question}
            </h3>
          </div>
        </div>

        {/* Options */}
        {!hasVoted ? (
          <div className={gridClasses}>
            {options.map((option, idx) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setSelectedOption(option.id)}
                className={`
                  relative overflow-hidden rounded-xl border-2 p-4 transition-all duration-200
                  ${style === 'cards' ? 'shadow-sm hover:shadow-md' : ''}
                  ${
                    option.id === selectedOption
                      ? 'border-fuchsia-500 bg-fuchsia-500/10 ring-2 ring-fuchsia-500/30'
                      : 'border-[var(--border-color)] bg-[var(--bg-surface)]/50 hover:border-fuchsia-500/50 hover:bg-fuchsia-500/5'
                  }
                `}
              >
                <div className="relative z-10 flex items-center gap-3">
                  <span
                    className={`
                      flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-semibold transition-all
                      ${
                        option.id === selectedOption
                          ? 'bg-fuchsia-500 text-white'
                          : 'bg-[var(--bg-elevated)] text-[var(--text-muted)]'
                      }
                    `}
                  >
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <p className="flex-1 text-left text-sm font-medium text-[var(--text-primary)]">
                    {option.text}
                  </p>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {options.map((option, idx) => {
              const percentage = getPercentage(option.id);
              const isUserVote = option.id === selectedOption;

              return (
                <div
                  key={option.id}
                  className={`
                    relative overflow-hidden rounded-xl border-2 p-4 transition-all
                    ${
                      isUserVote
                        ? 'border-fuchsia-500 bg-fuchsia-500/5'
                        : 'border-[var(--border-color)] bg-[var(--bg-surface)]/30'
                    }
                  `}
                >
                  {/* Progress bar background */}
                  <div
                    className="absolute left-0 top-0 h-full bg-gradient-to-r from-fuchsia-500/20 to-cyan-500/20 transition-all duration-1000"
                    style={{ width: `${percentage}%` }}
                  />

                  {/* Content */}
                  <div className="relative z-10 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span
                        className={`
                          flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-semibold
                          ${
                            isUserVote
                              ? 'bg-fuchsia-500 text-white'
                              : 'bg-[var(--bg-elevated)] text-[var(--text-muted)]'
                          }
                        `}
                      >
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <p className="text-sm font-medium text-[var(--text-primary)]">
                        {option.text}
                        {isUserVote && (
                          <span className="ml-2 text-xs text-fuchsia-400">(Tu voto)</span>
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-fuchsia-400">
                        {percentage}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Action buttons */}
        <div className="mt-6 flex justify-center gap-3">
          {!hasVoted ? (
            <button
              type="button"
              onClick={handleVote}
              disabled={selectedOption === null}
              className="rounded-xl bg-gradient-to-r from-fuchsia-600 to-cyan-600 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 disabled:grayscale"
            >
              Votar
            </button>
          ) : (
            <button
              type="button"
              onClick={handleChangeVote}
              className="rounded-xl border-2 border-fuchsia-500/50 bg-fuchsia-500/10 px-6 py-3 font-semibold text-fuchsia-400 transition-all hover:bg-fuchsia-500/20"
            >
              Cambiar voto
            </button>
          )}
        </div>

        {/* Results summary */}
        {hasVoted && (
          <p className="mt-4 text-center text-xs text-[var(--text-muted)]">
            Resultados de la encuesta • Los datos son simulados localmente
          </p>
        )}
      </div>
    </div>
  );
}
