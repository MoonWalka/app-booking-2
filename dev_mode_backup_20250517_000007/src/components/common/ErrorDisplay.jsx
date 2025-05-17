export default function ErrorDisplay({ error }) {
  return <div className="error">Error: {error.message}</div>;
}