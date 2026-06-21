import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Settings,
  User,
  Palette,
  Bell,
  Shield,
  Trash2,
  Save,
  Check,
  Moon,
  Sun,
  Monitor,
} from "lucide-react";

const THEMES = [
  { id: "dark", label: "Dark", icon: Moon },
  { id: "light", label: "Light", icon: Sun },
  { id: "system", label: "System", icon: Monitor },
] as const;

export default function SettingsPage() {
  const { user, updateUser } = useAuth();
  const [displayName, setDisplayName] = useState(user?.displayName ?? "");
  const [bio, setBio] = useState("");
  const [country, setCountry] = useState("");
  const [theme, setTheme] = useState("dark");
  const [notifyAchievements, setNotifyAchievements] = useState(true);
  const [notifyFriendRequests, setNotifyFriendRequests] = useState(true);
  const [notifyTournaments, setNotifyTournaments] = useState(true);
  const [notifyMarketplace, setNotifyMarketplace] = useState(false);
  const [profilePublic, setProfilePublic] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName ?? "");
      const stored = JSON.parse(localStorage.getItem("gamingos_settings") || "{}");
      setBio(stored.bio ?? "");
      setCountry(stored.country ?? "");
      setTheme(stored.theme ?? "dark");
      setNotifyAchievements(stored.notifyAchievements ?? true);
      setNotifyFriendRequests(stored.notifyFriendRequests ?? true);
      setNotifyTournaments(stored.notifyTournaments ?? true);
      setNotifyMarketplace(stored.notifyMarketplace ?? false);
      setProfilePublic(stored.profilePublic ?? true);
    }
  }, [user]);

  async function handleSave() {
    try {
      await fetch(`/api/users/${user!.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName: displayName || user!.username, bio, country }),
      });
    } catch {}

    const updated = { ...user!, displayName: displayName || user!.username };
    localStorage.setItem("gamingos_user", JSON.stringify(updated));
    localStorage.setItem("gamingos_settings", JSON.stringify({
      bio, country, theme,
      notifyAchievements, notifyFriendRequests, notifyTournaments, notifyMarketplace,
      profilePublic,
    }));
    updateUser(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-display font-bold text-white flex items-center gap-3">
          <Settings className="w-7 h-7" /> Settings
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Manage your account, appearance, and preferences</p>
      </div>

      <Card className="bg-card/60 border-white/10 p-6 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <User className="w-4 h-4 text-primary" />
          </div>
          <h2 className="text-lg font-semibold text-white">Profile</h2>
        </div>
        <div className="space-y-4 max-w-sm">
          <div>
            <Label className="text-sm text-muted-foreground">Display Name</Label>
            <Input value={displayName} onChange={e => setDisplayName(e.target.value)} className="bg-white/5 border-white/10 mt-1" />
          </div>
          <div>
            <Label className="text-sm text-muted-foreground">Bio</Label>
            <Textarea value={bio} onChange={e => setBio(e.target.value)} className="bg-white/5 border-white/10 mt-1 min-h-[80px]" placeholder="Tell us about yourself..." />
          </div>
          <div>
            <Label className="text-sm text-muted-foreground">Country</Label>
            <Input value={country} onChange={e => setCountry(e.target.value)} className="bg-white/5 border-white/10 mt-1" placeholder="e.g. US, EG, AE" />
          </div>
        </div>
      </Card>

      <Card className="bg-card/60 border-white/10 p-6 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Palette className="w-4 h-4 text-primary" />
          </div>
          <h2 className="text-lg font-semibold text-white">Appearance</h2>
        </div>
        <div className="flex gap-2">
          {THEMES.map(t => {
            const Icon = t.icon;
            const active = theme === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                  active ? "bg-primary/20 border-primary/50 text-primary" : "bg-white/5 border-white/10 text-muted-foreground hover:text-white"
                }`}
              >
                <Icon className="w-4 h-4" />
                {t.label}
              </button>
            );
          })}
        </div>
      </Card>

      <Card className="bg-card/60 border-white/10 p-6 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Bell className="w-4 h-4 text-primary" />
          </div>
          <h2 className="text-lg font-semibold text-white">Notifications</h2>
        </div>
        <div className="space-y-4">
          {[
            { label: "Achievements", desc: "When you unlock a new achievement", value: notifyAchievements, set: setNotifyAchievements },
            { label: "Friend Requests", desc: "When someone sends you a friend request", value: notifyFriendRequests, set: setNotifyFriendRequests },
            { label: "Tournaments", desc: "Tournament reminders and results", value: notifyTournaments, set: setNotifyTournaments },
            { label: "Marketplace", desc: "Items sold or purchased", value: notifyMarketplace, set: setNotifyMarketplace },
          ].map(item => (
            <div key={item.label} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
              <Switch checked={item.value} onCheckedChange={item.set} />
            </div>
          ))}
        </div>
      </Card>

      <Card className="bg-card/60 border-white/10 p-6 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Shield className="w-4 h-4 text-primary" />
          </div>
          <h2 className="text-lg font-semibold text-white">Privacy</h2>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-white">Public Profile</p>
            <p className="text-xs text-muted-foreground">Allow other users to view your profile</p>
          </div>
          <Switch checked={profilePublic} onCheckedChange={setProfilePublic} />
        </div>
      </Card>

      <Card className="bg-card/60 border-red-500/20 p-6 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
            <Trash2 className="w-4 h-4 text-red-400" />
          </div>
          <h2 className="text-lg font-semibold text-red-400">Danger Zone</h2>
        </div>
        <p className="text-sm text-muted-foreground">Permanently delete your account and all associated data. This action cannot be undone.</p>
        <Button variant="destructive" size="sm" className="bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30">
          <Trash2 className="w-4 h-4 mr-1" /> Delete Account
        </Button>
      </Card>

      <div className="flex justify-end pb-12">
        <Button onClick={handleSave} className="px-8">
          {saved ? <><Check className="w-4 h-4 mr-1" /> Saved</> : <><Save className="w-4 h-4 mr-1" /> Save Changes</>}
        </Button>
      </div>
    </div>
  );
}
