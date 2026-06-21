import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Sword,
  Crosshair,
  Car,
  Castle,
  Brain,
  Puzzle,
  Music,
  Shield,
  ChevronRight,
  ChevronLeft,
  Check,
  Sparkles,
  Gamepad2,
} from "lucide-react";

const GENRES = [
  { id: "action", label: "Action", icon: Crosshair, color: "from-red-500/20 to-orange-500/20", border: "border-red-500/30" },
  { id: "adventure", label: "Adventure", icon: Castle, color: "from-amber-500/20 to-yellow-500/20", border: "border-amber-500/30" },
  { id: "rpg", label: "RPG", icon: Sword, color: "from-violet-500/20 to-purple-500/20", border: "border-violet-500/30" },
  { id: "racing", label: "Racing", icon: Car, color: "from-blue-500/20 to-cyan-500/20", border: "border-blue-500/30" },
  { id: "strategy", label: "Strategy", icon: Brain, color: "from-emerald-500/20 to-teal-500/20", border: "border-emerald-500/30" },
  { id: "puzzle", label: "Puzzle", icon: Puzzle, color: "from-pink-500/20 to-rose-500/20", border: "border-pink-500/30" },
  { id: "shooter", label: "Shooter", icon: Crosshair, color: "from-orange-500/20 to-red-500/20", border: "border-orange-500/30" },
  { id: "fighting", label: "Fighting", icon: Shield, color: "from-rose-500/20 to-pink-500/20", border: "border-rose-500/30" },
  { id: "music", label: "Music", icon: Music, color: "from-indigo-500/20 to-violet-500/20", border: "border-indigo-500/30" },
];

export default function OnboardingPage() {
  const { user, updateUser } = useAuth();
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(0);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [displayName, setDisplayName] = useState(user?.displayName ?? user?.username ?? "");
  const [bio, setBio] = useState("");

  function toggleGenre(id: string) {
    setSelectedGenres(prev =>
      prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]
    );
  }

  function handleNext() {
    if (step < 2) setStep(s => s + 1);
  }

  function handleBack() {
    if (step > 0) setStep(s => s - 1);
  }

  async function handleComplete() {
    try {
      await fetch(`/api/users/${user!.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName: displayName || user!.username, bio }),
      });
    } catch {}

    const stored = JSON.parse(localStorage.getItem("gamingos_user") || "{}");
    stored.displayName = displayName || user!.username;
    stored.onboardingComplete = true;
    stored.genres = selectedGenres;
    localStorage.setItem("gamingos_user", JSON.stringify(stored));
    updateUser(stored);
    setLocation("/");
  }

  if (!user) {
    setLocation("/login");
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4">
      <div className="w-full max-w-2xl">
        <div className="flex items-center justify-center gap-3 mb-8">
          <Gamepad2 className="w-8 h-8 text-primary" />
          <h1 className="text-2xl font-display font-bold text-white">GamingOS</h1>
        </div>

        <div className="flex justify-center gap-2 mb-8">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === step ? "w-8 bg-primary" : i < step ? "w-4 bg-primary/50" : "w-4 bg-white/20"
              }`}
            />
          ))}
        </div>

        <Card className="bg-card/80 backdrop-blur-xl border-white/10 p-8">
          {step === 0 && (
            <div className="text-center space-y-6">
              <div className="w-20 h-20 mx-auto rounded-full bg-primary/20 flex items-center justify-center">
                <Sparkles className="w-10 h-10 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Welcome, {user.displayName || user.username}!
                </h2>
                <p className="text-muted-foreground">
                  Let's set up your GamingOS experience. Tell us about your gaming preferences so we can personalize your dashboard.
                </p>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-white mb-2">Pick Your Genres</h2>
                <p className="text-muted-foreground">Select your favorite game genres to get personalized recommendations.</p>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {GENRES.map(genre => {
                  const Icon = genre.icon;
                  const selected = selectedGenres.includes(genre.id);
                  return (
                    <button
                      key={genre.id}
                      onClick={() => toggleGenre(genre.id)}
                      className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border transition-all duration-200 ${
                        selected
                          ? `${genre.border} bg-gradient-to-b ${genre.color} ring-1 ring-primary/50`
                          : "border-white/10 bg-white/5 hover:bg-white/10"
                      }`}
                    >
                      <Icon className={`w-6 h-6 ${selected ? "text-primary" : "text-white/60"}`} />
                      <span className={`text-sm font-medium ${selected ? "text-white" : "text-white/60"}`}>
                        {genre.label}
                      </span>
                      {selected && (
                        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
              <div className="flex flex-wrap gap-2 justify-center">
                {selectedGenres.map(id => {
                  const g = GENRES.find(g => g.id === id);
                  return g ? <Badge key={id} variant="secondary">{g.label}</Badge> : null;
                })}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-white mb-2">Personalize Your Profile</h2>
                <p className="text-muted-foreground">Set your display name and add a short bio.</p>
              </div>
              <div className="space-y-4 max-w-sm mx-auto">
                <div>
                  <label className="text-sm text-muted-foreground mb-1.5 block">Display Name</label>
                  <Input
                    value={displayName}
                    onChange={e => setDisplayName(e.target.value)}
                    placeholder="Your display name"
                    className="bg-white/5 border-white/10"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1.5 block">Bio (optional)</label>
                  <Textarea
                    value={bio}
                    onChange={e => setBio(e.target.value)}
                    placeholder="Tell other gamers about yourself..."
                    className="bg-white/5 border-white/10 min-h-[100px]"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between mt-8">
            <Button
              variant="ghost"
              onClick={handleBack}
              disabled={step === 0}
              className="text-muted-foreground"
            >
              <ChevronLeft className="w-4 h-4 mr-1" /> Back
            </Button>
            {step < 2 ? (
              <Button onClick={handleNext}>
                Next <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button onClick={handleComplete} className="bg-primary hover:bg-primary/90">
                <Check className="w-4 h-4 mr-1" /> Complete Setup
              </Button>
            )}
          </div>
        </Card>

        {step < 2 && (
          <p className="text-center text-xs text-muted-foreground mt-4">
            Step {step + 1} of 3
          </p>
        )}
      </div>
    </div>
  );
}
