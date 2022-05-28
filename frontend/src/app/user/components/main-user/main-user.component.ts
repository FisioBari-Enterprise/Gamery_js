import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {UserInfo} from "../../../classes/UserResponse";

@Component({
  selector: 'app-main-user',
  templateUrl: './main-user.component.html',
  styleUrls: ['./main-user.component.css']
})
export class MainUserComponent implements OnInit, OnDestroy {

  firstCharUsername : string = "_"

  user : UserInfo

  constructor(
    public dialogRef: MatDialogRef<MainUserComponent>,
    @Inject(MAT_DIALOG_DATA) public data: UserInfo
  ) { }

  ngOnInit(): void {
    this.user = this.data
  }

  ngOnDestroy() {
    this.dialogRef.close();
  }

}
