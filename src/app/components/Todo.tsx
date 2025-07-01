"use client";
import React, { useEffect, useState } from "react";
interface Todo {
  userId: number;
  id: number;
  title: string;
  completed: boolean;
}
const Todo = () => {
  const [todo, SetTodo] = useState<Todo | null>(null);
  useEffect(() => {
    const fetchTodo = async () => {
      const response = await fetch(
        "https://jsonplaceholder.typicode.com/todos/1"
      );
      const result = await response.json();
      SetTodo(result);
    };
    fetchTodo();
  }, []);
  return <div>{todo?.title}</div>;
};

export default Todo;
