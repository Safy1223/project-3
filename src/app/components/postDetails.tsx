import React from "react";

const PostDetails = async ({ postId }: { postId: string }) => {
  const response = await fetch(
    `https://jsonplaceholder.typicode.com/posts/${postId}`,
    {
      next: {
        revalidate: 120,
      },
    }
  );
  const post = await response.json();
  return (
    <>
      <h1>{post.title}</h1>
      <p>{post.body}</p>
    </>
  );
};

export default PostDetails;
