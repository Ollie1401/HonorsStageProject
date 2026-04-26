import { Link } from "react-router-dom";

export default function Tutorial() {
    return (
        <div className="page">
            <section className="card hero-card stack">
                <h1>How to Use DailyThrive</h1>
                <p>
                    DailyThrive helps you plan your day, track meals and exercise, set goals,
                    and earn rewards as you build healthier habits.
                </p>

                <div className="actions-row">
                    <Link to="/" className="btn">
                        Start Using App
                    </Link>
                    <Link to="/settings" className="btn btn-secondary">
                        Go to Settings
                    </Link>
                </div>
            </section>

            <section className="page-grid">
                <div className="card stack tutorial-card">
                    <div className="emoji-lg">🏠</div>
                    <h2>Home</h2>
                    <p>
                        The Home page gives you a quick summary of today&apos;s progress,
                        including planner items, goals, and recent activity.
                    </p>
                </div>

                <div className="card stack tutorial-card">
                    <div className="emoji-lg">📅</div>
                    <h2>Planner</h2>
                    <p>
                        Use the Planner to add daily tasks, workouts, appointments, or reminders
                        so you can keep your routine organised.
                    </p>
                </div>

                <div className="card stack tutorial-card">
                    <div className="emoji-lg">🍽️</div>
                    <h2>Log</h2>
                    <p>
                        The Log page is where you record meals, calories, exercise, and progress
                        notes. This helps the app show useful daily summaries.
                    </p>
                </div>

                <div className="card stack tutorial-card">
                    <div className="emoji-lg">🎯</div>
                    <h2>Goals</h2>
                    <p>
                        Create goals for habits such as exercise, nutrition, or consistency.
                        Completing goals helps you build progress over time.
                    </p>
                </div>

                <div className="card stack tutorial-card">
                    <div className="emoji-lg">🏆</div>
                    <h2>Rewards</h2>
                    <p>
                        Earn points by completing goals. Rewards help make progress
                        feel visible and a bit less boring.
                    </p>
                </div>

                <div className="card stack tutorial-card">
                    <div className="emoji-lg">👤</div>
                    <h2>Profile & Settings</h2>
                    <p>
                        Use Profile to choose unlocked avatars and titles. Use Settings to update
                        your username, theme, password, and data/privacy options.
                    </p>
                </div>
            </section>

            <section className="card card-soft stack">
                <h2>Recommended First Steps</h2>
                <ol className="tutorial-steps">
                    <li>Go to Settings and choose your username and preferred theme.</li>
                    <li>Add one item to your Planner for today.</li>
                    <li>Add a meal or exercise entry in Log.</li>
                    <li>Create a small goal you can realistically complete.</li>
                </ol>
            </section>
        </div>
    );
}