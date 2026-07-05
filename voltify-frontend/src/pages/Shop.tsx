// src/pages/Shop.tsx
import { useState, useEffect } from 'react';
import { Coins, ShoppingBag, ArrowUpRight, Flame, Trophy, CheckCircle, Gift, Sparkles, Clock } from 'lucide-react';
import { apiService } from '../lib/api';
import { useGamificationStore } from '../store/gamificationStore';
import { useAuthStore } from '../store/authStore';
import GlassCard from '../components/ui/GlassCard';
import { toast } from 'react-toastify';
import { formatCurrency } from '../lib/utils';

export default function Shop() {
  const { user, updateUser } = useAuthStore();
  const { coins, streak_days, setCoins } = useGamificationStore();
  const [shopItems, setShopItems] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [redeemingId, setRedeemingId] = useState<string | null>(null);

  async function loadData() {
    try {
      setLoading(true);
      const [shopData, gamestats] = await Promise.all([
        apiService.getShopItems(),
        apiService.getGamificationStats()
      ]);
      setShopItems(shopData?.items || []);
      setStats(gamestats);
    } catch (err) {
      console.error("Failed to load rewards shop data", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const handleRedeem = async (itemId: string) => {
    try {
      setRedeemingId(itemId);
      const res = await apiService.redeemShopItem(itemId);
      if (res.success) {
        toast.success(`🎉 Redeem successful! ${res.redeemed_item} claimed!`);
        setCoins(res.new_balance);
        
        // Update local auth store so stats stay synchronized
        if (user) {
          updateUser({
            ...user,
            coins: res.new_balance
          });
        }
        await loadData();
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to redeem reward');
    } finally {
      setRedeemingId(null);
    }
  };

  const getTxColor = (type: string, amount: number) => {
    if (amount < 0) return 'text-rose-400';
    if (type === 'streak') return 'text-volt-pink';
    if (type === 'checkin') return 'text-primary';
    return 'text-tertiary';
  };

  const getTxTypeLabel = (type: string) => {
    switch (type) {
      case 'streak': return '🔥 Streak Bonus';
      case 'checkin': return '✨ Daily Checkin';
      case 'redeemed': return '🛍️ Redemption';
      case 'challenge': return '🎯 Quest Victory';
      default: return '⚡ Saving Reward';
    }
  };

  const formatTxDate = (isoStr: string) => {
    if (!isoStr) return '';
    const d = new Date(isoStr);
    return d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-8 font-headline text-on-surface">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-display font-semibold text-3xl tracking-tight text-gradient">🛍️ SHOP CONSOLE</h1>
          <p className="text-sm text-on-surface-variant">Redeem your hard-earned Voltify Coins for real voucher rewards and bill utility credits</p>
        </div>
      </div>

      {/* Coins summary grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard className="flex items-center gap-4 bg-primary/5 border-primary/20">
          <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
            <Coins className="size-6 text-primary shrink-0 animate-bounce" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-primary uppercase tracking-widest block">Available Balance</span>
            <h3 className="text-2xl font-extrabold text-white font-mono mt-0.5">{coins} COINS</h3>
          </div>
        </GlassCard>

        <GlassCard className="flex items-center gap-4 bg-volt-pink/5 border-volt-pink/20">
          <div className="size-12 rounded-xl bg-volt-pink/10 flex items-center justify-center border border-volt-pink/20">
            <Flame className="size-6 text-volt-pink shrink-0" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-volt-pink uppercase tracking-widest block">Active Multiplier</span>
            <h3 className="text-2xl font-extrabold text-white font-mono mt-0.5">{stats?.active_multiplier || '1.15'}x boost</h3>
          </div>
        </GlassCard>

        <GlassCard className="flex items-center gap-4 bg-tertiary/5 border-tertiary/20">
          <div className="size-12 rounded-xl bg-tertiary/10 flex items-center justify-center border border-tertiary/20">
            <ShoppingBag className="size-6 text-tertiary shrink-0" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-tertiary uppercase tracking-widest block">Weekly Coins Earned</span>
            <h3 className="text-2xl font-extrabold text-white font-mono mt-0.5">+{stats?.weekly_coins_earned || 0} c</h3>
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Rewards Catalog */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
              <Gift className="size-5 text-primary" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-lg text-on-surface">Redeemable Rewards</h3>
              <p className="text-xs text-on-surface-variant">Click to redeem credits, smart plug hardware upgrades, or digital vouchers</p>
            </div>
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs text-on-surface-variant italic">Loading rewards catalog...</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {shopItems.map((item) => (
                <div 
                  key={item.id} 
                  className={`bg-white/5 border p-5 rounded-2xl flex flex-col justify-between gap-4 transition-all duration-300 relative overflow-hidden group ${
                    item.can_afford 
                      ? 'border-white/[0.06] hover:border-primary/40 hover:shadow-[0_0_15px_rgba(0,229,255,0.05)]' 
                      : 'border-white/[0.03] opacity-60'
                  }`}
                >
                  {/* Decorative Glow Icon */}
                  <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity text-primary">
                    <Gift className="size-12" />
                  </div>

                  <div className="space-y-1.5 z-10 relative">
                    <h4 className="font-bold text-sm text-white group-hover:text-primary transition-colors">{item.reward}</h4>
                    <p className="text-xs text-on-surface-variant leading-relaxed">{item.description}</p>
                  </div>

                  <div className="flex items-center justify-between mt-2 pt-3 border-t border-white/[0.04] z-10 relative">
                    <div className="flex items-center gap-1">
                      <Coins className="size-4 text-primary shrink-0" />
                      <span className="font-mono text-xs font-extrabold text-white">{item.coins_required} c</span>
                    </div>

                    <button
                      type="button"
                      disabled={!item.can_afford || redeemingId !== null}
                      onClick={() => handleRedeem(item.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${
                        item.can_afford
                          ? 'bg-primary hover:bg-primary/95 text-surface shadow-md hover:scale-105'
                          : 'bg-white/10 border border-white/5 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      {redeemingId === item.id ? 'Claiming...' : 'Redeem Now'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Coin transaction history */}
        <GlassCard className="flex flex-col justify-between h-[450px]">
          <div className="flex justify-between items-center mb-4 pb-3 border-b border-white/[0.05]">
            <h3 className="font-display font-semibold text-sm text-on-surface tracking-wider uppercase flex items-center gap-2">
              <Clock className="size-4 text-slate-400" /> Transaction history
            </h3>
            <span className="text-[9px] font-mono uppercase bg-white/5 px-2 py-0.5 rounded text-on-surface-variant font-bold">Ledger</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {!stats?.recent_transactions || stats.recent_transactions.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-on-surface-variant italic">
                No recent transaction logs
              </div>
            ) : (
              stats.recent_transactions.map((tx: any, idx: number) => {
                const isDebit = tx.coins < 0;
                return (
                  <div 
                    key={idx} 
                    className="p-3 bg-white/[0.03] border border-white/[0.04] rounded-xl flex justify-between items-center text-xs hover:bg-white/[0.06] transition-colors"
                  >
                    <div className="space-y-1 pr-2 min-w-0">
                      <span className="font-bold text-white block truncate">{tx.reason || getTxTypeLabel(tx.type)}</span>
                      <span className="text-[10px] text-on-surface-variant block font-medium">
                        {getTxTypeLabel(tx.type)} | {formatTxDate(tx.created_at)}
                      </span>
                    </div>

                    <div className="text-right shrink-0">
                      <span className={`font-mono font-bold text-sm ${getTxColor(tx.type, tx.coins)}`}>
                        {isDebit ? '' : '+'}{tx.coins} c
                      </span>
                      {tx.multiplier > 1.0 && !isDebit && (
                        <span className="block text-[9px] text-slate-400 font-mono">({tx.multiplier}x boost)</span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
