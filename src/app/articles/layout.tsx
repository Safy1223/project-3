import React, { ReactNode } from "react";
export const metadata = {
  title: "article page",
};
const layout = ({ children }: { children: ReactNode }) => {
  return (
    <div>
      <h1 className="bg-blue-300 mt-7 text-6xl">Articles</h1>
      {children}
    </div>
  );
};

export default layout;
