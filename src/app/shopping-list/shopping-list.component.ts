import { Component, OnInit } from '@angular/core';
import { ShoppingService } from '../services/shopping.service';
import { ShoppingItem } from '../models/shopping-item';
import { Observable } from 'rxjs';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NgForOf, NgIf, AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-shopping-list',
  templateUrl: './shopping-list.component.html',
  standalone: true,
  imports: [ReactiveFormsModule, NgForOf, NgIf, AsyncPipe],
  styleUrls: ['./shopping-list.component.css']
})
export class ShoppingListComponent implements OnInit {
  items$!: Observable<ShoppingItem[]>;
  form: FormGroup;
  editingId: string | null = null;

  constructor(private store: ShoppingService, private fb: FormBuilder) {
    this.form = this.fb.group({
      name: [''],
      quantity: [1]
    });
  }

  ngOnInit(): void {
    this.items$ = this.store.itemsObservable$;
    this.store.loadInitial();
  }

  async add() {
    const val = this.form.value;
    if (!val.name) return;
    // optimistic: clear form immediately
    this.form.reset({ name: '', quantity: 1 });
    try {
      // await this.store.create(val.name, val.quantity);
      this.store.addItem(val.name, val.quantity);
      // server broadcasts ItemAdded and store updates list automatically
    } catch (err) {
      console.error('Add failed', err);
      // consider reloading list or showing error
      this.store.loadInitial();
    }
  }

  startEdit(item: ShoppingItem) {
    this.editingId = item.id;
    this.form.setValue({ name: item.name, quantity: item.quantity });
  }

  async saveEdit() {
    if (!this.editingId) return;
    const val = this.form.value;
    try {
      await this.store.update({ id: this.editingId, name: val.name, quantity: val.quantity, done: false });
      this.editingId = null;
      this.form.reset({ name: '', quantity: 1 });
    } catch (err) {
      console.error('Update failed', err);
      this.store.loadInitial();
    }
  }

  cancelEdit() {
    this.editingId = null;
    this.form.reset({ name: '', quantity: 1 });
  }

  async toggleDone(item: ShoppingItem) {
    try {
      // await this.store.update({ ...item, done: !item.done });
      this.store.toggleItem(item.id);
    } catch (err) {
      console.error(err);
      this.store.loadInitial();
    }
  }

  async delete(id: string) {
    try {
      // await this.store.remove(id);
      this.store.removeItem(id);
    } catch (err) {
      console.error(err);
      this.store.loadInitial();
    }
  }
}
