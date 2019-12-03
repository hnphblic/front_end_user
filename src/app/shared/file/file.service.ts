import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
/**
 * this service reciver and translation File, FileList
 */
export class FileService {

  constructor() { }

  fileList: any;
  fileName: any;

  setFile(file: any): void {
    this.fileList = file;
  }

  getFile() {
    return this.fileList;
  }
}
