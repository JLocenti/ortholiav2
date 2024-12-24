import { Firestore } from 'firebase/firestore';

export class PractitionerRepository {
  constructor(private db: Firestore) {}
}