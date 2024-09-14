import { Controller, Get, Param, Res } from '@nestjs/common';
import { Response } from 'express';
import FirebaseRepo from 'src/database/firebase.repository';

@Controller({ path: '/images' })
export default class ImageController {
  constructor(private firebaseRepo: FirebaseRepo) {}
  @Get(':image')
  public async getImage(@Param('image') image: string, @Res() res: Response) {
    const imageUrl = await this.firebaseRepo.getImageUrl(image);
    res.redirect(imageUrl);
  }
}
