"use client";

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import TaskCard from '@/components/TaskCard';
import { Task } from '@/types';
import { Plus, Search, Loader2, LogOut, CheckCircle2, ListTodo, ClipboardList } from 'lucide-react';
import toast from 'react-hot-toast';
import AddTaskModal from '@/components/AddTaskModal';

// Shadcn UI Imports
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardPage() {
    const { logout } = useAuth();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('all'); // Changed default to 'all' for Shadcn Select
    const [page, setPage] = useState(1);

    const fetchTasks = useCallback(async () => {
        setLoading(true);
        try {
            const apiStatus = status === 'all' ? '' : status;
            const response = await api.get('/tasks', {
                params: { search, status: apiStatus, page, limit: 10 }
            });
            setTasks(response.data);
        } catch (error) {
            toast.error("Failed to load tasks");
        } finally {
            setLoading(false);
        }
    }, [search, status, page]);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchTasks();
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [fetchTasks]);

    // Derived stats for the summary cards
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'DONE').length;

    return (
        <div className="min-h-screen bg-slate-50/50 text-slate-900">
            {/* Navbar */}
            <nav className="sticky top-0 z-40 w-full border-b bg-white/80 backdrop-blur-md px-6 py-3 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <div className="bg-blue-600 p-1.5 rounded-lg">
                        <ClipboardList className="text-white" size={20} />
                    </div>
                    <h1 className="text-xl font-bold tracking-tight">TaskFlow</h1>
                </div>
                <Button variant="ghost" size="sm" onClick={logout} className="text-slate-500 hover:text-red-600">
                    <LogOut className="mr-2 h-4 w-4" /> Logout
                </Button>
            </nav>

            <main className="max-w-5xl mx-auto p-6 space-y-8">

                {/* Stats Summary Section */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-sm font-medium text-slate-500">Total Tasks</CardTitle>
                            <ListTodo className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totalTasks}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-sm font-medium text-slate-500">Completed</CardTitle>
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{completedTasks}</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-blue-600 border-none">
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 text-white/80">
                            <CardTitle className="text-sm font-medium">Quick Action</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Button onClick={() => setIsModalOpen(true)} variant="secondary" className="w-full font-bold">
                                <Plus className="mr-2 h-4 w-4" /> Create New
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters Bar */}
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <Input
                            placeholder="Search tasks..."
                            className="pl-10 bg-white"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <Select value={status} onValueChange={(val) => { setPage(1); setStatus(val); }}>
                        <SelectTrigger className="w-full md:w-[180px] bg-white">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Tasks</SelectItem>
                            <SelectItem value="TODO">To Do</SelectItem>
                            <SelectItem value="DONE">Done</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Task List Section */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold tracking-tight">Your Tasks</h2>
                        <p className="text-sm text-slate-500">Showing page {page}</p>
                    </div>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 space-y-4">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                            <p className="text-slate-500 text-sm italic">Syncing with server...</p>
                        </div>
                    ) : (
                        <div className="grid gap-3">
                            {tasks.length > 0 ? (
                                tasks.map(task => (
                                    <TaskCard key={task.id} task={task} onRefresh={fetchTasks} />
                                ))
                            ) : (
                                <Card className="border-dashed">
                                    <CardContent className="flex flex-col items-center justify-center py-12 text-slate-400">
                                        <ClipboardList size={40} className="mb-4 opacity-20" />
                                        <p>No tasks found matching your criteria.</p>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    )}
                </div>

                {/* Pagination Controls */}
                <div className="flex items-center justify-center space-x-2 py-4">
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={page === 1}
                        onClick={() => setPage(p => p - 1)}
                    >
                        Previous
                    </Button>
                    <div className="text-sm font-medium bg-white px-4 py-2 border rounded-md">
                        {page}
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={tasks.length < 10}
                        onClick={() => setPage(p => p + 1)}
                    >
                        Next
                    </Button>
                </div>

                <AddTaskModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onRefresh={() => fetchTasks()}
                />
            </main>
        </div>
    );
}