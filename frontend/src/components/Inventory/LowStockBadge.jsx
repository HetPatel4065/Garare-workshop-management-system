function LowStockBadge({ stock, threshold }) {
  if (stock > threshold) return null;

  return (
    <span className="bg-red-500 text-white px-2.5 py-1.5 font-bold rounded text-xs">
      Low ({`Min Stock:${threshold}`})
    </span>
  );
}

export default LowStockBadge
