import React, { useState, useEffect, ErrorInfo } from "react";

const ErrorBoundary = ({ children }) => {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const errorHandler = (error, errorInfo) => {
      setHasError(true);
    };

    window.addEventListener("error", errorHandler);
    return () => {
      window.removeEventListener("error", errorHandler);
    };
  }, []);

  const handleComponentError = (error, errorInfo) => {
    setHasError(true);
  };

  if (hasError) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center">
        <h1 className="mb-4 text-4xl font-bold text-center ">
          Whoops, something went wrong.
        </h1>
        <p className="text-lg">Please refresh the page.</p>
        <button
          className="mt-4 rounded-md bg-accent-blue px-4 py-2 text-white hover:bg-blue-600"
          onClick={() => window.location.reload()}
        >
          Refresh
        </button>
      </div>
    );
  }

  return (
    <React.Fragment>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, { onError: handleComponentError });
        }
        return child;
      })}
    </React.Fragment>
  );
};

export default ErrorBoundary;
