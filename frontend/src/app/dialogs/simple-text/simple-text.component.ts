import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {Router} from "@angular/router";

@Component({
  selector: 'app-simple-text',
  templateUrl: './simple-text.component.html',
  styleUrls: ['./simple-text.component.css']
})
export class SimpleTextComponent implements OnInit, OnDestroy {

  message : string = ""

  constructor(
    private router : Router,
    public dialogRef: MatDialogRef<SimpleTextComponent>,
    @Inject(MAT_DIALOG_DATA) public data: string
  ) {
  }

  ngOnInit(): void {
    this.message = this.data;
  }

  ngOnDestroy() {
    this.router.navigateByUrl('home');
  }

  close(){
    this.dialogRef.close();
  }
}
