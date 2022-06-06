import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import { Country } from 'src/app/home/classes/country';
import {Subscription} from "rxjs";
import {UserManagerService} from "../../services/user-manager.service";
import {DialogManagerService} from "../../../services/dialog-manager.service";
import {UserInfo} from "../../../classes/UserResponse";

@Component({
  selector: 'app-country',
  templateUrl: './country.component.html',
  styleUrls: ['./country.component.css']
})
export class CountryComponent implements OnInit, OnDestroy {
  /**Dati dell'utente da modificare*/
  @Input() userInfo: UserInfo;
  /**Evento di modifica dello user*/
  @Output() changeUserinfo: EventEmitter<UserInfo> = new EventEmitter<UserInfo>();

  /**Subscription della richiesta*/
  allCountriesSubscription: Subscription;
  /**Subscription della richiesta*/
  updateCountrySubscription: Subscription;

  /**Tutte le nazioni*/
  allCountries: Country[];
  /**Indice del country selezionato*/
  indexChecked: number = -1;

  constructor(
    private userService: UserManagerService,
    private dialogManager: DialogManagerService
  ) { }

  ngOnInit(): void {
    this.allCountries = [];
    this.indexChecked = -1;
    this.getAllCountries();
  }

  ngOnDestroy() {
    if (this.allCountriesSubscription != null) {
      this.allCountriesSubscription.unsubscribe();
    }
    if (this.updateCountrySubscription != null) {
      this.updateCountrySubscription.unsubscribe();
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
      if (this.userInfo.country != null) {
        this.indexChecked = this.allCountries.findIndex((item) => item._id === this.userInfo.country._id);
      }
      this.dialogManager.closeDialog();
    }, error => {
      this.dialogManager.closeDialog();
      // Mostra l'errore a video e riprova a eseguire l'azione
      this.dialogManager.showError(error.error.error, () => {
        this.getAllCountries();
      });
    })
  }

  /**
   * Cambia il country all'utente
   * @param {Number} index Indice della lista del nuovo country
   */
  onChangeCountry(index: number) {
    this.dialogManager.showLoading("Updating country...");
    const id = index === this.indexChecked ? null : this.allCountries[index]._id;
    this.updateCountrySubscription = this.userService.updateCountry(id).subscribe(res => {
      // Aggiorna i dati dell'utente
      this.userInfo = res.data;
      this.changeUserinfo.emit(res.data);
      // Modifica l'id per la selezione
      this.indexChecked = index === this.indexChecked ? -1 : index;
      this.dialogManager.closeDialog();
    }, error => {
      this.dialogManager.closeDialog();
      // Mostra l'errore a video e riprova a eseguire l'azione
      this.dialogManager.showError(error.error.error, () => {
        this.onChangeCountry(index);
      });
    });
  }

}
