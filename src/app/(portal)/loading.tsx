// Sofortiges Lade-Skelett bei jedem Seitenwechsel im Portal
export default function PortalLoading() {
  return (
    <div className="animate-pulse space-y-4 pt-2">
      <div className="h-6 w-40 rounded-full bg-line" />
      <div className="grid grid-cols-2 gap-3">
        <div className="h-24 rounded-[18px] bg-white" />
        <div className="h-24 rounded-[18px] bg-white" />
      </div>
      <div className="h-40 rounded-[18px] bg-white" />
      <div className="h-40 rounded-[18px] bg-white" />
    </div>
  );
}
