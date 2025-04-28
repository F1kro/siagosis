@extends('layouts.student')

@section('title', 'Student Dashboard')

@section('content')
<div class="container-fluid">
    <div class="row">
        <div class="col-md-12">
            <h1 class="mb-4">Student Dashboard</h1>
            <p class="text-muted">Welcome back, {{ $student->user->name }}!</p>
        </div>
    </div>
    
    <div class="row">
        <div class="col-md-8">
            <div class="card mb-4">
                <div class="card-header">
                    <i class="fas fa-tasks me-1"></i>
                    Upcoming Tasks
                </div>
                <div class="card-body">
                    @if($upcomingTodos->count() > 0)
                        <div class="table-responsive">
                            <table class="table">
                                <thead>
                                    <tr>
                                        <th>Title</th>
                                        <th>Due Date</th>
                                        <th>Priority</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    @foreach($upcomingTodos as $todo)
                                    <tr>
                                        <td>{{ $todo->title }}</td>
                                        <td>{{ \Carbon\Carbon::parse($todo->due_date)->format('M d, Y') }}</td>
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
                                            <a href="{{ route('todos.edit', $todo->id) }}" class="btn btn-sm btn-primary">Edit</a>
                                        </td>
                                    </tr>
                                    @endforeach
                                </tbody>
                            </table>
                        </div>
                    @else
                        <p class="text-center">No upcoming tasks. <a href="{{ route('todos.create') }}">Create one now</a>.</p>
                    @endif
                </div>
                <div class="card-footer">
                    <a href="{{ route('todos.index') }}" class="btn btn-primary btn-sm">View All Tasks</a>
                </div>
            </div>
            
            <div class="row">
                <div class="col-md-6">
                    <div class="card mb-4">
                        <div class="card-header">
                            <i class="fas fa-graduation-cap me-1"></i>
                            Recent Grades
                        </div>
                        <div class="card-body">
                            @if($recentGrades->count() > 0)
                                <div class="table-responsive">
                                    <table class="table">
                                        <thead>
                                            <tr>
                                                <th>Subject</th>
                                                <th>Type</th>
                                                <th>Value</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            @foreach($recentGrades as $grade)
                                            <tr>
                                                <td>{{ $grade->subject->name }}</td>
                                                <td>{{ $grade->type }}</td>
                                                <td>{{ $grade->value }}</td>
                                            </tr>
                                            @endforeach
                                        </tbody>
                                    </table>
                                </div>
                            @else
                                <p class="text-center">No grades available.</p>
                            @endif
                        </div>
                        <div class="card-footer">
                            <a href="{{ route('student.grades') }}" class="btn btn-primary btn-sm">View All Grades</a>
                        </div>
                    </div>
                </div>
                
                <div class="col-md-6">
                    <div class="card mb-4">
                        <div class="card-header">
                            <i class="fas fa-calendar-check me-1"></i>
                            Recent Attendance
                        </div>
                        <div class="card-body">
                            @if($recentAttendance->count() > 0)
                                <div class="table-responsive">
                                    <table class="table">
                                        <thead>
                                            <tr>
                                                <th>Date</th>
                                                <th>Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            @foreach($recentAttendance as $attendance)
                                            <tr>
                                                <td>{{ \Carbon\Carbon::parse($attendance->date)->format('M d, Y') }}</td>
                                                <td>
                                                    @if($attendance->status == 'present')
                                                        <span class="badge bg-success">Present</span>
                                                    @elseif($attendance->status == 'absent')
                                                        <span class="badge bg-danger">Absent</span>
                                                    @else
                                                        <span class="badge bg-warning">Late</span>
                                                    @endif
                                                </td>
                                            </tr>
                                            @endforeach
                                        </tbody>
                                    </table>
                                </div>
                            @else
                                <p class="text-center">No attendance records available.</p>
                            @endif
                        </div>
                        <div class="card-footer">
                            <a href="{{ route('student.attendance') }}" class="btn btn-primary btn-sm">View All Attendance</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="col-md-4">
            <div class="card mb-4">
                <div class="card-header">
                    <i class="fas fa-user me-1"></i>
                    Student Information
                </div>
                <div class="card-body">
                    <p><strong>Name:</strong> {{ $student->user->name }}</p>
                    <p><strong>NIS:</strong> {{ $student->nis }}</p>
                    <p><strong>Class:</strong> {{ $student->class->name }}</p>
                    <p><strong>Gender:</strong> {{ ucfirst($student->gender) }}</p>
                    <p><strong>Religion:</strong> {{ $student->religion }}</p>
                    <p><strong>Address:</strong> {{ $student->address }}</p>
                </div>
            </div>
            
            <div class="card mb-4">
                <div class="card-header">
                    <i class="fas fa-newspaper me-1"></i>
                    Recent News
                </div>
                <div class="card-body">
                    @if($recentNews->count() > 0)
                        <ul class="list-group list-group-flush">
                            @foreach($recentNews as $news)
                            <li class="list-group-item">
                                <h6>{{ $news->title }}</h6>
                                <p class="text-muted small">{{ $news->created_at->format('M d, Y') }}</p>
                                <p>{{ Str::limit($news->content, 100) }}</p>
                                <a href="{{ route('student.news') }}" class="btn btn-sm btn-link p-0">Read more</a>
                            </li>
                            @endforeach
                        </ul>
                    @else
                        <p class="text-center">No news available.</p>
                    @endif
                </div>
                <div class="card-footer">
                    <a href="{{ route('student.news') }}" class="btn btn-primary btn-sm">View All News</a>
                </div>
            </div>
            
            <div class="card mb-4">
                <div class="card-header">
                    <i class="fas fa-comments me-1"></i>
                    Behavior Notes
                </div>
                <div class="card-body">
                    @if($recentBehaviorNotes->count() > 0)
                        <ul class="list-group list-group-flush">
                            @foreach($recentBehaviorNotes as $note)
                            <li class="list-group-item">
                                <h6>{{ $note->title }}</h6>
                                <p class="text-muted small">{{ $note->created_at->format('M d, Y') }} by {{ $note->teacher->user->name }}</p>
                                <p>{{ Str::limit($note->description, 100) }}</p>
                            </li>
                            @endforeach
                        </ul>
                    @else
                        <p class="text-center">No behavior notes available.</p>
                    @endif
                </div>
                <div class="card-footer">
                    <a href="{{ route('student.behavior-notes') }}" class="btn btn-primary btn-sm">View All Notes</a>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection
