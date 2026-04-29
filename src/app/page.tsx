import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { CalendarDays, Minus, Plus } from "lucide-react";
import { redirect } from "next/navigation";

import { createTarget, decrementToday, incrementToday, setTodayCount } from "@/app/actions";
import { getDashboardData } from "@/lib/dashboard";

function formatAverage(value: number) {
  return value.toFixed(1);
}

export default async function Home() {
  const { isAuthenticated, userId } = await auth();

  if (!isAuthenticated || !userId) {
    redirect("/sign-in");
  }

  const dashboard = await getDashboardData(userId);

  return (
    <main className="page-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">{dashboard.todayLabel}</p>
          <h1>我慢カウンター</h1>
        </div>
        <UserButton />
      </header>

      <section className="summary-grid" aria-label="全体サマリー">
        <div className="summary-tile">
          <span>これまでの合計</span>
          <strong>{dashboard.overall.total}</strong>
        </div>
        <div className="summary-tile">
          <span>1日の平均</span>
          <strong>{formatAverage(dashboard.overall.dailyAverage)}</strong>
        </div>
        <div className="summary-tile">
          <span>記録日数</span>
          <strong>{dashboard.overall.trackedDays}</strong>
        </div>
      </section>

      <section className="entry-band" aria-labelledby="new-target-title">
        <div>
          <h2 id="new-target-title">我慢するもの</h2>
        </div>
        <form action={createTarget} className="new-target-form">
          <input
            type="text"
            name="name"
            maxLength={80}
            placeholder="例: 間食、SNS、夜更かし"
            aria-label="我慢するもの"
            required
          />
          <button type="submit">追加</button>
        </form>
      </section>

      {dashboard.targets.length === 0 ? (
        <section className="empty-state">
          <h2>まだ記録がありません</h2>
          <p>最初の我慢するものを追加してください。</p>
        </section>
      ) : (
        <>
          <section className="target-grid" aria-label="今日のカウント">
            {dashboard.targets.map((target) => (
              <article className="target-card" key={target.id}>
                <div className="target-card-header">
                  <div>
                    <h2>{target.name}</h2>
                    <p>開始 {target.createdDateKey}</p>
                  </div>
                  <span className="today-badge">今日</span>
                </div>

                <div className="counter-row">
                  <form action={decrementToday.bind(null, target.id)}>
                    <button
                      type="submit"
                      className="icon-button"
                      aria-label={`${target.name}を1回減らす`}
                      disabled={target.todayCount <= 0}
                    >
                      <Minus aria-hidden="true" size={20} />
                    </button>
                  </form>
                  <div className="count-display">
                    <strong>{target.todayCount}</strong>
                    <span>回</span>
                  </div>
                  <form action={incrementToday.bind(null, target.id)}>
                    <button
                      type="submit"
                      className="icon-button primary"
                      aria-label={`${target.name}を1回増やす`}
                    >
                      <Plus aria-hidden="true" size={20} />
                    </button>
                  </form>
                </div>

                <form action={setTodayCount} className="set-count-form">
                  <input type="hidden" name="targetId" value={target.id} />
                  <label>
                    <span>今日の回数</span>
                    <input
                      type="number"
                      name="count"
                      min={0}
                      max={9999}
                      defaultValue={target.todayCount}
                    />
                  </label>
                  <button type="submit">更新</button>
                </form>

                <dl className="target-stats">
                  <div>
                    <dt>合計</dt>
                    <dd>{target.total}</dd>
                  </div>
                  <div>
                    <dt>1日平均</dt>
                    <dd>{formatAverage(target.dailyAverage)}</dd>
                  </div>
                  <div>
                    <dt>日数</dt>
                    <dd>{target.trackedDays}</dd>
                  </div>
                </dl>
              </article>
            ))}
          </section>

          <section className="history-section" aria-labelledby="history-title">
            <div className="section-heading">
              <div>
                <p className="eyebrow">過去30日</p>
                <h2 id="history-title">履歴</h2>
              </div>
              <CalendarDays aria-hidden="true" size={22} />
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th scope="col">日付</th>
                    {dashboard.targets.map((target) => (
                      <th scope="col" key={target.id}>
                        {target.name}
                      </th>
                    ))}
                    <th scope="col">日合計</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboard.historyKeys.map((dateKey) => {
                    const dailyTotal = dashboard.targets.reduce(
                      (sum, target) => sum + (target.countsByDate.get(dateKey) ?? 0),
                      0
                    );

                    return (
                      <tr key={dateKey}>
                        <th scope="row">{dashboard.historyLabels.get(dateKey)}</th>
                        {dashboard.targets.map((target) => (
                          <td key={target.id}>{target.countsByDate.get(dateKey) ?? 0}</td>
                        ))}
                        <td>{dailyTotal}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </main>
  );
}
