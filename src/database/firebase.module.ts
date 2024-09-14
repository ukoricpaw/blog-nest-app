import { Module } from '@nestjs/common';
import { FIREBASE_TOKENS } from 'src/constants/firebase.tokens';
import { initializeApp } from 'firebase/app';
import FirebaseRepo from './firebase.repository';
import { getStorage } from 'firebase/storage';

@Module({
  providers: [
    FirebaseRepo,
    {
      provide: FIREBASE_TOKENS.REPO,
      useFactory: () => {
        const firebaseConfig = {
          apiKey: process.env.API_KEY,
          authDomain: process.env.AUTH_DOMAIN,
          projectId: process.env.PROJECT_ID,
          storageBucket: process.env.STORAGE_BUCKET,
          messagingSenderId: process.env.MESSAGING_SENDER_ID,
          appId: process.env.APP_ID,
          measurementId: process.env.MEASUREMENT_ID,
        };

        const app = initializeApp(firebaseConfig);
        const storage = getStorage(app);
        return storage;
      },
    },
  ],
  exports: [FirebaseRepo],
})
export default class FirebaseModule {}
