// tweaks-app.jsx — mounts ONLY the Tweaks panel.
// The portfolio itself is vanilla; this panel drives <html> attributes / vars.
const { useEffect } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "mood": "밝은",
  "accent": "#1f6fe5",
  "motion": "보통",
  "photo": "은은한 흑백"
}/*EDITMODE-END*/;

const MOOD_MAP   = { "밝은": "light", "다크": "dark", "따뜻": "warm" };
const MOTION_MAP = { "은은": "calm", "보통": "normal", "역동": "dynamic" };
const PHOTO_MAP  = { "은은한 흑백": "mono", "컬러": "color" };

function TweaksApp() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const root = document.documentElement;

  const refresh = () => { if (window.__refreshScene) window.__refreshScene(); };
  useEffect(() => { root.setAttribute("data-mood", MOOD_MAP[t.mood] || "light"); refresh(); }, [t.mood]);
  useEffect(() => { root.setAttribute("data-motion", MOTION_MAP[t.motion] || "normal"); }, [t.motion]);
  useEffect(() => { root.setAttribute("data-photo", PHOTO_MAP[t.photo] || "mono"); }, [t.photo]);
  useEffect(() => {
    if (t.accent) root.style.setProperty("--accent", t.accent);
    refresh();
  }, [t.accent]);

  return (
    <TweaksPanel title="무드 · Tweaks">
      <TweakSection label="무드 / 톤" />
      <TweakRadio
        label="배경 무드"
        value={t.mood}
        options={["밝은", "다크", "따뜻"]}
        onChange={(v) => setTweak("mood", v)}
      />
      <TweakColor
        label="강조 색상"
        value={t.accent}
        options={["#1f6fe5", "#0f8f86", "#6a5acd", "#bb6a3f", "#c2557a"]}
        onChange={(v) => setTweak("accent", v)}
      />

      <TweakSection label="움직임 / 사진" />
      <TweakRadio
        label="스크롤 모션"
        value={t.motion}
        options={["은은", "보통", "역동"]}
        onChange={(v) => setTweak("motion", v)}
      />
      <TweakRadio
        label="증명사진"
        value={t.photo}
        options={["은은한 흑백", "컬러"]}
        onChange={(v) => setTweak("photo", v)}
      />
    </TweaksPanel>
  );
}

const mount = document.createElement("div");
mount.id = "tweaks-root";
document.body.appendChild(mount);
ReactDOM.createRoot(mount).render(<TweaksApp />);
