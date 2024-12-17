import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../auth.service';
import { Firestore, collection, query, where, getDocs,
  updateDoc, doc, deleteDoc } from '@angular/fire/firestore';
import { inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Timestamp, addDoc } from 'firebase/firestore';
import { MatListModule } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core'; 

@Component({
  selector: 'app-to-do-list',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    MatListModule, 
    MatCardModule, 
    MatButtonModule, 
    MatIconModule, 
    MatChipsModule, 
    MatFormFieldModule, 
    MatInputModule, 
    MatSelectModule,
    MatDialogModule,
    MatExpansionModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  templateUrl: './to-do-list.component.html',
  styleUrls: ['./to-do-list.component.scss']
})
export class ToDoListComponent implements OnInit {
  selectedStatus: string = 'all';
  authService = inject(AuthService);
  firestore = inject(Firestore);
  filteredTasks: any[] = [];
  showStatusOptions = false;
  tasks: any[] = [];
  isAddingTask = false;  
  newTask: any = {       
    name: '',
    description: '',
    due_date: null,
    status: 'בהמתנה',   
    user_pid: '',
    time_zone: ''
  };

  hours: number[] = Array.from({ length: 24 }, (_, i) => i); 
  minutes: number[] = Array.from({ length: 60 }, (_, i) => i); 
  seconds: number[] = Array.from({ length: 60 }, (_, i) => i); 

  ngOnInit(): void {
    const now = new Date();

    this.newTask.due_hours = 0; 
    this.newTask.due_minutes = 0; 
    this.newTask.due_seconds = 0; 

    this.authService.user$.subscribe(user => {
      if (user) {
        this.loadUserTasks(user.uid);
        this.newTask.user_pid = user.uid;
      }
    });
  }
  

  async loadUserTasks(userId: string) {
    try {
      const q = query(collection(this.firestore, 'missions'), where('user_pid', '==', userId));
      const querySnapshot = await getDocs(q);
  
      this.tasks = querySnapshot.docs.map(doc => {
        const taskData = doc.data();
  
        // המרת תאריך יעד אם הוא ב- Timestamp
        if (taskData['due_date'] instanceof Timestamp) {
          taskData['due_date'] = taskData['due_date'].toDate();
        } else if (typeof taskData['due_date'] === 'string') {
          taskData['due_date'] = new Date(taskData['due_date']); // המרה אם מדובר במחרוזת
        }
  
        // עדכון ערכי זמן (שעה, דקה, שנייה)
        taskData['due_hours'] = taskData['due_date'].getHours();
        taskData['due_minutes'] = taskData['due_date'].getMinutes();
        taskData['due_seconds'] = taskData['due_date'].getSeconds();
  
        taskData['isEditingName'] = false;
        taskData['status'] = taskData['status'];
        taskData['id'] = doc.id;

        taskData['time_zone'] = taskData['time_zone'] || Intl.DateTimeFormat().resolvedOptions().timeZone;
        return taskData;
      });
  
      this.filterTasks();
  
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  }  

  filterTasks() {
    if (this.selectedStatus === 'all') {
      this.filteredTasks = [...this.tasks]; // show all tasks
    } else {
      this.filteredTasks = this.tasks.filter(task => task.status === this.selectedStatus);
    }
  }

  addTask() {
    console.log(`Adding task`)
    this.isAddingTask = true;
  }

  editTaskName(task: any) {
    task.isEditingName = true;
  }

  saveTaskName(task: any) {
    task.isEditingName = false;
    this.updateTask(task);
  }

  updateTaskDescription(task: any, event: any) {
    task.description = event.target.innerText;
    this.updateTask(task);
  }

  toggleStatus(task: any) {
    if (!this.showStatusOptions) {
      this.showStatusOptions = true;
    } else {
      this.showStatusOptions = false;
    }
  }
  
  changeStatus(task: any, status: string) {
    if (!task) {
      console.error('Task is undefined');
      return;
    }
  
    task.status = status;
  
    this.showStatusOptions = false;
    this.toggleStatus(task);
  
    this.updateTask(task);
    this.filterTasks();
  }

  cancelAddTask() {
    this.isAddingTask = false;
    this.newTask = { name: '', description: '', due_date: null, status: 'בהמתנה', user_pid: '' };
  }

  onDateChange(task: any) {
    if (task.due_date && task.due_hours != null && task.due_minutes != null && task.due_seconds != null) {
      const dueDate = new Date(task.due_date);
      dueDate.setHours(task.due_hours);
      dueDate.setMinutes(task.due_minutes);
      dueDate.setSeconds(task.due_seconds);
      task.due_date = dueDate;
    }
    this.updateTask(task);
  }
  
  onTimeChange(task: any) {
    if (task.due_date && task.due_hours != null && task.due_minutes != null && task.due_seconds != null) {
      const dueDate = new Date(task.due_date);
      dueDate.setHours(task.due_hours);   
      dueDate.setMinutes(task.due_minutes); 
      dueDate.setSeconds(task.due_seconds); 
      task.due_date = dueDate;  
      this.updateTask(task); 
    }
  }  
  

  async deleteTask(taskId: string) {
    try {
      await deleteDoc(doc(this.firestore, 'missions', taskId));
      this.tasks = this.tasks.filter(task => task.id !== taskId);
      this.authService.user$.subscribe(user => {
        if (user) {
          this.loadUserTasks(user.uid);
          this.newTask.user_pid = user.uid;
        }
      });
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  }

  async saveNewTask() {
    try {
      if (!this.newTask.name || !this.newTask.description) {
        alert('נא למלא את כל השדות');
        return;
      }
  
      if (this.newTask.due_date && this.newTask.due_hours != null && this.newTask.due_minutes != null && this.newTask.due_seconds != null) {
        const dueDate = new Date(this.newTask.due_date);
        dueDate.setHours(this.newTask.due_hours);
        dueDate.setMinutes(this.newTask.due_minutes);
        dueDate.setSeconds(this.newTask.due_seconds);
        this.newTask.due_date = dueDate;
      }
      
      const userTimeZone = this.newTask.time_zone || Intl.DateTimeFormat().resolvedOptions().timeZone;
  
      const taskRef = await addDoc(collection(this.firestore, 'missions'), {
        name: this.newTask.name,
        description: this.newTask.description,
        due_date: this.newTask.due_date ? new Date(this.newTask.due_date) : null,
        status: this.newTask.status,
        user_pid: this.newTask.user_pid,
        time_zone: userTimeZone, 
      });
  
      const newTask = { id: taskRef.id, ...this.newTask };
      this.tasks.push(newTask);
  
      if (this.selectedStatus === 'all' || newTask.status === this.selectedStatus) {
        this.filteredTasks.push(newTask);
      }
  
      this.isAddingTask = false;
      this.newTask = { name: '', description: '', due_date: null, status: 'בהמתנה', user_pid: '', due_hours: null, due_minutes: null, due_seconds: null };
  
    } catch (error) {
      console.error('Error adding task:', error);
    }
  }

  async updateTask(task: any) {
    try {
      const taskDoc = doc(this.firestore, 'missions', task.id);
      const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  
      const updatedData: any = {
        name: task.name,
        description: task.description,
        status: task.status,
        due_date: task.due_date ? new Date(task.due_date) : null, // שימוש בオブייקט Date חדש
        time_zone: task.time_zone || userTimeZone,
      };
  
      await updateDoc(taskDoc, updatedData);
    } catch (error) {
      console.error('Error updating task:', error);
    }
  }
}
