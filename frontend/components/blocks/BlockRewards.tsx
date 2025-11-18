'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatWeiToEther } from '@/lib/utils/format';
import { Award, TrendingUp, Coins } from 'lucide-react';

interface BlockRewardsProps {
  rewards: Array<{
    reward: string;
    type: string;
  }>;
}

export function BlockRewards({ rewards }: BlockRewardsProps) {
  if (!rewards || rewards.length === 0) {
    return null;
  }

  // Calculate total rewards
  const totalReward = rewards.reduce((acc, r) => {
    return acc + parseFloat(r.reward || '0');
  }, 0);

  // Group rewards by type
  const rewardsByType = rewards.reduce((acc, reward) => {
    const type = reward.type || 'block';
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(reward);
    return acc;
  }, {} as Record<string, typeof rewards>);

  // Get reward type display info
  const getRewardTypeInfo = (type: string) => {
    switch (type.toLowerCase()) {
      case 'block':
        return {
          label: 'Block Reward',
          description: 'Reward for mining this block',
          icon: Coins,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50 dark:bg-blue-900/20',
        };
      case 'uncle':
        return {
          label: 'Uncle Reward',
          description: 'Reward for including uncle blocks',
          icon: TrendingUp,
          color: 'text-purple-600',
          bgColor: 'bg-purple-50 dark:bg-purple-900/20',
        };
      case 'emission':
        return {
          label: 'Emission Reward',
          description: 'Block emission reward',
          icon: Award,
          color: 'text-green-600',
          bgColor: 'bg-green-50 dark:bg-green-900/20',
        };
      default:
        return {
          label: type.charAt(0).toUpperCase() + type.slice(1) + ' Reward',
          description: 'Additional reward',
          icon: Award,
          color: 'text-orange-600',
          bgColor: 'bg-orange-50 dark:bg-orange-900/20',
        };
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Block Rewards
          </CardTitle>
          <Badge variant="success" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
            <Coins className="mr-1 h-3 w-3" />
            {formatWeiToEther(totalReward.toString())} ANDE
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Rewards distributed for this block
        </p>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {Object.entries(rewardsByType).map(([type, typeRewards]) => {
            const info = getRewardTypeInfo(type);
            const Icon = info.icon;
            const typeTotal = typeRewards.reduce((acc, r) => acc + parseFloat(r.reward || '0'), 0);

            return (
              <div
                key={type}
                className={`rounded-lg border p-4 ${info.bgColor}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className={`mt-1 ${info.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold">{info.label}</h4>
                      <p className="text-sm text-muted-foreground">{info.description}</p>

                      {/* Show individual rewards if multiple */}
                      {typeRewards.length > 1 && (
                        <div className="mt-2 space-y-1">
                          {typeRewards.map((reward, index) => (
                            <div key={index} className="flex items-center gap-2 text-sm">
                              <Badge variant="outline" className="font-mono text-xs">
                                #{index + 1}
                              </Badge>
                              <span className="font-mono">
                                {formatWeiToEther(reward.reward)} ANDE
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold">
                      {formatWeiToEther(typeTotal.toString())}
                    </div>
                    <div className="text-sm text-muted-foreground">ANDE</div>
                    {typeRewards.length > 1 && (
                      <Badge variant="secondary" className="mt-1">
                        {typeRewards.length} rewards
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Total Summary */}
          <div className="rounded-lg border-2 border-green-200 bg-green-50/50 p-4 dark:border-green-800 dark:bg-green-900/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-green-600" />
                <span className="font-semibold">Total Block Rewards</span>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600">
                  {formatWeiToEther(totalReward.toString())}
                </div>
                <div className="text-sm text-muted-foreground">ANDE</div>
              </div>
            </div>

            {rewards.length > 1 && (
              <div className="mt-2 text-xs text-muted-foreground">
                Distributed across {rewards.length} reward{rewards.length > 1 ? 's' : ''}
              </div>
            )}
          </div>

          {/* Info about ANDE Chain rewards */}
          <div className="rounded-lg bg-muted/50 p-3 text-sm">
            <h5 className="font-semibold">About ANDE Chain Rewards</h5>
            <p className="mt-1 text-muted-foreground">
              ANDE Chain distributes block rewards to validators. A portion of MEV (Miner Extractable Value)
              is redistributed: 80% to stakers and 20% to the treasury, ensuring fair distribution
              and network sustainability.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
