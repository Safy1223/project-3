import Link from "next/link";
import Todo from "../components/Todo";
export default async function PostsPage() {
  //لما تكون البيانات تتغير كل فترة //ISR – خزّن مؤقتًا //next: { revalidate: 60 }
  const response = await fetch("https://jsonplaceholder.typicode.com/posts", {
    next: {
      revalidate: 120,
    },
  });

  //لما تكون البيانات حساسة أو تتغير باستمرار // SSR – لا تخزن أبدًا //cache: "no-store"

  // const response = await fetch("https://jsonplaceholder.typicode.com/todos/1", {
  //   cache: "no-store",
  // });

  // cache: "force-cache" (default) // (SSG)لما تكون البيانات ثابتة //خزن الطلب بشكل دائم
  // const response = await fetch("https://jsonplaceholder.typicode.com/todos/1", {
  //   cache: "force-cache",
  // });
  type PostType = {
    userId: number;
    id: number;
    title: string;
    body: string;
  };

  const posts: PostType[] = await response.json();
  console.log(posts);

  return (
    <>
      <h1>Posts Page</h1>

      {posts.map((post) => (
        <Link href={`/Posts/${post.id}`} key={post.id}>
          <div className="mb-4 border-b pb-2">
            <h2 className="text-xl font-bold">{post.title}</h2>
            <p>{post.body}</p>
          </div>
        </Link>
      ))}
    </>
  );
}
