import React from "react";
type PageProps = {
  params: {
    title: string;
  };
};
const ShowArticlePage = ({ params }: PageProps) => {
  return (
    <div>
      <h1>ShowArticlePage</h1>
      <h2>{params.title}</h2>
    </div>
  );
};

export default ShowArticlePage;
