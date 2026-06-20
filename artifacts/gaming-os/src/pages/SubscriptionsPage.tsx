import { useState } from "react";
import { useListSubscriptionPlans, useCreateSubscription } from "@workspace/api-client-react";
import { Check, Zap, Star, Crown, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const DEMO_USER_ID = 1;

const tierIcons: Record<string, React.ElementType> = {
  free: Shield,
  basic: Zap,
  premium: Star,
  vip: Crown,
};

const tierGradients: Record<string, string> = {
  free: "from-gray-600/20 to-gray-800/5",
  basic: "from-blue-600/20 to-blue-900/5",
  premium: "from-violet-600/20 to-violet-900/5",
  vip: "from-amber-500/20 to-amber-900/5",
};

const tierBorders: Record<string, string> = {
  free: "border-gray-700",
  basic: "border-blue-700/50",
  premium: "border-violet-700/50 ring-2 ring-violet-500/30",
  vip: "border-amber-600/50",
};

const tierAccents: Record<string, string> = {
  free: "text-gray-400",
  basic: "text-blue-400",
  premium: "text-violet-400",
  vip: "text-amber-400",
};

export default function SubscriptionsPage() {
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");
  const { data: plans = [], isLoading } = useListSubscriptionPlans();
  const subscribe = useCreateSubscription();
  const { toast } = useToast();

  const handleSubscribe = (slug: string) => {
    subscribe.mutate({ data: { userId: DEMO_USER_ID, plan: slug as "free" | "basic" | "premium" | "vip", billingCycle: billing } }, {
      onSuccess: () => toast({ title: `Subscribed to ${slug} plan!` }),
      onError: () => toast({ title: "Subscription failed", variant: "destructive" }),
    });
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold font-display text-foreground mb-2">Choose Your Plan</h1>
        <p className="text-muted-foreground">Access thousands of games with GamingOS subscriptions</p>

        {/* Billing Toggle */}
        <div className="inline-flex items-center gap-1 bg-card border border-border rounded-xl p-1 mt-6">
          {(["monthly", "yearly"] as const).map((cycle) => (
            <button
              key={cycle}
              data-testid={`billing-${cycle}`}
              onClick={() => setBilling(cycle)}
              className={cn(
                "px-5 py-2 rounded-lg text-sm font-medium transition-all",
                billing === cycle ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {cycle === "monthly" ? "Monthly" : "Yearly"}
              {cycle === "yearly" && <span className="ml-2 text-xs bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded-full">Save 33%</span>}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-96 rounded-2xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {plans.map((plan) => {
            const Icon = tierIcons[plan.slug] ?? Shield;
            const price = billing === "monthly" ? plan.monthlyPrice : plan.yearlyPrice;
            const isPremium = plan.slug === "premium";

            return (
              <div
                key={plan.id}
                data-testid={`plan-${plan.slug}`}
                className={cn(
                  "relative bg-card border rounded-2xl p-6 flex flex-col bg-gradient-to-b",
                  tierGradients[plan.slug],
                  tierBorders[plan.slug],
                  isPremium && "scale-[1.02]"
                )}
              >
                {isPremium && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-violet-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                    Most Popular
                  </div>
                )}
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-4", `bg-gradient-to-br ${tierGradients[plan.slug]}`)}>
                  <Icon className={cn("w-5 h-5", tierAccents[plan.slug])} />
                </div>
                <h3 className={cn("font-display text-xl font-bold mb-1", tierAccents[plan.slug])}>{plan.name}</h3>
                <div className="mb-5">
                  <span className="text-3xl font-bold text-foreground">
                    {price === 0 ? "Free" : `$${Number(price).toFixed(2)}`}
                  </span>
                  {price > 0 && <span className="text-muted-foreground text-sm">/{billing === "monthly" ? "mo" : "yr"}</span>}
                </div>
                <ul className="space-y-2 flex-1 mb-6">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <Check className={cn("w-4 h-4 mt-0.5 flex-shrink-0", tierAccents[plan.slug])} />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  data-testid={`button-subscribe-${plan.slug}`}
                  onClick={() => handleSubscribe(plan.slug)}
                  disabled={subscribe.isPending}
                  variant={isPremium ? "default" : "outline"}
                  className={cn("w-full", isPremium && "glow-primary")}
                >
                  Get {plan.name}
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
