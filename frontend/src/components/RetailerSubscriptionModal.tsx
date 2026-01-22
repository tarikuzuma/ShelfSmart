import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import api from "@/lib/api";
import { 
  getCurrentUserId, 
  getUserSubscriptions,
  subscribeToRetailer, 
  unsubscribeFromRetailer 
} from "@/lib/subscriptions";
import { toast } from "@/components/ui/toast";

type Retailer = {
  id: number;
  name: string;
  email: string;
  role: string;
};

interface RetailerSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubscriptionChange: () => void;
}

export function RetailerSubscriptionModal({ 
  isOpen, 
  onClose, 
  onSubscriptionChange 
}: RetailerSubscriptionModalProps) {
  const [retailers, setRetailers] = useState<Retailer[]>([]);
  const [subscribedRetailerIds, setSubscribedRetailerIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadRetailers();
      loadSubscriptions();
    }
  }, [isOpen]);

  async function loadRetailers() {
    try {
      const res = await api.get("/api/v1/retailers/");
      setRetailers(res.data);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to load retailers",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  }

  function loadSubscriptions() {
    const userId = getCurrentUserId();
    if (userId) {
      const subs = getUserSubscriptions(userId);
      setSubscribedRetailerIds(subs);
    }
  }

  function handleToggleSubscription(retailerId: number) {
    const userId = getCurrentUserId();
    if (!userId) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to subscribe",
        type: "warning",
      });
      return;
    }

    const isSubscribed = subscribedRetailerIds.includes(retailerId);
    
    if (isSubscribed) {
      unsubscribeFromRetailer(userId, retailerId);
      setSubscribedRetailerIds(prev => prev.filter(id => id !== retailerId));
      toast({
        title: "Unsubscribed",
        description: "You won't receive price alerts from this retailer",
        type: "info",
      });
    } else {
      subscribeToRetailer(userId, retailerId);
      setSubscribedRetailerIds(prev => [...prev, retailerId]);
      toast({
        title: "Subscribed!",
        description: "You'll receive price change alerts from this retailer",
        type: "success",
      });
    }
    
    onSubscriptionChange();
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-card rounded-2xl border border-border/60 shadow-lg w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-border/60">
          <h2 className="font-display text-2xl font-bold">Subscribe to Retailers</h2>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-lg hover:bg-muted flex items-center justify-center transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center text-muted-foreground py-8">Loading retailers...</div>
          ) : retailers.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">No retailers available</div>
          ) : (
            <div className="space-y-3">
              {retailers.map((retailer) => {
                const isSubscribed = subscribedRetailerIds.includes(retailer.id);
                return (
                  <div
                    key={retailer.id}
                    className={`flex items-center justify-between p-4 rounded-xl border transition-colors ${
                      isSubscribed
                        ? "border-primary bg-primary/5"
                        : "border-border/60 bg-background"
                    }`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-foreground">{retailer.name}</p>
                        {isSubscribed && (
                          <Badge variant="sustainability" className="text-xs">
                            Subscribed
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{retailer.email}</p>
                    </div>
                    <Button
                      variant={isSubscribed ? "outline" : "default"}
                      size="sm"
                      onClick={() => handleToggleSubscription(retailer.id)}
                    >
                      {isSubscribed ? "Unsubscribe" : "Subscribe"}
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        
        <div className="p-6 border-t border-border/60">
          <Button onClick={onClose} className="w-full" variant="hero">
            Done
          </Button>
        </div>
      </div>
    </div>
  );
}
