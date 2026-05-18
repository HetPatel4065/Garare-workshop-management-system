export default function StatusBadge({ status }) {
  const colorMap = {
    pending: "bg-amber-500",
    "in-progress": "bg-blue-500",
    completed: "bg-emerald-500",
    cancelled: "bg-red-500",
  };
  const colorClass = colorMap[status?.toLowerCase()] || "bg-gray-500";

  return (
    <span
      className={`px-2 py-0.5 rounded text-white text-[10px] uppercase font-bold tracking-widest ${colorClass}`}
    >
      {(status || "").replace(/-/g, " ")}
    </span>
  );
}
