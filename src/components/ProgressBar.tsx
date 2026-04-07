export const ProgressBar = ({ current, total }: any) => {
  const percent = total > 0 ? (current / total) * 100 : 0;
  return (
    <div className="w-full bg-gray-200 h-2 rounded">
      <div className="bg-blue-600 h-2 rounded transition-all" style={{ width: `${percent}%` }} />
    </div>
  );
};