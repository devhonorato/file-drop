import { Component, OnInit, Inject } from '@angular/core';
import {
  MatDialogRef,
  MatDialog,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';

import {
  Dimensions,
  ImageCroppedEvent,
  ImageTransform,
} from 'ngx-image-cropper';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-modal-edit',
  templateUrl: './modal-edit.component.html',
  styleUrls: ['./modal-edit.component.css'],
})
export class ModalEditComponent implements OnInit {
  message: string = '';
  cancelButtonText = 'Cancel';
  okButtonText = 'Ok';

  // Cropped
  imageChangedEvent: any = '';
  croppedImage: any = '';
  canvasRotation = 0;
  rotation = 0;
  scale = 1;
  showCropper = false;
  containWithinAspectRatio = false;
  transform: ImageTransform = {};
  aspectRatioX = 4;
  aspectRatioY = 3;
  maintainAspectRatioTrueFalse = true;
  imageType = '';

  // Buttom Active
  aspectRatio = 0;
  bgColor = '#00000';

  fileName: any = '';
  ImageList: any[] = [];
  imagetochange: any;
  imageobjComolete: any;
  auxBASE64: any;
  index: any;

  constructor(
    @Inject(MAT_DIALOG_DATA) private data: any,
    private dialogRef: MatDialogRef<ModalEditComponent>,
    public _DomSanitizationService: DomSanitizer
  ) {
    if (data) {
      // console.log(data);

      this.message = data.message || this.message;
      if (data.buttonText) {
        this.cancelButtonText = data.buttonText.cancel || this.cancelButtonText;
        this.okButtonText = data.buttonText.ok || this.okButtonText;
      }

      // console.log('IMAGEM ', data);

      if (data.item.type == 'image/png') {
        this.imageType = 'png';
        this.backgroundReplace();
      }

      if (data.item.type == 'image/jpg' || data.item.type == 'image/jpeg') {
        this.imageType = 'jpeg';
        this.clickColor();
      }

      if (data.index >= 0) {
        this.index = data.index;
      }

      this.imagetochange = data.item.base64File;
      this.imageobjComolete = data.item;
      // console.log('getIMG2', this.imageobjComolete);
      // console.log('this.croppedImage', this.croppedImage);
    }
  }

  ngOnInit(): void {}

  onConfirmClick(data: any, index: any) {
    var retorno = {
      message: 'Are you sure want to delete?',
      buttonText: {
        ok: 'Save',
        cancel: 'No',
      },
      data: [data],
      id: index,
    };

    this.dialogRef.close(retorno);
  }

  closeModal(): void {
    this.dialogRef.close(true);
  }

  imageCropped(event: ImageCroppedEvent) {
    this.croppedImage = event.base64;
    // console.log(event);
  }

  imageLoaded() {
    this.showCropper = true;
    // console.log('Image loaded');
  }

  cropperReady(sourceImageDimensions: Dimensions) {
    // console.log('Cropper ready', sourceImageDimensions);
  }

  loadImageFailed() {
    // console.log('Load failed');
  }

  rotateLeft() {
    this.canvasRotation--;
    this.flipAfterRotate();
  }

  rotateRight() {
    this.canvasRotation++;
    this.flipAfterRotate();
  }

  private flipAfterRotate() {
    const flippedH = this.transform.flipH;
    const flippedV = this.transform.flipV;
    this.transform = {
      ...this.transform,
      flipH: flippedV,
      flipV: flippedH,
    };
  }

  flipHorizontal() {
    this.transform = {
      ...this.transform,
      flipH: !this.transform.flipH,
    };
  }

  flipVertical() {
    this.transform = {
      ...this.transform,
      flipV: !this.transform.flipV,
    };
  }

  resetImage() {
    this.scale = 1;
    this.rotation = 0;
    this.canvasRotation = 0;
    this.transform = {};
    this.containWithinAspectRatio = false;
    this.maintainAspectRatioTrueFalse = true;
    this.aspectRatio4x3();
    this.aspectRatioActive(0);
  }

  zoomOut() {
    this.scale -= 0.1;
    this.transform = {
      ...this.transform,
      scale: this.scale,
    };
  }

  zoomIn() {
    this.scale += 0.1;
    this.transform = {
      ...this.transform,
      scale: this.scale,
    };
  }

  toggleContainWithinAspectRatio() {
    this.containWithinAspectRatio = !this.containWithinAspectRatio;
  }

  updateRotation() {
    this.transform = {
      ...this.transform,
      rotate: this.rotation,
    };
  }

  aspectRatioActive(index: any) {
    this.aspectRatio = index;
  }

  aspectRatio1x1() {
    this.aspectRatioX = 1;
    this.aspectRatioY = 1;
  }

  aspectRatio2x3() {
    this.aspectRatioX = 2;
    this.aspectRatioY = 3;
  }

  aspectRatio3x2() {
    this.aspectRatioX = 3;
    this.aspectRatioY = 2;
  }

  aspectRatio4x3() {
    this.aspectRatioX = 4;
    this.aspectRatioY = 3;
  }

  aspectRatio5x4() {
    this.aspectRatioX = 5;
    this.aspectRatioY = 4;
  }

  aspectRatio16x9() {
    this.aspectRatioX = 16;
    this.aspectRatioY = 9;
  }

  trueFalseMaintainAspectRatio() {
    // console.log('inicial', this.maintainAspectRatioTrueFalse);

    if (this.maintainAspectRatioTrueFalse) {
      this.maintainAspectRatioTrueFalse = false;

      // console.log('IF true', this.maintainAspectRatioTrueFalse);
      this.aspectRatio1x1();
      this.aspectRatioActive(2);
    } else {
      this.maintainAspectRatioTrueFalse = true;
      // console.log('ELSE False', this.maintainAspectRatioTrueFalse);
      setTimeout(() => {
        // this.aspectRatio1x1();
        // this.resetImage();
        this.aspectRatio4x3();
        this.aspectRatioActive(0);
      }, 300);
    }
  }

  clickColor() {
    let time = setInterval(() => {
      if (document.getElementById('pick_color') as HTMLInputElement) {
        clearInterval(time);
        this.bgColor = (
          document.getElementById('pick_color') as HTMLInputElement
        ).value;
        // console.log(this.bgColor);

        this.resetImage();
      }
    }, 100);
  }

  backgroundReplace() {
    this.bgColor = '#ffffff00';
    // console.log(this.bgColor);
  }

  async saveImgcroped2() {
    this.imageobjComolete.base64File = this.croppedImage;

    // for (let index = 0; index < this.processedImages.length; index++) {
    const element = this.data.item;

    if (this.imageobjComolete.name == element.name) {
      let urlToFile = await this.urltoFile(
        this.croppedImage,
        this.imageobjComolete.name,
        this.imageobjComolete.type
      );

      let fileToBase64 = await this.toBase64(urlToFile);

      const url = await this.generatorUrl(urlToFile);

      element.file = urlToFile;
      element.base64File = fileToBase64;
      element.url = url;
      element.sizeFile = await this.sizeFile(urlToFile.size);
      element.compress = [];
      element.sizeCompress = '';
      element.stadoCompress = null;
      // console.log('saveImgOriginal', this.imageobjComolete);
      // console.log('saveImgOriginal  name', this.imageobjComolete.name);
      // console.log('saveImgOriginal  type', this.imageobjComolete.type);
      // console.log('url', url);

      // console.log("urlToFile", urlToFile)
      // console.log("fileToBase64", fileToBase64)

      this.onConfirmClick(this.data.item, this.index);
    }

    // }
    // console.log('saveImgcroped', this.imageobjComolete.base64);
    // console.log('this.croppedImage', this.croppedImage);
    console.log('this.data.item', this.data.item);
  }

  async generatorUrl(file: any) {
    try {
      if (file.type == '') {
        throw "Erro: Formato/type do documento '" + file.name + "' é inválido.";
      }
      var blob = new Blob([file], { type: file.type });
      var url = window.URL.createObjectURL(blob);
      // window.open(url);
      // // console.log(blob);
      return await this._DomSanitizationService.bypassSecurityTrustUrl(url);
    } catch (error) {
      throw error;
    }
  }

  async sizeFile(bytes: any, decimals = 2) {
    if (!+bytes) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));
    // console.log(`${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`);
    return await `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
  }

  async toBase64(file: any) {
    const reader = new FileReader();
    const start2 = async () =>
      new Promise((resolve) => {
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
      });

    return await start2();
  }

  async urltoFile(url: any, filename: any, mimeType: any) {
    // console.log(url, filename, mimeType);
    return await fetch(url)
      .then(function (res) {
        return res.arrayBuffer();
      })
      .then(function (buf) {
        return new File([buf], filename, { type: mimeType });
      });
  }
}
