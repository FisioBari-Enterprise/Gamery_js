import { Component, OnDestroy, OnInit } from '@angular/core';
import { Country } from 'src/app/home/classes/country';
import {Subscription} from "rxjs";
import {UserManagerService} from "../../services/user-manager.service";
import {DialogManagerService} from "../../../services/dialog-manager.service";

@Component({
  selector: 'app-country',
  templateUrl: './country.component.html',
  styleUrls: ['./country.component.css']
})
export class CountryComponent implements OnInit, OnDestroy {

  /**Subscription della richiesta*/
  allCountriesSubscription: Subscription;

  /**Tutte le nazioni*/
  allCountries: Country[];

  constructor(
    private userService: UserManagerService,
    private dialogManager: DialogManagerService
  ) { }

  ngOnInit(): void {
    this.allCountries = [];
    this.getAllCountries();
  }

  ngOnDestroy() {
    if (this.allCountriesSubscription != null) {
      this.allCountriesSubscription.unsubscribe();
    }
  }

  /**
   * Ottiene tutte le nazioni salvate nel server
   */
  getAllCountries() {
    this.dialogManager.showLoading("Updating all countries");
    this.allCountriesSubscription = this.userService.getAllCountries().subscribe(res => {
      // Salva tutti i country
      this.allCountries = res.data;
      this.dialogManager.closeDialog();
    }, error => {
      this.dialogManager.closeDialog();
      // Mostra l'errore a video e riprova a eseguire l'azione
      this.dialogManager.showError(error.error.error, () => {
        this.getAllCountries();
      });
    })
  }

}
