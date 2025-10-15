import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ShoppingItem } from '../models/shopping-item';
import { Observable, BehaviorSubject } from 'rxjs';
import { SignalRService } from './signalr.service';

@Injectable({ providedIn: 'root' })
export class ShoppingService {
  private apiRoot = 'https://shoppingrealtime-api.onrender.com'; // adjust to your backend
  private items$ = new BehaviorSubject<ShoppingItem[]>([]);
  itemsObservable$ = this.items$.asObservable();

  constructor(private http: HttpClient, private signalR: SignalRService) {
    // initialize SignalR and subscribe to events
    this.signalR.startConnection(this.apiUrl())
      .then(() => this.setupSignalRSubscriptions())
      .catch(e => console.warn('SignalR start failed', e));
  }

  private apiUrl() {
    return this.apiRoot;
  }

  loadInitial() {
    this.http.get<ShoppingItem[]>(`${this.apiRoot}/api/shopping`).subscribe(items => {
      this.items$.next(items);
    }, err => console.error(err));
  }

  create(name: string, qty: number) {
    const dto = { name, quantity: qty };
    return this.http.post<ShoppingItem>(`${this.apiRoot}/api/shopping`, dto).toPromise();
  }

  update(item: ShoppingItem) {
    const dto = { id: item.id, name: item.name, quantity: item.quantity, done: item.done };
    return this.http.put<ShoppingItem>(`${this.apiRoot}/api/shopping/${item.id}`, dto).toPromise();
  }

  remove(id: string) {
    return this.http.delete(`${this.apiRoot}/api/shopping/${id}`).toPromise();
  }

  private setupSignalRSubscriptions() {
    this.signalR.itemAdded$.subscribe(item => {
      const arr = [...this.items$.value, item];
      this.items$.next(arr);
    });

    this.signalR.itemUpdated$.subscribe(updated => {
      const arr = this.items$.value.map(i => i.id === updated.id ? updated : i);
      this.items$.next(arr);
    });

    this.signalR.itemRemoved$.subscribe(id => {
      const arr = this.items$.value.filter(i => i.id !== id);
      this.items$.next(arr);
    });
  }

  addItem(name: string, qty: number) {
    if (!this.signalR.hubConnection) {
      console.error('Hub connection not established!');
      return;
    }
    this.signalR.hubConnection.invoke('AddItem', name, qty)
      .catch(err => console.error('AddItem failed', err));
  }

  toggleItem(id: string) {
    if (!this.signalR.hubConnection) {
      console.error('Hub connection not established!');
      return;
    }
    this.signalR.hubConnection.invoke('ToggleItem', id)
      .catch(err => console.error('ToggleItem failed', err));
  }

  removeItem(id: string) {
    if (!this.signalR.hubConnection) {
      console.error('Hub connection not established!');
      return;
    }
    this.signalR.hubConnection.invoke('RemoveItem', id)
      .catch(err => console.error('RemoveItem failed', err));
  }
}
