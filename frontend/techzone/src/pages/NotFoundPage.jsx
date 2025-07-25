import React from "react";
import { useNavigate } from "react-router-dom";

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col md:flex-row items-center justify-center min-h-screen px-4 bg-gray-100 dark:bg-gray-900">
      <img
        src="https://cdni.iconscout.com/illustration/premium/thumb/404-error-3708444-3119148.png"
        alt="404"
        className="w-full max-w-md mb-6 md:mb-0 md:mr-10"
      />

      <div className="text-center md:text-left shadow-lg p-16  bg-white dark:bg-gray-800 rounded-r-4xl">
        <h1 className="text-5xl font-bold text-red-500 mb-4">404 - Not Found</h1>
        <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
          The page you are looking for does not exist or has been moved or you don't have permission to access it.
        </p>
        <div class={"text-center md:text-right text-xl"}>
          <a
          onClick={() => navigate("/")}
          className="px-6 py-3 underline text-neutral-950 text-right hover:text-blue-500 hover:cursor-pointer transition duration-300"
        >
          Back to Home
        </a>
        </div>
        
      </div>
    </div>
  );
};

export default NotFoundPage;
