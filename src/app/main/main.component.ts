import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material';
import { NgxSpinnerService } from 'ngx-spinner';
import { throwError } from 'rxjs';
import { FileUploader } from 'ng2-file-upload';
import { JwtHelperService } from '@auth0/angular-jwt';

import { FileService } from '../shared/file/file.service';
import { MainService } from './main.service';
import { Constants } from '../shared/constants/constants';
import { SystemParamService } from '../shared/system-param/system-param.service';
import { TranslateCustomService } from '../shared/translate/translate-custom.service';
import { ForwardDownloadComponent } from '../download/forward-download/forward-download.component';
import { SharedService } from '../shared/shared.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css'],
})

/**
 * class main operation of user
 */
export class MainComponent implements OnInit {

  // create attributes to check netword inside or outside
  transfer: number;
  fromIn: boolean;
  fromOut: boolean;
  //flaf check exists file can download
  existsFile: boolean;

  // message show if no file download
  message: string;

  // attributes to get title and color from system
  titleNetworkLocal: string;
  colorNetworkLocal: string;
  titleNetworkExternal: string;
  colorNetworkExternal: string;
  public hasBaseDropZoneOver:boolean = false;
  // uploadder to drag and drop
  uploader: FileUploader = new FileUploader({});
  files: any = [];

  /**
   * constructor 
   * @param route 
   * @param mainService 
   * @param fileService 
   * @param sysParam 
   * @param location 
   */
  constructor(
    private route: Router,
    private fileService: FileService,
    private translateService: TranslateCustomService,
    private mainService: MainService,
    private sysParam: SystemParamService,
    private dialog: MatDialog,
    private spinner: NgxSpinnerService,
    private sharedService: SharedService
  ) { }

  /**
   * method init view
   */
  ngOnInit() {
    try {
      this.spinner.show();
      //get language of localstrogare
      const decode = new JwtHelperService().decodeToken(localStorage.getItem(Constants.NAME_TOKEN));
      // set value for attributes
      this.fromIn = decode.is_inside;
      this.fromOut = !this.fromIn;
      this.sharedService.getUserRole().subscribe(data => {
        this.transfer = +data.extra.role_info.flag_transfer;
      }, err => throwError(err));
      this.message = Constants.MSG_COM_0002;
      // call api to get params need to init view
      this.mainService.getInfoFile().subscribe(file => {
        this.existsFile = file.extra.num_file_can_download != 0;
      }, err => throwError(err));
      this.sysParam.getSystemParam().subscribe(data => {
        if (Constants.LANGUAGE_EN === this.translateService.getLanguage()) {
          // title local and external english
          this.titleNetworkLocal = data.extra.system_params.title_network_local_en;
          this.titleNetworkExternal = data.extra.system_params.title_network_external_en;
        } else {
          // title local and external japan
          this.titleNetworkLocal = data.extra.system_params.title_network_local_ja;
          this.titleNetworkExternal = data.extra.system_params.title_network_external_ja;
        }
        // color local and external
        this.colorNetworkLocal = data.extra.system_params.color_network_local;
        this.colorNetworkExternal = data.extra.system_params.color_network_external;
        this.spinner.hide();
      }, err => throwError(err));
    } catch (error) {
      this.spinner.hide();
      this.route.navigate([Constants.LINK_SYSTEM_ERROR]);
    }
  }

  /**
   * navigate to forward-download screen if user want to download file
   */
  downloadFile() {
    localStorage.setItem(Constants.CAN_FORWARD, Constants.CAN_FORWARD);
    this.dialog.open(ForwardDownloadComponent, { disableClose: true });
  }

  public fileOverBase(e:any):void {
    this.hasBaseDropZoneOver = e;
  }

  /**
   * if user upload file, method will get file and store, and navigate to upload-file screen
   * @param event 
   */
  uploadFile(event?: any) {
    localStorage.setItem(Constants.CAN_GO_TO_UPLOAD, Constants.CAN_GO_TO_UPLOAD);
    let upload = (<HTMLInputElement>window.document.getElementById('upload'));
    if (event) {
      this.fileService.setFile(event.dataTransfer.files)
    } else {
      this.fileService.setFile(upload.files);
    }
    this.route.navigate([Constants.LINK_UPLOAD_FILE]);
  }
}
