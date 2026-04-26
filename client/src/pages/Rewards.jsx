import { useEffect, useState } from "react";
import { getRewardsData } from "../services/rewardsService";

export default function Rewards() {
    const [rewardsData, setRewardsData] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    async function loadRewards() {
        try {
            setError("");
            setLoading(true);
            const data = await getRewardsData();
            setRewardsData(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadRewards();
    }, []);

    if (loading) {
        return <p>Loading rewards...</p>;
    }

    if (error) {
        return <p className="message message-error">{error}</p>;
    }

    if (!rewardsData) {
        return <p>No rewards data available.</p>;
    }

    function getRewardProgressPercent() {
        if (!nextReward) return 100;

        const previousMilestone = unlockedRewards.length > 0
            ? Math.max(...unlockedRewards.map((reward) => reward.milestone))
            : 0;

        const pointsSincePreviousReward = totalPoints - previousMilestone;
        const pointsNeededForNextReward = nextReward.milestone - previousMilestone;

        return Math.min(
            Math.round((pointsSincePreviousReward / pointsNeededForNextReward) * 100),
            100
        );
    }

    const {
        totalPoints,
        unlockedRewards,
        nextReward,
        pointsUntilNextReward,
        rewardMilestones,
    } = rewardsData;

    const lockedRewards = rewardMilestones.filter(
        (reward) => totalPoints < reward.milestone
    );

    const rewardProgressPercent = getRewardProgressPercent();

    return (
        <div className="page">
            <h1>Rewards</h1>

            <div className="card card-soft form-card reward-progress-card">
                <div className="reward-header">
                    <div>
                        <p className="small-text">Your Progress</p>
                        <h2>{totalPoints} points</h2>
                    </div>
                    <div className="reward-badge">🏆</div>
                </div>

                {nextReward ? (
                    <>
                        <p>
                            <strong>Next reward:</strong> {nextReward.name}
                        </p>

                        <div className="reward-progress-track">
                            <div
                                className="reward-progress-fill"
                                style={{ width: `${rewardProgressPercent}%` }}
                            />
                        </div>

                        <p className="small-text">
                            {rewardProgressPercent}% complete — {pointsUntilNextReward} points to go
                        </p>

                        <p>
                            <strong>Unlocks at:</strong> {nextReward.milestone} points
                        </p>
                    </>
                ) : (
                    <div className="reward-complete-box">
                        <h3>🎉 All listed rewards unlocked!</h3>
                        <p>You have unlocked every current reward. Absolute menace behaviour.</p>
                    </div>
                )}
            </div>

            <h2>Unlocked Rewards</h2>

            {unlockedRewards.length === 0 ? (
                <p>No rewards unlocked yet.</p>
            ) : (
                    <div className="stack section-block">
                    {unlockedRewards.map((reward) => (
                        <div key={reward.milestone} className="card card-success reward-card reward-unlocked">
                            <div className="reward-card-title">
                                <span className="reward-icon">🎉</span>
                                <h3>{reward.name}</h3>
                            </div>
                            <p><strong>Type:</strong> {reward.type}</p>
                            <p><strong>Unlocked at:</strong> {reward.milestone} points</p>
                            <p>{reward.description}</p>
                        </div>
                    ))}
                </div>
            )}

            <h2>Upcoming Rewards</h2>

            {lockedRewards.length === 0 ? (
                <p>No upcoming rewards.</p>
            ) : (
                    <div className="stack">
                    {lockedRewards.map((reward) => (
                        <div key={reward.milestone} className="card card-muted reward-card reward-locked">
                            <div className="reward-card-title">
                                <span className="reward-icon">🔒</span>
                                <h3>{reward.name}</h3>
                            </div>
                            <p><strong>Type:</strong> {reward.type}</p>
                            <p><strong>Unlocks at:</strong> {reward.milestone} points</p>
                            <p>{reward.description}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}