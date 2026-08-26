export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
}

export interface Todo {
  id: string;
  userId: string;
  title: string;
  description: string;
  completed: boolean;
  deletedOn: Date | null;
  createdAt: Date;
}

export const users = new Map<string, User>();
export const todos = new Map<string, Todo>();
