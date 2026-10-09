import { PickArt } from "../pages/student-platform/uiParts";
import { BookmarkIcon } from "./SavedLessons";

/* What a guest sees BEHIND the sign-in card (inside <GuestLock>): a static, non-interactive
   look-alike of the "هل تعلم؟" bubble and the "دروسي المحفوظة" cards, so the page looks
   alive and shows what signing in unlocks. It reads/writes no data and fetches nothing.
   `samples` = a few real lessons of the student's grade (just their titles are shown). */

export default function GuestPreview({ samples = [] }) {
  const cards = samples.slice(0, 3);
  return (
    <>
      <section className="md-dashboard mb-6" aria-hidden="true">
        <div className="duo-dyk" data-accent="4">
          <div className="duo-dyk-art"><PickArt kind="bulb" /></div>
          <div className="duo-dyk-bubble">
            <span className="duo-dyk-tag">💡 هل تعلم؟</span>
            <p className="duo-dyk-text">هنا تظهر لك معلومة جديدة ومختلفة في كل زيارة.</p>
          </div>
        </div>
      </section>

      <section className="md-dashboard mb-6" aria-hidden="true">
        <div className="duo-saved-head">
          <h2 className="duo-saved-title">
            <span className="ico"><BookmarkIcon /></span>
            دروسي المحفوظة
          </h2>
        </div>
        <div className="duo-saved-list">
          {cards.length
            ? cards.map((l, i) => (
                <div key={l.id} className="duo-saved-card" data-accent={i % 6}>
                  <div className="duo-saved-open">
                    <span className="duo-saved-badge"><BookmarkIcon /></span>
                    <span className="duo-saved-body">
                      <span className="duo-saved-name">{l.title}</span>
                      {l.subject ? <span className="duo-saved-meta">{l.subject}</span> : null}
                    </span>
                    <span className="duo-saved-go" aria-hidden="true">‹</span>
                  </div>
                </div>
              ))
            : [0, 1, 2].map((i) => (
                <div key={i} className="duo-saved-card ghost" data-accent={i % 6}>
                  <div className="duo-saved-open">
                    <span className="duo-saved-ghostbadge" />
                    <span className="duo-saved-body" style={{ flex: 1 }}>
                      <span className="duo-saved-bar" style={{ width: "70%" }} />
                      <span className="duo-saved-bar" style={{ width: "40%" }} />
                    </span>
                  </div>
                </div>
              ))}
        </div>
      </section>
    </>
  );
}
