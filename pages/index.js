import App from "../components/App.jsx";
import ErrorBoundary from "@/components/errorBoundary/ErrorBoundary.jsx";

export default function Home() {
  return (
    <>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </>
  );
}
