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

    return (
        <div className="page">
            <h1>Rewards</h1>

            <div className="card card-soft form-card">
                <h2>Your Progress</h2>
                <p><strong>Total Points:</strong> {totalPoints}</p>

                {nextReward ? (
                    <>
                        <p><strong>Next Reward:</strong> {nextReward.name}</p>
                        <p><strong>Points Until Next Reward:</strong> {pointsUntilNextReward}</p>
                        <p><strong>Milestone:</strong> {nextReward.milestone} points</p>
                    </>
                ) : (
                    <p><strong>All listed rewards unlocked!</strong></p>
                )}
            </div>

            <h2>Unlocked Rewards</h2>

            {unlockedRewards.length === 0 ? (
                <p>No rewards unlocked yet.</p>
            ) : (
                    <div className="stack section-block">
                    {unlockedRewards.map((reward) => (
                        <div key={reward.milestone} className="card card-success">
                            <h3>{reward.name}</h3>
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
                        <div key={reward.milestone} className="card card-muted">
                            <h3>{reward.name}</h3>
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