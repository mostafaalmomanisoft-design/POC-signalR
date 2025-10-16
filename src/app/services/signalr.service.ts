import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { Subject, Observable } from 'rxjs';
import { ShoppingItem } from '../models/shopping-item';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SignalRService {
  public hubConnection?: signalR.HubConnection;

  private itemAddedSource = new Subject<ShoppingItem>();
  itemAdded$ = this.itemAddedSource.asObservable();

  private itemUpdatedSource = new Subject<ShoppingItem>();
  itemUpdated$ = this.itemUpdatedSource.asObservable();

  private itemRemovedSource = new Subject<string>(); // id
  itemRemoved$ = this.itemRemovedSource.asObservable();

  private summaryUpdatedSource = new Subject<{ total: number; completed: number; pending: number }>();
  summaryUpdated$ = this.summaryUpdatedSource.asObservable();

  startConnection() {
    const hubUrl = environment.hubUrl; // e.g. http://localhost:5000/hubs/shopping
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl, {
        accessTokenFactory: () => localStorage.getItem('token') || '',
        transport: signalR.HttpTransportType.WebSockets
      })
      .withAutomaticReconnect()
      .build();


    this.hubConnection.onreconnecting(error => {
      console.warn('SignalR reconnecting', error);
    });
    this.hubConnection.onreconnected(connectionId => {
      console.log('SignalR reconnected', connectionId);
    });
    this.hubConnection.onclose(() => {
      console.warn('SignalR disconnected');
    });

    // incoming events - names must match server calls
    this.hubConnection.on('ItemAdded', (item: ShoppingItem) => this.itemAddedSource.next(item));
    this.hubConnection.on('ItemUpdated', (item: ShoppingItem) => this.itemUpdatedSource.next(item));
    this.hubConnection.on('ItemRemoved', (id: string) => this.itemRemovedSource.next(id));
    this.hubConnection.on('SummaryUpdated', (summary: { total: number; completed: number; pending: number }) => {
      this.summaryUpdatedSource.next(summary);
    });

    return this.hubConnection.start()
      .then(() => {
        console.log('SignalR connected');
        this.InvokedAll(); // call summary via service
      })
      .catch(err => console.error('SignalR connection error', err));
  }

  stopConnection() {
    return this.hubConnection?.stop();
  }
  InvokedAll() {
    if (!this.hubConnection) return;
    this.hubConnection.invoke('GetSummary')
      .catch(err => console.error('GetSummary invoke failed', err));
  }
}
