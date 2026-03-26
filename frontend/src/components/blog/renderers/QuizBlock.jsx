import { useState } from 'react';

export default function QuizBlock({ question = '', options = [], explanation = '', style = 'cards' }) {
  const [selectedOption, setSelectedOption] = useState(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  if (!question || !options || options.length === 0) {
    return null;
  }

  const handleAnswer = () => {
    if (selectedOption === null) return;
    setHasAnswered(true);
    if (explanation) {
      setShowExplanation(true);
    }
  };

  const handleRetry = () => {
    setSelectedOption(null);
    setHasAnswered(false);
    setShowExplanation(false);
  };

  const getOptionState = (option) => {
    if (!hasAnswered) return 'default';
    if (option.isCorrect) return 'correct';
    if (option.id === selectedOption) return 'incorrect';
    return 'default';
  };

  const getOptionClasses = (option) => {
    const state = getOptionState(option);
    const baseClasses = `
      relative cursor-pointer overflow-hidden rounded-xl border-2 p-4 transition-all duration-300
      ${style === 'cards' ? 'shadow-sm hover:shadow-md' : ''}
    `;

    if (hasAnswered) {
      if (state === 'correct') {
        return `${baseClasses} border-green-500 bg-green-500/10 ring-2 ring-green-500/20`;
      }
      if (state === 'incorrect') {
        return `${baseClasses} border-red-500 bg-red-500/10 ring-2 ring-red-500/20`;
      }
      return `${baseClasses} border-[var(--border-color)] bg-[var(--bg-surface)]/30 opacity-50`;
    }

    if (option.id === selectedOption) {
      return `${baseClasses} border-fuchsia-500 bg-fuchsia-500/5 ring-2 ring-fuchsia-500/30`;
    }

    return `${baseClasses} border-[var(--border-color)] bg-[var(--bg-surface)]/50 hover:border-fuchsia-500/50 hover:bg-fuchsia-500/5`;
  };

  const gridClasses = 
    style === 'grid' ? 'grid grid-cols-2 gap-3' : 
    style === 'list' ? 'flex flex-col gap-3' : 
    'grid grid-cols-1 sm:grid-cols-2 gap-3';

  return (
    <div className="my-10" data-quiz="">
      <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-elevated)]/50 p-6 shadow-lg">
        {/* Question */}
        <div className="mb-6 flex items-start gap-3">
          <span className="text-3xl">❓</span>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-[var(--text-primary)]">
              {question}
            </h3>
          </div>
        </div>

        {/* Options */}
        <div className={gridClasses}>
          {options.map((option, idx) => {
            const state = getOptionState(option);
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => !hasAnswered && setSelectedOption(option.id)}
                disabled={hasAnswered}
                className={getOptionClasses(option, idx)}
              >
                <div className="relative z-10 flex items-center gap-3">
                  <span className={`
                    flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-semibold transition-all
                    ${state === 'correct' ? 'bg-green-500 text-white' :
                      state === 'incorrect' ? 'bg-red-500 text-white' :
                      option.id === selectedOption ? 'bg-fuchsia-500 text-white' :
                      'bg-[var(--bg-elevated)] text-[var(--text-muted)]'
                    }
                  `}>
                    {state === 'correct' ? '✓' : 
                     state === 'incorrect' ? '×' :
                     String.fromCharCode(65 + idx)}
                  </span>
                  <p className="flex-1 text-left text-sm font-medium text-[var(--text-primary)]">
                    {option.text}
                  </p>
                </div>

                {/* Success confetti effect */}
                {hasAnswered && state === 'correct' && (
                  <div className="pointer-events-none absolute inset-0 overflow-hidden">
                    <div className="animate-confetti absolute left-1/4 top-0 h-2 w-2 rounded-full bg-yellow-400 opacity-0" style={{ animationDelay: '0ms' }} />
                    <div className="animate-confetti absolute left-1/2 top-0 h-2 w-2 rounded-full bg-green-400 opacity-0" style={{ animationDelay: '100ms' }} />
                    <div className="animate-confetti absolute left-3/4 top-0 h-2 w-2 rounded-full bg-blue-400 opacity-0" style={{ animationDelay: '200ms' }} />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Action buttons */}
        <div className="mt-6 flex justify-center gap-3">
          {!hasAnswered ? (
            <button
              type="button"
              onClick={handleAnswer}
              disabled={selectedOption === null}
              className="rounded-xl bg-gradient-to-r from-fuchsia-600 to-cyan-600 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 disabled:grayscale"
            >
              Responder
            </button>
          ) : (
            <button
              type="button"
              onClick={handleRetry}
              className="rounded-xl border-2 border-fuchsia-500/50 bg-fuchsia-500/10 px-6 py-3 font-semibold text-fuchsia-400 transition-all hover:bg-fuchsia-500/20"
            >
              Reintentar
            </button>
          )}
        </div>

        {/* Explanation */}
        {hasAnswered && showExplanation && explanation && (
          <div className="mt-6 animate-fade-in rounded-xl border border-blue-500/30 bg-blue-500/5 p-4">
            <div className="flex items-start gap-2">
              <span className="text-xl">💡</span>
              <div className="flex-1">
                <h4 className="mb-1 font-semibold text-blue-400">Explicación</h4>
                <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
                  {explanation}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes confetti {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(200px) rotate(720deg);
            opacity: 0;
          }
        }
        
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-confetti {
          animation: confetti 1.5s ease-out forwards;
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
