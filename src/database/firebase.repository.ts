import { Inject, Injectable } from '@nestjs/common';
import { deleteObject, FirebaseStorage, getDownloadURL, ref, uploadBytes, UploadResult } from 'firebase/storage';
import { FIREBASE_TOKENS } from 'src/constants/firebase.tokens';

@Injectable()
export default class FirebaseRepo {
  constructor(@Inject(FIREBASE_TOKENS.REPO) private storage: FirebaseStorage) {}

  private createRef(uuid: string) {
    return ref(this.storage, `images/${uuid}.jpg`);
  }

  public getImageUrl(image: string) {
    return getDownloadURL(this.createRef(image));
  }

  public async uploadFile(uuid: string, buffer: Buffer): Promise<UploadResult> {
    const ref = this.createRef(uuid);
    return uploadBytes(ref, buffer, { contentType: 'images/jpeg' });
  }

  public async deleteFile(uuid: string): Promise<void> {
    const ref = this.createRef(uuid);
    return deleteObject(ref);
  }
}
