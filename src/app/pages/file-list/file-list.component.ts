import { Component, OnInit } from '@angular/core';
import { NotificacaoService } from '../../../services/notificacao.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import {
  NgxFileDropEntry,
  FileSystemFileEntry,
  FileSystemDirectoryEntry,
} from 'ngx-file-drop';
import {
  ImageCompressService,
  ResizeOptions,
  ImageUtilityService,
  IImage,
  SourceImage,
} from 'ng2-image-compress';

import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';

import { MatDialog } from '@angular/material/dialog';
import { ModalEditComponent } from "../../components/modal-edit/modal-edit.component";
import { async } from '@angular/core/testing';

class FileEdit {
  name?: string;
  type?: string;
  url?: SafeUrl;
  file?: File;
  base64File: any = "";
  sizeFile?: string;
  compress?: [];
  cropped?: any[] = [];
  sizeCompress?: string;
  stadoCompress: any = null;
  Resize_Max_Height: number = 10000;
  Resize_Max_Width: number = 10000;
  Resize_Quality: number = 50;
}

@Component({
  selector: 'app-file-list',
  templateUrl: './file-list.component.html',
  styleUrls: ['./file-list.component.css'],
})
export class FileListComponent implements OnInit {
  title = 'List File';

  selectedImage: any;
  processedImages: any = [];
  showTitle: boolean = false;

  public files: NgxFileDropEntry[] = [];
  public file: any[] = [];
  public fileCompress: any[] = [];

  constructor(
    private sanitizer: DomSanitizer,
    private notificacaoService: NotificacaoService,
    private imgCompressService: ImageCompressService,
    public dialog: MatDialog
  ) {}

  ngOnInit(): void {
    // console.log(this.movies)
  }

  async dropped(files: NgxFileDropEntry[]) {
    this.files = files;
    // this.file = [];
    let errors: any[] = [];

    for (const droppedFile of files) {
      // Is it a file?
      if (droppedFile.fileEntry.isFile) {
        const fileEntry = droppedFile.fileEntry as FileSystemFileEntry;
        fileEntry.file(async (file: File) => {
          // console.log('file', file);
          if (file.type.includes('image/')) {
            try {
              const url = this.generatorUrl(file);
              let array = [file];
              // console.log(array)

              let novoArray = new FileEdit();

              for (let index = 0; index < array.length; index++) {
                const element = array[index];

                novoArray.name = element.name;
                novoArray.type = element.type;
                novoArray.file = element;
                novoArray.compress = [];
              }

              novoArray.url = url;

              // console.log(novoArray)
              this.file.push(novoArray);
              // this.onChange([file])
              this.fileCompress.push(file);

              novoArray.sizeFile = this.sizeFile(novoArray.file?.size);
              novoArray.sizeCompress = ' - ';

              novoArray.base64File = await this.toBase64(file);

              this.processedImages.push(novoArray);
              // console.log("this.fileCompress",this.fileCompress)
              console.log("this.processedImages",this.processedImages)

              const ultimo = this.processedImages.length - 1;

              this.maxWidth_maxHeight(ultimo);

              // Here you can access the real file
              // console.log(droppedFile.relativePath, file);

              /**
              // You could upload it like this:
              const formData = new FormData()
              formData.append('logo', file, relativePath)

              // Headers
              const headers = new HttpHeaders({
                'security-token': 'mytoken'
              })

              this.http.post('https://mybackend.com/api/upload/sanitize-and-save-logo', formData, { headers: headers, responseType: 'blob' })
              .subscribe(data => {
                // Sanitized logo returned from backend
              })
              **/
            } catch (error: any) {
              errors.push(error);
              // this.notificacaoService.showSnackBar([error], 'OK', 'background-padrao-snackbar', 'left', 'top', 100);
              // console.log(error)
            }
          } else {
            // console.log("Só é permitido imagens")
            // errors.push(['Only images are allowed'])
            this.notificacaoService.showSnackBar(
              ['Only images are allowed'],
              'OK',
              'background-warning-snackbar',
              'center',
              'top',
              3000
            );

            // console.log('Only images are allowed');
          }
        });
      } else {
        // It was a directory (empty directories are added, otherwise only files)
        const fileEntry = droppedFile.fileEntry as FileSystemDirectoryEntry;
        // console.log(droppedFile.relativePath, fileEntry);
      }
    }
    // this.notificacaoService.showSnackBar([errors], 'OK', 'background-warning-snackbar', 'center', 'top', 3000);

    // setTimeout(() => {
    //   this.notificacaoService.showSnackBar(errors, 'OK', 'background-padrao-snackbar', 'left', 'top', 2000);
    // }, 2000);
  }

  public fileOver(event: any) {
    // console.log(event);
  }

  public fileLeave(event: any) {
    // console.log(event);
  }

  generatorUrl(file: any) {
    try {
      if (file.type == '') {
        throw "Erro: Formato/type do documento '" + file.name + "' é inválido.";
      }
      var blob = new Blob([file], { type: file.type });
      var url = window.URL.createObjectURL(blob);
      // window.open(url);
      // // console.log(blob);
      return this.sanitizer.bypassSecurityTrustUrl(url);
    } catch (error) {
      throw error;
    }
  }

  generatorUrlBase64(b64Data: any, contentType = '', sliceSize = 512) {
    // const b64toBlob = () => {
    const byteCharacters = atob(b64Data);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      const slice = byteCharacters.slice(offset, offset + sliceSize);

      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }

    const blob = new Blob(byteArrays, { type: contentType });

    // }

    const blobUrl = URL.createObjectURL(blob);

    return blobUrl;
  }

  onChange(fileInput: any, i: any, fullFileObj: any) {
    this.processedImages[i].stadoCompress = true;
    let fileList: FileList;

    let images: Array<IImage> = [];

    let option: ResizeOptions = new ResizeOptions();

    // console.log("fullFileObj ", fullFileObj)

    if (fileInput[0].type == 'image/png') {
      // let option: ResizeOptions  = { Resize_Max_Height  : 1080 , Resize_Max_Width : 1920, Resize_Quality : 70 , Resize_Type : 'png'  }
      option.Resize_Max_Height = fullFileObj.Resize_Max_Height;
      option.Resize_Max_Width = fullFileObj.Resize_Max_Width;
      option.Resize_Quality = fullFileObj.Resize_Quality;
      option.Resize_Type = 'png';
    } else {
      // let option: ResizeOptions  = { Resize_Max_Height  : 1080 , Resize_Max_Width : 1920, Resize_Quality : 70 }
      option.Resize_Max_Height = fullFileObj.Resize_Max_Height;
      option.Resize_Max_Width = fullFileObj.Resize_Max_Width;
      option.Resize_Quality = fullFileObj.Resize_Quality;
    }

    ImageCompressService.filesToCompressedImageSourceEx(fileInput, option).then(
      (observableImages) => {
        observableImages.subscribe(
          (image) => {
            var teste = image;
            images.push(image);

            let index = this.processedImages.indexOf(i);
            if (index > -1) {
              this.processedImages.splice(index, 1);
            }

            this.processedImages[i].compress = [image];

            const img =
              this.processedImages[i].compress[0].compressedImage.imageDataUrl;

            var Buffer = require('buffer/').Buffer;
            const bf = Buffer.from(img.substring(img.indexOf(',') + 1));

            this.processedImages[i].sizeCompress = this.sizeFile(bf.length);

            this.processedImages[i].compress[0].compressedImage.imageObjectUrl =
              this.generatorUrlBase64(
                this.processedImages[
                  i
                ].compress[0].compressedImage.imageDataUrl.substring(
                  this.processedImages[
                    i
                  ].compress[0].compressedImage.imageDataUrl.indexOf(',') + 1
                ),
                this.processedImages[i].compress[0].compressedImage.type
              );

            // // console.log("this.processedImages ",this.processedImages[0].imageDataUrl.match(/:(.+\/.+);/)[1]);
            // console.log('this.processedImages ', this.processedImages);
            this.processedImages[i].stadoCompress = false;

            this.notificacaoService.openSnackBar(
              'Successfully compress',
              'OK',
              'background-success-snackbar',
              'center',
              'top',
              1500
            );

            // const src = image.imageDataUrl;
            // const base64str = src.split('base64,')[1];
            // const decoded = btoa(base64str);
            // // console.log("FileSize: " + decoded.length);
          },
          (error) => {
            // console.log("Error while converting");
          },
          () => {
            // this.processedImages = images;
            this.showTitle = true;
          }
        );
      }
    );

    // or you can pass File[]
    // let files: File[] = Array.from(fileInput.target.files);

    // ImageCompressService.filesArrayToCompressedImageSourceEx(files, option).then(observableImages => {
    //   observableImages.subscribe((image) => {
    //     images.push(image);
    //   }, (error) => {
    //     // console.log("Error while converting");
    //   }, () => {
    //             this.processedImages = images;
    //             this.showTitle = true;
    //   });
    // });
  }

  redutorDeNome(nome: string, qtd: number) {
    var EndNome: string = nome;
    var StartNome: string = nome;
    try {
      if (nome.length > qtd) {
        EndNome = nome.substr(nome.length - (qtd / 2 - 1), qtd / 2);
        StartNome = nome.substr(0, qtd / 2 - 2);
        nome = StartNome.trim() + ' ... ' + EndNome.trim();
      }
    } catch {}
    return nome;
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(
      this.processedImages,
      event.previousIndex,
      event.currentIndex
    );
    // console.log(this.processedImages)
  }

  deleteItem(item: any, i: any) {
    let index = this.processedImages.indexOf(item);
    if (index > -1) {
      this.processedImages.splice(index, 1);
      this.notificacaoService.openSnackBar(
        'Successfully deleted',
        'OK',
        'background-danger-snackbar',
        'center',
        'top',
        1500
      );
    }
  }

  deleteAllItem() {

    this.processedImages = [];

    this.notificacaoService.openSnackBar(
      'Successfully deleted All',
      'OK',
      'background-danger-snackbar',
      'center',
      'top',
      1500
    );

  }

  compress(item: any, i: any) {
    let obj = [];
    let index = this.processedImages.indexOf(item);

    obj.push(item.file);
    this.onChange(obj, index, item);
  }

  sizeFile(bytes: any, decimals = 2) {
    if (!+bytes) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));
    // console.log(`${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`);
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
  }

  goToLink(url: string) {
    window.open(url, '_blank');
  }

  openFileSelector() {
    const botao = document.getElementById('openFileSelector');
    botao?.click();
  }

  maxWidth_maxHeight(index: any) {
    // console.log("event ", event.target.value)
    // console.log("index ", index)
    // console.log(this.processedImages[index])

    // this.processedImages[index].Resize_Max_Width = parseInt(event.target.value);

    let maxWidth = 10000; // Max width for the image
    let maxHeight = 10000; // Max height for the image
    let ratio = 0; // Used for aspect ratio

    let img = new Image();

    img.src =
      this.processedImages[index].base64File;
    img.onload = (event: any) => {
      let loadedImage = event.currentTarget;
      let width = loadedImage.width;
      let height = loadedImage.height;

      // ratio = maxWidth / width;   // get ratio for scaling image
      // height = height * ratio;    // Reset height to match scaled image
      // width = width * ratio;    // Reset width to match scaled image

      if (width > height) {
        if (width > maxWidth) {
          ratio = maxWidth / width; // get ratio for scaling image
          height = height * ratio; // Reset height to match scaled image
          width = width * ratio; // Reset width to match scaled image
        }
      } else {
        if (height > maxHeight) {
          ratio = maxHeight / height; // get ratio for scaling image
          width = width * ratio; // Reset width to match scaled image
          height = height * ratio; // Reset height to match scaled image
        }
      }

      this.processedImages[index].Resize_Max_Width = parseInt(width);

      this.processedImages[index].Resize_Max_Height = parseInt(height);

      this.processedImages[index].widthOriginal = parseInt(width);
      this.processedImages[index].heightOriginal = parseInt(height);
    };
  }

  onKeyMaxWidth(event: any, index: any) {
    // console.log("event ", event.target.value)
    // console.log("index ", index)
    // console.log(this.processedImages[index])

    const Max_Width = document.getElementById('MaxWidth_' + index);
    const Max_Height = document.getElementById('MaxHeight_' + index);

    // this.processedImages[index].Resize_Max_Width = parseInt(event.target.value);

    let maxWidth = parseInt(event.target.value); // Max width for the image
    let maxHeight = parseInt(event.target.value); // Max height for the image
    let ratio = 0; // Used for aspect ratio

    let img = new Image();

    img.src =
      this.processedImages[index].url['changingThisBreaksApplicationSecurity'];
    img.onload = (event: any) => {
      let loadedImage = event.currentTarget;
      let width = loadedImage.width;
      let height = loadedImage.height;

      // ratio = maxWidth / width;   // get ratio for scaling image
      // height = height * ratio;    // Reset height to match scaled image
      // width = width * ratio;    // Reset width to match scaled image

      if (width > height) {
        if (width > maxWidth) {
          ratio = maxWidth / width; // get ratio for scaling image
          height = height * ratio; // Reset height to match scaled image
          width = width * ratio; // Reset width to match scaled image
        }
      } else {
        if (height > maxHeight) {
          ratio = maxHeight / height; // get ratio for scaling image
          width = width * ratio; // Reset width to match scaled image
          height = height * ratio; // Reset height to match scaled image
        }
      }

      this.processedImages[index].Resize_Max_Width = parseInt(width);
      (Max_Width as HTMLInputElement).value = parseInt(width).toString();

      this.processedImages[index].Resize_Max_Height = parseInt(height);
      (Max_Height as HTMLInputElement).value = parseInt(height).toString();
    };
  }

  onKeyMaxHeight(event: any, index: any) {
    // console.log("event ", event.target.value)
    // console.log("index ", index)
    // console.log(this.processedImages[index])

    const Max_Width = document.getElementById('MaxWidth_' + index);
    const Max_Height = document.getElementById('MaxHeight_' + index);

    // this.processedImages[index].Resize_Max_Height = parseInt(event.target.value);

    var maxWidth = parseInt(event.target.value); // Max width for the image
    var maxHeight = parseInt(event.target.value); // Max height for the image
    var ratio = 0; // Used for aspect ratio

    let img = new Image();

    img.src =
      this.processedImages[index].url['changingThisBreaksApplicationSecurity'];
    img.onload = (event: any) => {
      let loadedImage = event.currentTarget;
      let width = loadedImage.width;
      let height = loadedImage.height;

      // ratio = maxHeight / height; // get ratio for scaling image
      // width = width * ratio;    // Reset width to match scaled image
      // height = height * ratio;    // Reset height to match scaled image

      if (height > width) {
        if (height > maxHeight) {
          ratio = maxHeight / height; // get ratio for scaling image
          width = width * ratio; // Reset width to match scaled image
          height = height * ratio; // Reset height to match scaled image
        }
      } else {
        if (width > maxWidth) {
          ratio = maxWidth / width; // get ratio for scaling image
          height = height * ratio; // Reset height to match scaled image
          width = width * ratio; // Reset width to match scaled image
        }
      }

      this.processedImages[index].Resize_Max_Width = parseInt(width);
      (Max_Width as HTMLInputElement).value = parseInt(width).toString();

      this.processedImages[index].Resize_Max_Height = parseInt(height);
      (Max_Height as HTMLInputElement).value = parseInt(height).toString();
    };
  }

  onKeyQuality(event: any, index: any) {
    // console.log("event ", event.target.value)
    // console.log("index ", index)
    // console.log(this.processedImages[index])
    this.processedImages[index].Resize_Quality = parseInt(event.target.value);
  }

  openDialog(item: any, index: any) {

    const dialogRef = this.dialog.open(ModalEditComponent, {

      autoFocus: true,
      hasBackdrop: true,
      disableClose: true,
      maxWidth: '100vw',
      maxHeight: '100vh',
      height: '100%',
      width: '100%',
      panelClass: 'full-screen-modal',
      data: {
        message: 'Are you sure want to delete?',
        buttonText: {
          ok: 'Save Edit',
          cancel: 'Cancel'
        },
        item: item,
        index: index
      }
    });

    dialogRef.afterClosed().subscribe((result) => {

      // console.log(this.processedImages)
      // console.log(result);

      if(result.data != undefined){
        // this.processedImages[result.id].Resize_Max_Height = result.data[0].Resize_Max_Height;
        // this.processedImages[result.id].Resize_Max_Width = result.data[0].Resize_Max_Width;
        // this.processedImages[result.id].Resize_Quality = result.data[0].Resize_Quality;
        this.processedImages[result.id].base64File = result.data[0].base64File;
        this.processedImages[result.id].compress = result.data[0].compress;
        this.processedImages[result.id].cropped = result.data[0].cropped;
        this.processedImages[result.id].file = result.data[0].file;
        this.processedImages[result.id].name = result.data[0].name;
        this.processedImages[result.id].sizeCompress = result.data[0].sizeCompress;
        this.processedImages[result.id].sizeFile = result.data[0].sizeFile;
        this.processedImages[result.id].stadoCompress = result.data[0].stadoCompress;
        this.processedImages[result.id].type = result.data[0].type;
        this.processedImages[result.id].url = result.data[0].url;

        this.maxWidth_maxHeight(result.id);
      }



      // console.log(this.processedImages)

    });
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

  downloadAllImagens(){

    for (let index = 0; index < this.processedImages.length; index++) {
      const element = this.processedImages[index];

      var tag = document.createElement('a');
      tag.href = element.url['changingThisBreaksApplicationSecurity'];
      tag.download = element.name;
      document.body.appendChild(tag);
      tag.click();
      document.body.removeChild(tag);
    }

  }


}

// @Component({
//   selector: 'app-modal-edit',
//   templateUrl: '../../components/modal-edit/modal-edit.component.html',
//   styleUrls: ['../../components/modal-edit/modal-edit.component.css']
// })
// export class ModalEditComponent{}
