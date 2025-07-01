import React, { Suspense } from "react";
import PostDetails from "@/app/components/postDetails";
type PageProps = {
  params: {
    postId: string;
  };
};

const Page = async (props: PageProps) => {
  const loadingJsx = (
    <div>
      <h1>Loading....</h1>
    </div>
  );
  const { postId } = props.params;
  return (
    <>
      <h1>Post Details</h1>
      <Suspense fallback={loadingJsx}>
        <PostDetails postId={postId} />
      </Suspense>
    </>
  );
};

export default Page;
