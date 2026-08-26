import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/api/auth";
import { fetchAPI } from "@/api/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2 } from "lucide-react";

interface Todo {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  deletedOn: string | null;
  createdAt: string;
}

export function Todos() {
  const { user, logout } = useAuth();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchTodos = useCallback(async () => {
    try {
      const data = await fetchAPI<Todo[]>("/api/todos");
      setTodos(data);
    } catch(err) {
      console.log("Error in fetching todos", err); 
    }
  }, []);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  const addTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    setLoading(true);
    try {
      const newTodo = await fetchAPI<Todo>("/api/todos", {
        method: "POST",
        body: { title: trimmed },
      });
      setTodos((prev) => [...prev, newTodo]);
      setTitle("");
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const toggleTodo = async (id: string) => {
    const updated = await fetchAPI<Todo>(`/api/todos/${id}/toggle`, { method: "PATCH" });
    setTodos((prev) => prev.map((t) => (t.id === id ? updated : t)));
  };

  const deleteTodo = async (id: string) => {
    await fetchAPI(`/api/todos/${id}`, { method: "DELETE" });
    setTodos((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold">My Todos</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">{user?.name}</span>
          <Button variant="ghost" size="sm" onClick={logout}>
            Logout
          </Button>
        </div>
      </div>

      <form onSubmit={addTodo} className="flex gap-2 mb-6">
        <Input
          placeholder="What needs to be done?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={loading}
        />
        <Button type="submit" disabled={loading || !title.trim()}>
          Add
        </Button>
      </form>

      <div className="flex flex-col gap-2">
        {todos.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">
            No todos yet. Add one above.
          </p>
        )}
        {todos.map((todo) => (
          <Card key={todo.id} className="py-0 shadow-sm">
            <CardContent className="flex items-center gap-3 py-3">
              <Checkbox
                checked={todo.completed}
                onCheckedChange={() => toggleTodo(todo.id)}
              />
              <span className={`flex-1 text-sm ${todo.completed ? "line-through text-muted-foreground" : ""}`}>
                {todo.title}
              </span>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => deleteTodo(todo.id)}
              >
                <Trash2 className="size-4" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
