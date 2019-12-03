import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { JwtHelperService } from '@auth0/angular-jwt';

import { SystemParamService } from '../shared/system-param/system-param.service';
import { DetailUserService } from '../user/detail-user/detail-user.service';
import { ApprovalService } from '../approve/approval.service';
import { Constants } from '../shared/constants/constants';
import { TranslateCustomService } from '../shared/translate/translate-custom.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  host: {
    '(document:click)': 'onClick($event)',
  }
})

/**
 * The common function is displayed at some screen header position
 */
export class HeaderComponent implements OnInit {

  public title: string;
  public userName: string;
  public showLogo: boolean;
  public userLogo: string;
  public showMenu: boolean = false;
  public showRightHead: boolean = false;
  // display in button Application for approval
  public fileWaitApprovalTotal: number;
  // update data from parents
  public static dataUpdate: Subject<string> = new Subject<string>();
  /**
   * setup Dependency Injection
   * @param systemService 
   * @param detailUserService 
   * @param router 
   */
  constructor(
    private systemService: SystemParamService,
    private detailUserService: DetailUserService,
    private router: Router,
    private translateService: TranslateCustomService,
    private approvalService: ApprovalService) {
    HeaderComponent.dataUpdate.subscribe(res => {
      if (this.router.url == Constants.LINK_DETAIL_USER) {
        this.userName = res.toString();
      } else if (this.router.url == Constants.LINK_LIST_APPLY_APPROVAL) {
        this.getFileWaitApprovalTotal();
      }
    });
  }

  /**
   * toggle menu
   * @param event 
   */
  onClick(event) {
    if (event.target.classList.contains('line') || event.target.classList.contains('navbar-toggler-icon')) {
      this.showMenu = !this.showMenu;
    } else {
      this.showMenu = false;
    }
  }

  /**
   * invoked only once when the directive is instantiated
   */
  ngOnInit() {
    if (this.router.url != Constants.LINK_RESET_PASSWORD && this.router.url != Constants.LINK_TIME_OUT
      && this.router.url != Constants.LINK_COMPLATE_RESET_PASSWORD && this.router.url != Constants.LINK_LOGOUT) {
      this.showRightHead = true;
      this.getUser();
      this.getFileWaitApprovalTotal();
    }
    this.fileWaitApprovalTotal = 0;
    this.systemService.getSystemParam().subscribe(systemParam => {
      this.showLogo = systemParam.extra.system_params.user_logo_image_visible == Constants.VALUE_TRUE;
      this.userLogo = systemParam.extra.system_params.user_logo_image;
      this.getTitle(systemParam);
    }, () => this.router.navigate([Constants.LINK_SYSTEM_ERROR]));
  }

  /**
   * get total file wait approval
   */
  private getFileWaitApprovalTotal() {
    this.approvalService.getFileApproval().subscribe(data => {
      if (data.message == Constants.MESSAGE_SUCCESS) {
        this.fileWaitApprovalTotal = data.extra.request_need_to_approval;
      }
    }, () => this.router.navigate([Constants.LINK_SYSTEM_ERROR]));
  }

  /**
   * get user by id
   */
  private getUser() {
    this.detailUserService.getDetailUser().subscribe(user => {
      if (user.extra.name) {
        this.userName = user.extra.name
      }
    }, () => this.router.navigate([Constants.LINK_SYSTEM_ERROR]));
  }

  /**
   * get title
   * @param systemParam 
   */
  private getTitle(systemParam) {
    const decode = new JwtHelperService().decodeToken(localStorage.getItem(Constants.NAME_TOKEN));
    var systemParamData = systemParam.extra.system_params;
    if (decode) {
      if (this.translateService.getLanguage() === Constants.LANGUAGE_EN) {
        this.title = decode.is_inside ? (Constants.TITLE_HEADER_EN + systemParamData.title_network_local_en) : (Constants.TITLE_HEADER_EN + systemParamData.title_network_external_en);
      } else {
        this.title = decode.is_inside ? (systemParamData.title_network_local_ja + Constants.TITLE_HEADER_JA) : (systemParamData.title_network_external_ja + Constants.TITLE_HEADER_JA);
      }
    }
  }

  /**
   * go to [MEM00021] List Apply Approval screen
   */
  goToListApplyApproval() {
    this.router.navigate([Constants.LINK_LIST_APPLY_APPROVAL]);
  }

  /**
   * go to history upload screen
   */
  public historyUpload() {
    this.router.navigate([Constants.LINK_HISTORY_UPLOAD]);
  }

  /**
   * logout
   */
  logout() {
    this.router.navigate([Constants.LINK_LOGOUT]);
  }
}
