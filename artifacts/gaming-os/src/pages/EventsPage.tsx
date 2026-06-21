import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Clock,
  Flame,
  Gamepad2,
  Megaphone,
  Percent,
  Star,
  Swords,
  Zap,
  ChevronRight,
  Filter,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Event {
  id: number;
  title: string;
  description: string;
  type: string;
  gameId: number | null;
  startsAt: string;
  endsAt: string;
  imageUrl: string | null;
  isLive: string;
}

const TYPE_CONFIG: Record<string, { label: string; icon: typeof Flame; color: string }> = {
  double_xp: { label: "Double XP", icon: Zap, color: "from-yellow-500/20 to-orange-500/20 border-yellow-500/30" },
  season_launch: { label: "Season Launch", icon: Star, color: "from-purple-500/20 to-pink-500/20 border-purple-500/30" },
  sale: { label: "Sale", icon: Percent, color: "from-emerald-500/20 to-teal-500/20 border-emerald-500/30" },
  new_release: { label: "New Release", icon: Gamepad2, color: "from-blue-500/20 to-cyan-500/20 border-blue-500/30" },
  tournament: { label: "Tournament", icon: Swords, color: "from-red-500/20 to-rose-500/20 border-red-500/30" },
  default: { label: "Event", icon: Megaphone, color: "from-gray-500/20 to-gray-500/20 border-gray-500/30" },
};

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/social/events")
      .then(r => r.json())
      .then(setEvents)
      .finally(() => setLoading(false));
  }, []);

  const types = ["all", ...new Set(events.map(e => e.type))];

  const filtered = filter === "all" ? events : events.filter(e => e.type === filter);
  const live = filtered.filter(e => e.isLive === "true");
  const upcoming = filtered.filter(e => e.isLive !== "true");

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-white flex items-center gap-3">
          <Calendar className="w-7 h-7 text-primary" /> Events
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Browse live events, sales, and season launches</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {types.map(t => {
          const config = t !== "all" ? TYPE_CONFIG[t] || TYPE_CONFIG.default : null;
          return (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5",
                filter === t
                  ? "bg-primary text-white"
                  : "bg-card border border-white/10 text-muted-foreground hover:text-white"
              )}
            >
              {config && <config.icon className="w-3.5 h-3.5" />}
              {t === "all" ? "All Events" : (config?.label || t)}
            </button>
          );
        })}
      </div>

      {events.length === 0 ? (
        <Card className="bg-card/50 border-white/10 p-12 text-center">
          <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No events yet</h3>
          <p className="text-muted-foreground text-sm">Check back later for new events and promotions.</p>
        </Card>
      ) : (
        <div className="space-y-8">
          {live.length > 0 && (
            <section>
              <h2 className="text-sm font-bold uppercase tracking-widest text-primary mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" /> Live Now
              </h2>
              <div className="grid gap-4">
                {live.map(e => <EventCard key={e.id} event={e} />)}
              </div>
            </section>
          )}

          {upcoming.length > 0 && (
            <section>
              <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">Upcoming</h2>
              <div className="grid gap-4">
                {upcoming.map(e => <EventCard key={e.id} event={e} />)}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

function EventCard({ event }: { event: Event }) {
  const config = TYPE_CONFIG[event.type] || TYPE_CONFIG.default;
  const Icon = config.icon;
  const diff = new Date(event.endsAt).getTime() - Date.now();
  const daysLeft = Math.max(0, Math.ceil(diff / 86400000));

  return (
    <div className={cn(
      "flex items-stretch gap-5 p-5 rounded-2xl border bg-card/50 transition-all hover:bg-card/80",
      event.isLive === "true" ? "border-primary/30" : "border-white/5"
    )}>
      {event.imageUrl ? (
        <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-secondary">
          <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
        </div>
      ) : (
        <div className={cn("w-24 h-24 rounded-xl flex items-center justify-center bg-gradient-to-b flex-shrink-0", config.color)}>
          <Icon className="w-8 h-8 text-white/70" />
        </div>
      )}
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <div className="flex items-center gap-2 mb-1">
          <Badge variant="outline" className="text-xs font-semibold capitalize">
            <Icon className="w-3 h-3 mr-1" /> {config.label}
          </Badge>
          {event.isLive === "true" && (
            <span className="flex items-center gap-1 text-[11px] font-bold text-primary">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" /> LIVE
            </span>
          )}
        </div>
        <h3 className="text-base font-bold text-white truncate">{event.title}</h3>
        <p className="text-sm text-muted-foreground line-clamp-1">{event.description}</p>
        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {new Date(event.startsAt).toLocaleDateString()}
          </span>
          {daysLeft > 0 && (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {daysLeft} day{daysLeft !== 1 ? "s" : ""} left
            </span>
          )}
        </div>
      </div>
      {event.gameId && (
        <Link href={`/games/${event.gameId}`} className="flex items-center flex-shrink-0">
          <Button variant="ghost" size="sm" className="text-muted-foreground">
            <ChevronRight className="w-4 h-4" />
          </Button>
        </Link>
      )}
    </div>
  );
}
