import { Component, OnInit, OnDestroy } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { SignalRService } from '../services/signalr.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {
  private hubConnection!: signalR.HubConnection;
  totalItems = 0;
  completedItems = 0;
  pendingItems = 0;

  /**
   *
   */
  constructor(private signalR: SignalRService) {


  }
  setupSignalRSubscriptions(): any {
    this.signalR.summaryUpdated$.subscribe(summary => {
      console.log(summary);

      this.totalItems = summary.total;
      this.completedItems = summary.completed;
      this.pendingItems = summary.pending;
    });
  }
  ngOnInit() {

    this.setupSignalRSubscriptions()
    this.signalR.startConnection()
      .then(() => this.setupSignalRSubscriptions())
      .catch(e => console.warn('SignalR start failed', e));
  }

  ngOnDestroy() {
    this.hubConnection.stop();
  }
}
