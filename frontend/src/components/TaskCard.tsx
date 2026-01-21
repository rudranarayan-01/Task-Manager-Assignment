"use client";

import { useState } from 'react';
import { Task } from '@/types';
import { Trash2, CheckCircle, Circle, Pencil, X, Check } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface TaskCardProps {
    task: Task;
    onRefresh: () => void;
}

export default function TaskCard({ task, onRefresh }: TaskCardProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState(task.title);
    // NEW: State for description editing
    const [editDescription, setEditDescription] = useState(task.description || '');

    const toggleStatus = async () => {
        try {
            await api.patch(`/tasks/${task.id}`, {
                status: task.status === 'DONE' ? 'TODO' : 'DONE'
            });
            onRefresh();
            toast.success("Status updated");
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    const handleUpdate = async () => {
        if (!editTitle.trim()) return toast.error("Title cannot be empty");
        try {
            // Sending both title and description to the backend
            await api.patch(`/tasks/${task.id}`, {
                title: editTitle,
                description: editDescription
            });
            setIsEditing(false);
            onRefresh();
            toast.success("Task updated");
        } catch (error) {
            toast.error("Update failed");
        }
    };

    const deleteTask = async () => {
        if (!confirm("Delete this task?")) return;
        try {
            await api.delete(`/tasks/${task.id}`);
            onRefresh();
            toast.success("Task deleted");
        } catch (error) {
            toast.error("Delete failed");
        }
    };

    return (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex items-start justify-between group hover:border-blue-300 transition-all">
            <div className="flex items-start gap-4 flex-1">
                <button onClick={toggleStatus} className="mt-1 shrink-0">
                    {task.status === 'DONE' ?
                        <CheckCircle className="text-green-500 w-6 h-6" /> :
                        <Circle className="text-gray-300 w-6 h-6" />
                    }
                </button>

                {isEditing ? (
                    <div className="flex-1 space-y-2">
                        <input
                            className="w-full border-b-2 border-blue-500 outline-none py-1 text-black font-medium bg-blue-50/30 px-1"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            placeholder="Task Title"
                            autoFocus
                        />
                        <textarea
                            className="w-full border border-gray-200 rounded-lg p-2 text-sm text-gray-700 outline-none focus:border-blue-400 resize-none"
                            value={editDescription}
                            onChange={(e) => setEditDescription(e.target.value)}
                            placeholder="Add description..."
                            rows={2}
                        />
                    </div>
                ) : (
                    <div className="flex-1 overflow-hidden">
                        <h3 className={`font-medium text-black transition-all ${task.status === 'DONE' ? 'line-through text-gray-400' : ''}`}>
                            {task.title}
                        </h3>
                        <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">
                            {task.description || "No description provided"}
                        </p>
                    </div>
                )}
            </div>

            <div className="flex items-center gap-1 ml-4 shrink-0">
                {isEditing ? (
                    <>
                        <button onClick={handleUpdate} className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                            <Check size={20} />
                        </button>
                        <button
                            onClick={() => {
                                setIsEditing(false);
                                setEditTitle(task.title);
                                setEditDescription(task.description || '');
                            }}
                            className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg"
                        >
                            <X size={20} />
                        </button>
                    </>
                ) : (
                    <>
                        <button
                            onClick={() => setIsEditing(true)}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                        >
                            <Pencil size={18} />
                        </button>
                        <button
                            onClick={deleteTask}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                        >
                            <Trash2 size={18} />
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}