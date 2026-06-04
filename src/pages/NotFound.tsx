import { Link } from "react-router-dom";

export function NotFound() {
  return (
    <div className="container-page py-32 text-center">
      <p className="font-mono text-5xl font-bold text-mint">404</p>
      <h1 className="mt-4 text-2xl font-bold">Page not found</h1>
      <p className="mt-2 text-haze">That link doesn't lead anywhere.</p>
      <Link to="/" className="btn-primary mt-6">
        Back home
      </Link>
    </div>
  );
}
