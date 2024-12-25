import { auth, db } from '../config/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

export const testFirebaseConnection = async () => {
    try {
        // Test Firebase Auth initialization
        console.log('Testing Firebase Auth...');
        if (!auth) {
            throw new Error('Firebase Auth not initialized');
        }
        console.log('✅ Firebase Auth initialized successfully');

        // Test Firestore initialization
        console.log('Testing Firestore...');
        if (!db) {
            throw new Error('Firestore not initialized');
        }
        console.log('✅ Firestore initialized successfully');

        // Test Firestore read access
        console.log('Testing Firestore read access...');
        try {
            await getDoc(doc(db, 'test', 'test'));
            console.log('✅ Firestore read access successful');
        } catch (error: any) {
            if (error.code === 'permission-denied') {
                console.log('✅ Firestore security rules are active (this is good)');
            } else {
                throw error;
            }
        }

        return {
            success: true,
            message: 'Firebase configuration test completed successfully'
        };
    } catch (error) {
        console.error('Firebase configuration test failed:', error);
        return {
            success: false,
            message: `Firebase configuration test failed: ${error}`
        };
    }
};
