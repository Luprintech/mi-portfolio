const WIDTH_PRESETS = {
  narrow: "880px",
  default: "1040px",
  wide: "1200px",
  full: "1400px",
};

export default function SectionViewport({
  children,
  width = "default",
  scroll = false,
  className = "",
  contentClassName = "",
}) {
  const maxWidth = WIDTH_PRESETS[width] ?? WIDTH_PRESETS.default;

  return (
    <div className={`section-viewport ${className}`.trim()}>
      <div className={`section-viewport__scroll ${scroll ? "section-viewport__scroll--scroll" : ""}`.trim()}>
        <div
          className={`section-viewport__content ${contentClassName}`.trim()}
          style={{ "--section-content-max": maxWidth }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
