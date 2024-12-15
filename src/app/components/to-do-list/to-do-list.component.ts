import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../auth.service';
import { Firestore, collection, query, where, getDocs,
  updateDoc, doc, deleteDoc } from '@angular/fire/firestore';
import { inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Timestamp, addDoc } from 'firebase/firestore';

@Component({
  selector: 'app-to-do-list',
  imports: [CommonModule, FormsModule],
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
  };

  ngOnInit(): void {
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
        if (taskData['due_date'] instanceof Timestamp) {
          taskData['due_date'] = taskData['due_date'].toDate();
        }
        taskData['isEditingName'] = false;
        this.showStatusOptions = false;
        taskData['status'] = taskData['status'];
        taskData['id'] = doc.id;
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
    // if the status buttons are not shown, show them
    if (!this.showStatusOptions) {
      this.showStatusOptions = true;
    } else {
      this.showStatusOptions = false;
    }
  }
  
  changeStatus(task: any, status: string) {
    console.log('Changing status for task:', task);
    if (!task) {
      console.error('Task is undefined');
      return;
    }
  
    task.status = status;
  
    this.showStatusOptions = false;
    this.toggleStatus(task);
  
    // firestore update
    this.updateTask(task);
    // refiltering
    this.filterTasks();
  }
  


  editDueDate(task: any) {
    task.isEditingDate = true;
  }
  
  updateTaskDueDate(task: any) {
    task.due_date = new Date(task.due_date); //make sure date is a Date type
    task.isEditingDate = false; // can't edit Date more
    this.updateTask(task);
  }

  selectDueDate(task: any) {
    const newDate = prompt('בחר תאריך יעד בפורמט: dd/MM/yyyy HH:mm:ss');
    if (newDate) {
      const date = new Date(newDate);
      if (!isNaN(date.getTime())) {
        task.due_date = date;
        this.updateTask(task);
      } else {
        alert('תאריך לא תקין');
      }
    }
  }

  cancelAddTask() {
    this.isAddingTask = false;
    this.newTask = { name: '', description: '', due_date: null, status: 'בהמתנה', user_pid: '' };
  }

  async deleteTask(taskId: string) {
    try {
      // delete a task by it's id
      await deleteDoc(doc(this.firestore, 'missions', taskId));
      // delete from the local list (from the UI)
      this.tasks = this.tasks.filter(task => task.id !== taskId);
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
  
      // new Firebase task
      const taskRef = await addDoc(collection(this.firestore, 'missions'), {
        name: this.newTask.name,
        description: this.newTask.description,
        due_date: this.newTask.due_date ? new Date(this.newTask.due_date) : null,
        status: this.newTask.status,
        user_pid: this.newTask.user_pid,
      });
  
      const newTask = { id: taskRef.id, ...this.newTask };
      this.tasks.push(newTask);
  
      if (this.selectedStatus === 'all' || newTask.status === this.selectedStatus) {
        this.filteredTasks.push(newTask);
      }
  
      this.isAddingTask = false;
      this.newTask = { name: '', description: '', due_date: null, status: 'בהמתנה', user_pid: '' };
  
    } catch (error) {
      console.error('Error adding task:', error);
    }
  }

  async updateTask(task: any) {
    try {
      if (!task || !task.id) {
        console.error('Task or task ID is undefined');
        return;
      }
  
      const updatedData: any = {};
  
      if (task.status) {
        updatedData.status = task.status;
      }
  
      if (task.description) {
        updatedData.description = task.description;
      }
  
      if (task.due_date) {
        updatedData.due_date = task.due_date;
      }
  
      // firestore update
      const taskDoc = doc(this.firestore, 'missions', task.id);
      await updateDoc(taskDoc, updatedData);
    } catch (error) {
      console.error('Error updating task:', error);
    }
  }  
}
