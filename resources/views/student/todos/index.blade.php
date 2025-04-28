@extends('layouts.student')

@section('title', 'My To-Do List')

@section('content')
<div class="container-fluid">
    <div class="row">
        <div class="col-md-12">
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h1>My To-Do List</h1>
                <a href="{{ route('todos.create') }}" class="btn btn-primary">
                    <i class="fas fa-plus"></i> Add New Task
                </a>
            </div>
            
            @if(session('success'))
                <div class="alert alert-success">
                    {{ session('success') }}
                </div>
            @endif
            
            <div class="card mb-4">
                <div class="card-header">
                    <i class="fas fa-tasks me-1"></i>
                    Pending Tasks
                </div>
                <div class="card-body">
                    @if($pendingTodos->count() > 0)
                        <div class="table-responsive">
                            <table class="table table-hover">
                                <thead>
                                    <tr>
                                        <th>Title</th>
                                        <th>Description</th>
                                        <th>Due Date</th>
                                        <th>Priority</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    @foreach($pendingTodos as $todo)
                                    <tr>
                                        <td>{{ $todo->title }}</td>
                                        <td>{{ Str::limit($todo->description, 50) }}</td>
                                        <td>
                                            {{ \Carbon\Carbon::parse($todo->due_date)->format('M d, Y') }}
                                            @if(\Carbon\Carbon::parse($todo->due_date)->isPast())
                                                <span class="badge bg-danger">Overdue</span>
                                            @elseif(\Carbon\Carbon::parse($todo->due_date)->isToday())
                                                <span class="badge bg-warning">Today</span>
                                            @elseif(\Carbon\Carbon::parse($todo->due_date)->isTomorrow())
                                                <span class="badge bg-info">Tomorrow</span>
                                            @endif
                                        </td>
                                        <td>
                                            @if($todo->priority == 'high')
                                                <span class="badge bg-danger">High</span>
                                            @elseif($todo->priority == 'medium')
                                                <span class="badge bg-warning">Medium</span>
                                            @else
                                                <span class="badge bg-info">Low</span>
                                            @endif
                                        </td>
                                        <td>
                                            <div class="btn-group" role="group">
                                                <form action="{{ route('todos.toggleComplete', $todo->id) }}" method="POST" class="d-inline">
                                                    @csrf
                                                    @method('PATCH')
                                                    <button type="submit" class="btn btn-sm btn-success" title="Mark as Completed">
                                                        <i class="fas fa-check"></i>
                                                    </button>
                                                </form>
                                                <a href="{{ route('todos.edit', $todo->id) }}" class="btn btn-sm btn-primary" title="Edit">
                                                    <i class="fas fa-edit"></i>
                                                </a>
                                                <form action="{{ route('todos.destroy', $todo->id) }}" method="POST" class="d-inline">
                                                    @csrf
                                                    @method('DELETE')
                                                    <button type="submit" class="btn btn-sm btn-danger" title="Delete" onclick="return confirm('Are you sure you want to delete this task?')">
                                                        <i class="fas fa-trash"></i>
                                                    </button>
                                                </form>
                                            </div>
                                        </td>
                                    </tr>
                                    @endforeach
                                </tbody>
                            </table>
                        </div>
                    @else
                        <p class="text-center">No pending tasks. <a href="{{ route('todos.create') }}">Create one now</a>.</p>
                    @endif
                </div>
            </div>
            
            <div class="card">
                <div class="card-header">
                    <i class="fas fa-check-circle me-1"></i>
                    Completed Tasks
                </div>
                <div class="card-body">
                    @if($completedTodos->count() > 0)
                        <div class="table-responsive">
                            <table class="table table-hover">
                                <thead>
                                    <tr>
                                        <th>Title</th>
                                        <th>Description</th>
                                        <th>Due Date</th>
                                        <th>Priority</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    @foreach($completedTodos as $todo)
                                    <tr class="table-success">
                                        <td><s>{{ $todo->title }}</s></td>
                                        <td><s>{{ Str::limit($todo->description, 50) }}</s></td>
                                        <td><s>{{ \Carbon\Carbon::parse($todo->due_date)->format('M d, Y') }}</s></td>
                                        <td>
                                            @if($todo->priority == 'high')
                                                <span class="badge bg-secondary">High</span>
                                            @elseif($todo->priority == 'medium')
                                                <span class="badge bg-secondary">Medium</span>
                                            @else
                                                <span class="badge bg-secondary">Low</span>
                                            @endif
                                        </td>
                                        <td>
                                            <div class="btn-group" role="group">
                                                <form action="{{ route('todos.toggleComplete', $todo->id) }}" method="POST" class="d-inline">
                                                    @csrf
                                                    @method('PATCH')
                                                    <button type="submit" class="btn btn-sm btn-warning" title="Mark as Pending">
                                                        <i class="fas fa-undo"></i>
                                                    </button>
                                                </form>
                                                <form action="{{ route('todos.destroy', $todo->id) }}" method="POST" class="d-inline">
                                                    @csrf
                                                    @method('DELETE')
                                                    <button type="submit" class="btn btn-sm btn-danger" title="Delete" onclick="return confirm('Are you sure you want to delete this task?')">
                                                        <i class="fas fa-trash"></i>
                                                    </button>
                                                </form>
                                            </div>
                                        </td>
                                    </tr>
                                    @endforeach
                                </tbody>
                            </table>
                        </div>
                    @else
                        <p class="text-center">No completed tasks yet.</p>
                    @endif
                </div>
            </div>
        </div>
    </div>
</div>
@endsection
