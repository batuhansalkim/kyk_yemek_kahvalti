export default function MobileMealPlanner() {
  return (
    <div style={styles.page} role="status" aria-label="Yükleniyor">
      <div style={styles.dots}>
        <span style={{ ...styles.dot, animationDelay: "0s" }}>.</span>
        <span style={{ ...styles.dot, animationDelay: "0.15s" }}>.</span>
        <span style={{ ...styles.dot, animationDelay: "0.3s" }}>.</span>
      </div>

      {/* Inline keyframes */}
      <style>
        {`
          @keyframes pulse {
            0%, 80%, 100% {
              opacity: 0.2;
              transform: translateY(0);
            }
            40% {
              opacity: 1;
              transform: translateY(-6px);
            }
          }
        `}
      </style>
    </div>
  );
}

const styles = {
  page: {
    position: "fixed",
    inset: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0f0f0f",
    zIndex: 9999,
    padding:
      "env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)"
  },
  dots: {
    display: "flex",
    gap: "clamp(6px, 2vw, 14px)",
    fontSize: "clamp(40px, 10vw, 90px)",
    fontWeight: 800,
    color: "#ffffff",
    lineHeight: 1
  },
  dot: {
    animation: "pulse 1.2s infinite ease-in-out",
    opacity: 0.2
  }
};
