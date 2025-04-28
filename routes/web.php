<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\TeacherController;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\ParentController;
use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\GradeController;
use App\Http\Controllers\TodoController;
use App\Http\Controllers\NewsController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\BehaviorNoteController;
use App\Http\Controllers\ClassController;
use App\Http\Controllers\SubjectController;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
*/

// Authentication Routes
Route::get('/', [AuthController::class, 'showLoginForm'])->name('login');
Route::post('/login', [AuthController::class, 'login'])->name('login.submit');
Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

// Protected Routes
Route::middleware(['auth'])->group(function () {
    // Admin Routes
    Route::middleware(['check.role:admin'])->prefix('admin')->group(function () {
        Route::get('/dashboard', [AdminController::class, 'dashboard'])->name('admin.dashboard');
        
        // User Management
        Route::resource('users', AdminController::class);
        Route::get('/users/create/{role}', [AdminController::class, 'createUser'])->name('users.create.role');
        
        // Class Management
        Route::resource('classes', ClassController::class);
        
        // Subject Management
        Route::resource('subjects', SubjectController::class);
        
        // News Management
        Route::resource('news', NewsController::class);
    });
    
    // Teacher Routes
    Route::middleware(['check.role:teacher'])->prefix('teacher')->group(function () {
        Route::get('/dashboard', [TeacherController::class, 'dashboard'])->name('teacher.dashboard');
        
        // Attendance Management
        Route::get('/attendance', [AttendanceController::class, 'index'])->name('teacher.attendance.index');
        Route::get('/attendance/class/{class}', [AttendanceController::class, 'showClass'])->name('teacher.attendance.class');
        Route::post('/attendance/save', [AttendanceController::class, 'save'])->name('teacher.attendance.save');
        
        // Grade Management
        Route::get('/grades', [GradeController::class, 'index'])->name('teacher.grades.index');
        Route::get('/grades/class/{class}', [GradeController::class, 'showClass'])->name('teacher.grades.class');
        Route::post('/grades/save', [GradeController::class, 'save'])->name('teacher.grades.save');
        
        // Behavior Notes
        Route::resource('behavior-notes', BehaviorNoteController::class);
        
        // Messages with Parents
        Route::get('/messages', [MessageController::class, 'teacherIndex'])->name('teacher.messages.index');
        Route::get('/messages/{parent}', [MessageController::class, 'showConversation'])->name('teacher.messages.show');
        Route::post('/messages/send', [MessageController::class, 'send'])->name('teacher.messages.send');
    });
    
    // Student Routes
    Route::middleware(['check.role:student'])->prefix('student')->group(function () {
        Route::get('/dashboard', [StudentController::class, 'dashboard'])->name('student.dashboard');
        
        // Todo List
        Route::resource('todos', TodoController::class);
        
        // View Grades
        Route::get('/grades', [StudentController::class, 'grades'])->name('student.grades');
        
        // View Attendance
        Route::get('/attendance', [StudentController::class, 'attendance'])->name('student.attendance');
        
        // View Subjects & Schedule
        Route::get('/subjects', [StudentController::class, 'subjects'])->name('student.subjects');
        
        // View News
        Route::get('/news', [StudentController::class, 'news'])->name('student.news');
        
        // View Behavior Notes
        Route::get('/behavior-notes', [StudentController::class, 'behaviorNotes'])->name('student.behavior-notes');
        
        // View Notifications
        Route::get('/notifications', [NotificationController::class, 'studentIndex'])->name('student.notifications');
    });
    
    // Parent Routes
    Route::middleware(['check.role:parent'])->prefix('parent')->group(function () {
        Route::get('/dashboard', [ParentController::class, 'dashboard'])->name('parent.dashboard');
        
        // View Child's Grades
        Route::get('/grades/{student?}', [ParentController::class, 'grades'])->name('parent.grades');
        
        // View Child's Attendance
        Route::get('/attendance/{student?}', [ParentController::class, 'attendance'])->name('parent.attendance');
        
        // View Child's Behavior Notes
        Route::get('/behavior-notes/{student?}', [ParentController::class, 'behaviorNotes'])->name('parent.behavior-notes');
        
        // View Child's Ranking
        Route::get('/ranking/{student?}', [ParentController::class, 'ranking'])->name('parent.ranking');
        
        // Messages with Teachers
        Route::get('/messages', [MessageController::class, 'parentIndex'])->name('parent.messages.index');
        Route::get('/messages/{teacher}', [MessageController::class, 'showConversation'])->name('parent.messages.show');
        Route::post('/messages/send', [MessageController::class, 'send'])->name('parent.messages.send');
        
        // View News
        Route::get('/news', [ParentController::class, 'news'])->name('parent.news');
        
        // View Notifications
        Route::get('/notifications', [NotificationController::class, 'parentIndex'])->name('parent.notifications');
    });
});
