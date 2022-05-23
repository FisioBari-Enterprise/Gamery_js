import { Injectable } from '@angular/core';
import {ComponentType} from "@angular/cdk/overlay";
import {LoadingComponent} from "../dialogs/loading/loading.component";
import {MatDialog, MatDialogRef} from "@angular/material/dialog";
import {ErrorComponent} from "../dialogs/error/error.component";

@Injectable({
  providedIn: 'root'
})
export class DialogManagerService {

  /**Dialog attivo in questo momento*/
  dialogRef: MatDialogRef<unknown, any> | null = null

  constructor(
    private dialog: MatDialog
  ) { }

  /**
   * Mostra un dialog a schermo
   * @param component Componente da mostrare
   * @param afterClose Funzione da eseguire con i dati ritornati dal component
   * @param config Configurazione da passare al dialog.open
   */
  showDialog(component: ComponentType<unknown>, afterClose, config: any = {height: '400px', width: '600px'}) {
    this.dialogRef = this.dialog.open(component,config);
    this.dialogRef.afterClosed().subscribe(res => afterClose(res));
  }

  /**
   * Chiude il dialog attivo
   */
  closeDialog() {
    this.dialogRef?.close()
  }

  /**
   * Mostra la view di login
   */
  showLoading(titleLoading: string) {
    this.showDialog(LoadingComponent, (res) => {}, {
      height: '80px',
      width: '600px',
      data: titleLoading
    })
  }

  /**
   * Mostra il dialog di errore
   * @param error Descrizione dell'errore da mostrare
   * @param funcRetry Azione da compiere quando viene premuto il tasto retry
   */
  showError(error: string, funcRetry) {
    this.showDialog(ErrorComponent, funcRetry, {
      height: '500px',
      width: '500px',
      data: error
    })
  }
}
