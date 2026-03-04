export default function Loading() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="flex items-center gap-3">
        <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-300 border-t-blue-600" />
        <span className="text-sm text-gray-500">Carregando...</span>
      </div>
    </div>
  );
}
