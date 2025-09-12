"use client";

import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { GradientButton } from "@/components/ui";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/authentication";
import { useStartGame } from "@/app/misc/api/postStartGame";
import { useCashout } from "@/app/misc/api/postCashoutWinnings";
import { useQueryClient } from "@tanstack/react-query";
// import confetti from "canvas-confetti";

type TileState = "hidden" | "win" | "cut";
type GameState = "setup" | "playing" | "ended";

interface Tile {
  id: number;
  state: TileState;
  isFlipping: boolean;
}

const TOTAL_TILES = 49;
// Bomb rate logic based on stake
function getBombRate(stake: number) {
  if (stake <= 500) return 0.03 + Math.random() * 0.05; // 3-8%
  if (stake <= 2000) return 0.08 + Math.random() * 0.17; // 8-25%
  if (stake <= 5000) return 0.25 + Math.random() * 0.15; // 25-40%
  return 0.4; // capped at 40%
}

function getBombCount(stake: number) {
  const baseRate = getBombRate(stake);
  // ±5% randomization
  const variation = (Math.random() - 0.5) * 0.1; // -5% to +5%
  const rate = Math.max(0, Math.min(1, baseRate + variation));
  return Math.max(1, Math.round(TOTAL_TILES * rate));
}
const STAKE_AMOUNTS = [200, 400, 500, 1000, 1500, 2500, 5000];

export default function CashOrCutGame() {
  const [gameState, setGameState] = useState<GameState>("setup");
  const defaultTiles = useMemo(() => {
    return Array.from({ length: TOTAL_TILES }, (_, i) => ({
      id: i + 1,
      state: "hidden" as TileState,
      isFlipping: false,
    }));
  }, []);
  const [tiles, setTiles] = useState<Tile[]>(defaultTiles);
  const [stake, setStake] = useState<number>(500);
  const [currentWinnings, setCurrentWinnings] = useState<number>(0);
  const [revealedTiles, setRevealedTiles] = useState<number>(0);
  const [gameBoard, setGameBoard] = useState<boolean[]>([]);
  const [bombFound, setBombFound] = useState<boolean>(false);
  const {
    soundEnabled,
    setSoundEnabled,
    state: { user },
  } = useAuth();
  const balance = user?.play_balance ?? 0;
  const { mutate: startGame, isPending: isStartingGame } = useStartGame();
  const {mutate: cashout, isPending: isCashingOut} = useCashout();

  const [gameReference, setGameReference] = useState<string | null>(null);
  // Only generate game board on client to avoid hydration mismatch
  const [shouldInitBoard, setShouldInitBoard] = useState(false);
  useEffect(() => {
    if (shouldInitBoard) {
      const bombs = getBombCount(stake);
      const newBoard = new Array(TOTAL_TILES).fill(false);
      const cutPositions = new Set<number>();
      while (cutPositions.size < bombs) {
        cutPositions.add(Math.floor(Math.random() * TOTAL_TILES));
      }
      cutPositions.forEach((pos) => {
        newBoard[pos] = true;
      });
      setGameBoard(newBoard);
      // Initialize tiles
      const newTiles = Array.from({ length: TOTAL_TILES }, (_, i) => ({
        id: i + 1,
        state: "hidden" as TileState,
        isFlipping: false,
      }));
      setTiles(newTiles);
      setRevealedTiles(0);
      setCurrentWinnings(0);
      setShouldInitBoard(false);
    }
  }, [shouldInitBoard, stake]);

  const handleStartGame = () => {
    if (stake > balance) return;
    startGame(
      { amount: stake, game_type: "BOMBER" },
      {
        onSuccess: (data) => {
          setGameReference(data.reference);
          setGameState("playing");
          queryClient.invalidateQueries({
            queryKey: ["get-user"],
          });
          setShouldInitBoard(true);
        },
        onError: () => {
          // handle error (show toast, etc)
        },
      }
    );
  };

  const calculateWinnings = (tilesRevealed: number) => {
    // Multiplier: starts at 1.00x, +0.05x per safe card
    const multiplier = 1 + tilesRevealed * 0.05;
    return Math.floor(stake * multiplier);
  };

  const flipTile = (tileIndex: number) => {
    if (gameState !== "playing") return;
    const tile = tiles[tileIndex];
    if (tile.state !== "hidden" || tile.isFlipping) return;
    // Start flip animation
    setTiles((prev) =>
      prev.map((t, i) => (i === tileIndex ? { ...t, isFlipping: true } : t))
    );
    // Complete flip after animation
    setTimeout(() => {
      const isCut = gameBoard[tileIndex];
      const newState: TileState = isCut ? "cut" : "win";
      setTiles((prev) =>
        prev.map((t, i) =>
          i === tileIndex ? { ...t, state: newState, isFlipping: false } : t
        )
      );
      if (isCut) {
        setBombFound(true);
        if (soundEnabled) {
          const audio = new Audio("/audio/game-over.wav");
          audio.play();
        }
        setTimeout(() => {
          setTiles((prev) =>
            prev.map((t, i) => ({
              ...t,
              state: gameBoard[i] ? "cut" : "win",
              isFlipping: false,
            }))
          );
          setGameState("ended");
        }, 500);
      } else {
        // Win - update winnings
        if (soundEnabled) {
          const audio = new Audio("/audio/flip-card.wav");
          audio.play();
        }
        const newRevealedCount = revealedTiles + 1;
        setRevealedTiles(newRevealedCount);
        setCurrentWinnings(calculateWinnings(newRevealedCount));
      }
    }, 300);
  };
  const queryClient = useQueryClient();
  const cashOut = () => {
    if (!gameReference) return;
    cashout(
      {
        reference: gameReference,
        game_type: "BOMBER",
        amount: currentWinnings,
      },
      {
        onSuccess: () => {
          setGameState("ended");
          setBombFound(false);
          queryClient.invalidateQueries({
            queryKey: ["get-user"],
          });
          if (soundEnabled) {
            const audio = new Audio("/audio/cashout.wav");
            audio.play();
          }
          // Confetti effect
          // confetti({
          //   particleCount: 40,
          //   spread: 60,
          //   origin: { y: 0.7 },
          //   scalar: 0.6,
          // });
          // Reveal all remaining tiles
          setTiles((prev) =>
            prev.map((t, i) => ({
              ...t,
              state:
                t.state === "hidden" ? (gameBoard[i] ? "cut" : "win") : t.state,
              isFlipping: false,
            }))
          );
        },
        onError: () => {
          // handle error (show toast, etc)
        },
      }
    );
  };

  const newGame = () => {
  setGameState("setup");
  setTiles(defaultTiles);
  setCurrentWinnings(0);
  setRevealedTiles(0);
  setShouldInitBoard(false);
  };


  return (
    <div className="relative overflow-hidden">
      {gameState === "ended" && (
        <div className="space-y-4">
          <div
            className={cn(
              "text-center rounded-md py-2 px-4 border max-w-md mx-auto mb-4",
              bombFound
                ? "bg-[#370005]"
                : "bg-[#03ab5160]"
            )}
          >
            {!bombFound ? (
              <div className="text-green-400 font-bold text-base">
                🎉 You won ₦{currentWinnings}!
              </div>
            ) : (
              <div className="text-[#E9001B] font-bold text-base">
                Game Over! You lost ₦{stake}
              </div>
            )}
          </div>
        </div>
      )}
      <div className="flex justify-center mb-8">
        <div
          className="grid w-full max-w-[600px] gap-1 md:gap-3 p-2 sm:p-4 md:p-6 bg-black/20 rounded-2xl border border-purple-500/30"
          style={{
            gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
          }}
        >
          {tiles.map((tile, index) => (
            <div
              key={tile.id}
              className={cn(
                "tile-container cursor-pointer",
                "transition-all duration-200",
                gameState === "setup" && "cursor-not-allowed opacity-50"
              )}
              style={{
                width: "100%",
                aspectRatio: "4/5",
                maxWidth: "4.25rem",
                maxHeight: "4rem",
                minWidth: "2.2rem",
                minHeight: "2.5rem",
              }}
              onClick={() => flipTile(index)}
            >
              <div
                className={`tile ${tile.state !== "hidden" ? "flipped" : ""}`}
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: "1.1rem",
                  fontSize: "clamp(0.9rem, 2vw, 1.35rem)",
                }}
              >
                <div className="tile-face tile-front font-black">{tile.id}</div>
                <div
                  className={`tile-face tile-back ${
                    tile.state === "win" ? "win" : "cut"
                  }`}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <footer className="p-4 rounded-xl bg-[#140033] max-sm:w-full lg:w-[600px] mx-auto">
        {gameState == "setup" && (
          <div className="md:flex justify-center gap-2 mb-6">
            {STAKE_AMOUNTS.map((amount) => (
              <button
                key={amount}
                type="button"
                className={`px-1.5 md:px-2.5 py-1 md:py-1.5 rounded-full text-[0.6875rem] md:text-[0.825rem] font-bold transition-all border-2 focus:outline-none 
                  ${
                    stake === amount
                      ? "bg-[#D91FFF] text-white border-[#D91FFF]"
                      : "bg-[#D91FFF1A] text-[#D91FFF] border-transparent"
                  }`}
                onClick={() => setStake(amount)}
              >
                ₦{amount}
              </button>
            ))}
          </div>
        )}

        {/* Game Controls */}
        <div className="mx-auto">
          {gameState === "setup" && (
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 items-center gap-2">
                <Input
                  type="number"
                  value={stake}
                  onChange={(e) => setStake(Number(e.target.value))}
                  placeholder="Enter stake"
                  className="bg-purple-900/50 border-purple-600 text-white placeholder:text-purple-300 rounded-lg"
                />
                <div className="flex gap-2">
                  <GradientButton
                    onClick={handleStartGame}
                    disabled={stake > balance || stake <= 0}
                    size="md"
                    variant="orange"
                    className="grow w-full"
                    loading={isStartingGame}
                  >
                    Start Game
                  </GradientButton>
                  <div className="md:hidden flex items-center gap-1 md:gap-2">
                    <button
                      type="button"
                      className={cn(
                        "size-10 rounded-full bg-purple-800 text-white text-2xl font-bold border border-purple-500 hover:bg-purple-700"
                      )}
                      onClick={() => setSoundEnabled((v: boolean) => !v)}
                    >
                      <span className={""}>{soundEnabled ? "🔊" : "🔇"}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {gameState === "playing" && (
            <div className="flex gap-2">
              <GradientButton
                variant="orange"
                onClick={cashOut}
                loading={isCashingOut}
                disabled={currentWinnings === 0 || revealedTiles < 2}
                className={`w-full py-6 font-bold rounded-lg transition-all`}
              >
                {revealedTiles < 2 ? (
                  "Flip at least 2 cards to cash out"
                ) : (
                  <p className="font-normal">
                    Cashout:{" "}
                    <span className="font-semibold">
                      {currentWinnings > 0 ? `₦${currentWinnings}` : "₦0.00"}
                    </span>
                  </p>
                )}
              </GradientButton>

              <div className="md:hidden flex items-center gap-1 md:gap-2">
                <button
                  type="button"
                  className={cn(
                    "size-10 rounded-full bg-purple-800 text-white text-2xl font-bold border border-purple-500 hover:bg-purple-700"
                  )}
                  onClick={() => setSoundEnabled((v: boolean) => !v)}
                >
                  <span className={""}>{soundEnabled ? "🔊" : "🔇"}</span>
                </button>
              </div>
              {/* Sound toggle moved to header */}
            </div>
          )}

          {gameState === "ended" && (
            <div className="space-y-4">
              <GradientButton
                size="md"
                variant="default"
                onClick={newGame}
                className="w-full text-white py-4 font-bold rounded-lg"
              >
                New Game
              </GradientButton>
            </div>
          )}
        </div>
      </footer>
    </div>
  );
}
