export default function Loading({ text = 'Đang tải…' }: { text?: string }) {
  return <div className="loading">{text}</div>;
}
