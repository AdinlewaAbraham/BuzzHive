import React from "react";

const ErrorPage = ({ statusCode }) => {
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center">
      <h1 className="mb-4 text-4xl font-bold text-center">
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
};

export async function getServerSideProps({ res, err }) {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { props: { statusCode } };
}


export default ErrorPage;
