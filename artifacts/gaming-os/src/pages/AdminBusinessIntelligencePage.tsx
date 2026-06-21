import { useState, useEffect } from "react";
import { Brain, TrendingUp, TrendingDown, Lightbulb, BarChart3, Users, Gamepad2, DollarSign, Clock, Target, Zap, Shield, Activity, ArrowUpRight, AlertTriangle, CheckCircle2, Cpu } from "lucide-react";
import { cn } from "@/lib/utils";

const AI_INSIGHTS = [
  { type: "positive", icon: TrendingUp, text: "Subscriptions grew 14.2% this week — driven by VIP tier upgrade campaign", time: "Updated 2m ago", color: "text-emerald-400" },
  { type: "warning", icon: TrendingDown, text: "User retention dropped 3.1% on mobile — investigate onboarding flow", time: "Updated 5m ago", color: "text-red-400" },
  { type: "prediction", icon: Lightbulb, text: "Predicting 'Dragon's Lair: Reborn' will trend +22% in next 48 hours", time: "AI Prediction", color: "text-amber-400" },
  { type: "opportunity", icon: Target, text: "Best launch window for tournaments: Friday 8PM GMT (engagement +34%)", time: "AI Suggestion", color: "text-blue-400" },
  { type: "insight", icon: BarChart3, text: "Game #7 has highest review-to-download ratio — consider featuring in Today tab", time: "AI Recommendation", color: "text-violet-400" },
];

const METRICS_FORECAST = [
  { label: "Next 7 Days", icon: TrendingUp, data: [
    { day: "Mon", actual: 12400, predicted: 13200 },
    { day: "Tue", actual: 11800, predicted: 12600 },
    { day: "Wed", actual: 13100, predicted: 12900 },
    { day: "Thu", actual: null, predicted: 13500 },
    { day: "Fri", actual: null, predicted: 15200 },
    { day: "Sat", actual: null, predicted: 16800 },
    { day: "Sun", actual: null, predicted: 15400 },
  ]},
];

const AI_MODELS = [
  { name: "Revenue Predictor", accuracy: 94, status: "trained", lastRun: "2m ago", color: "text-emerald-400" },
  { name: "Churn Detector", accuracy: 89, status: "trained", lastRun: "5m ago", color: "text-blue-400" },
  { name: "Trend Forecaster", accuracy: 82, status: "training", lastRun: "In progress...", color: "text-amber-400" },
  { name: "Fraud Scanner", accuracy: 96, status: "trained", lastRun: "1m ago", color: "text-violet-400" },
  { name: "Player Sentiment", accuracy: 78, status: "idle", lastRun: "1h ago", color: "text-muted-foreground" },
];

export default function AdminBusinessIntelligencePage() {
  const [ticks, setTicks] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTicks(t => t + 1), 5000);
    return () => clearInterval(interval);
  }, []);

  const predictedRevenue = 15200 + Math.floor(Math.sin(ticks * 0.5) * 400);

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Brain className="w-6 h-6 text-primary" /> AI Business Intelligence
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">Predictive analytics, trend forecasting & automated recommendations</p>
        </div>
        <div className="flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 rounded-xl px-3 py-2">
          <Activity className="w-3.5 h-3.5 text-violet-400 animate-pulse" />
          <span className="text-xs font-semibold text-violet-400">AI Engine Active</span>
        </div>
      </div>

      {/* AI Insight Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {AI_INSIGHTS.map(insight => (
          <div key={insight.text} className={cn("bg-card border rounded-2xl p-4", insight.type === "warning" ? "border-red-500/20" : "border-border")}>
            <div className="flex items-start gap-3">
              <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0", insight.color.replace("text-", "bg-") + "/20")}>
                <insight.icon className={cn("w-4 h-4", insight.color)} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-foreground leading-relaxed">{insight.text}</p>
                <p className={cn("text-[10px] mt-1.5 font-medium", insight.color)}>{insight.time}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Revenue Forecast */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-primary" /> 7-Day Revenue Forecast
          </h2>
          <div className="flex items-center gap-2 text-xs">
            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-primary" /> Actual</div>
            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-amber-400" /> Predicted</div>
          </div>
        </div>
        <div className="flex items-end gap-2 h-32">
          {METRICS_FORECAST[0].data.map(d => (
            <div key={d.day} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
              <div className="w-full flex flex-col items-center gap-0.5 justify-end h-full">
                {d.predicted && (
                  <div className="w-full bg-amber-400/60 rounded-t" style={{ height: `${(d.predicted / 17000) * 100}%`, minHeight: 4 }} />
                )}
                {d.actual && (
                  <div className="w-full bg-primary rounded-t" style={{ height: `${(d.actual / 17000) * 100}%`, minHeight: 4 }} />
                )}
              </div>
              <span className="text-[10px] text-muted-foreground mt-1">{d.day}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
          <p className="text-xs text-foreground">
            <span className="text-amber-400 font-bold">AI Forecast:</span>{" "}
            Estimated revenue of <strong>${predictedRevenue.toLocaleString()}</strong> on Friday —{" "}
            <span className="text-emerald-400">+14.2% above weekly average</span>
          </p>
        </div>
      </div>

      {/* AI Models + Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-card border border-border rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-primary" /> AI Model Status
          </h2>
          <div className="space-y-2">
            {AI_MODELS.map(m => (
              <div key={m.name} className="flex items-center gap-3 p-2.5 rounded-xl bg-background border border-border">
                <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", m.color.replace("text-", "bg-") + "/20")}>
                  <Brain className={cn("w-4 h-4", m.color)} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-foreground">{m.name}</p>
                    <span className={cn("text-[10px] px-1.5 py-0.5 rounded font-bold uppercase",
                      m.status === "trained" ? "bg-emerald-500/20 text-emerald-400" :
                      m.status === "training" ? "bg-amber-500/20 text-amber-400 animate-pulse" : "bg-gray-500/20 text-gray-400")}>
                      {m.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-muted-foreground">Accuracy: {m.accuracy}%</span>
                    <span className="text-[10px] text-muted-foreground">· Last: {m.lastRun}</span>
                  </div>
                </div>
                <div className="w-12 h-1.5 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: `${m.accuracy}%` }} />
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-3 py-2 bg-primary/20 text-primary rounded-xl text-xs font-bold hover:bg-primary/30 transition-colors">
            Retrain All Models
          </button>
        </div>

        <div className="space-y-5">
          {/* Automated Recommendations */}
          <div className="bg-card border border-border rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-amber-400" /> AI Recommendations
            </h2>
            <div className="space-y-2">
              {[
                { action: "Feature 'Nebula Assault' in Today tab", impact: "+22% installs", priority: "high" },
                { action: "Send push to lapsed Premium users (30d+)", impact: "+8% re-activation", priority: "high" },
                { action: "Increase server capacity for Asia-Pacific", impact: "Prevent 12% latency increase", priority: "medium" },
                { action: "Offer 7-day free trial to Basic users", impact: "+15% conversion", priority: "medium" },
                { action: "Schedule tournament for Saturday 8PM GMT", impact: "Max engagement window", priority: "low" },
              ].map(r => (
                <div key={r.action} className="flex items-start gap-3 p-2.5 rounded-xl bg-background border border-border">
                  <div className={cn("w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0",
                    r.priority === "high" ? "bg-red-400" : r.priority === "medium" ? "bg-amber-400" : "bg-blue-400")} />
                  <div className="flex-1">
                    <p className="text-xs text-foreground">{r.action}</p>
                    <p className="text-[10px] text-emerald-400 mt-0.5">Predicted impact: {r.impact}</p>
                  </div>
                  <button className="text-[10px] px-2 py-1 bg-primary/20 text-primary rounded-lg font-bold whitespace-nowrap">Apply</button>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-card border border-border rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" /> AI Confidence Metrics
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Revenue Forecast", value: "94%", icon: DollarSign, color: "text-emerald-400" },
                { label: "Churn Prediction", value: "89%", icon: Users, color: "text-blue-400" },
                { label: "Trend Accuracy", value: "82%", icon: TrendingUp, color: "text-amber-400" },
                { label: "Fraud Detection", value: "96%", icon: Shield, color: "text-violet-400" },
              ].map(m => (
                <div key={m.label} className="bg-background border border-border rounded-xl p-3 text-center">
                  <m.icon className={cn("w-4 h-4 mx-auto mb-1", m.color)} />
                  <p className="text-lg font-bold text-foreground">{m.value}</p>
                  <p className="text-[10px] text-muted-foreground">{m.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
