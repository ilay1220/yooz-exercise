import { inject, Injectable, signal } from "@angular/core"
import { Auth, user } from "@angular/fire/auth"
import { Firestore, collection, doc, setDoc } from "@angular/fire/firestore"
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, 
    updateProfile, signInWithPopup, GoogleAuthProvider, signOut,
    updateEmail, updatePassword} from "firebase/auth"
import { Observable, from, of } from 'rxjs'
import { catchError, map, switchMap } from 'rxjs/operators';
import { UserInterface } from "./user.interface"
import { EmailAuthProvider, reauthenticateWithCredential, sendEmailVerification } from 'firebase/auth';

@Injectable ({
    providedIn: 'root'
})
export class AuthService {
    firebaseAuth = inject(Auth)
    firestore = inject(Firestore)
    user$ = user(this.firebaseAuth)
    currentUserSignal = signal<UserInterface | null | undefined>(undefined)

    signup(email: string, username: string, password: string): Observable<void> {
      return from(createUserWithEmailAndPassword(
          this.firebaseAuth, 
          email, 
          password
      )).pipe(
          switchMap((response) => {
              // Update profile with username
              return from(updateProfile(response.user, {displayName: username})).pipe(
                  switchMap(() => {
                      // Save additional user info to Firestore
                      const userRef = doc(collection(this.firestore, 'users'), response.user.uid);
                      return from(setDoc(userRef, {
                          email: email,
                          pid: response.user.uid,
                          username: username
                      }));
                  })
              );
          }),
          map(() => {}), // Convert to void
          catchError((error) => {
              console.error('Signup error:', error);
              throw error;
          })
      );
  }

    login(email: string, password: string) : Observable<void> {
        const promise = signInWithEmailAndPassword(
            this.firebaseAuth, 
            email, 
            password,
        ).then(() => {});
        return from(promise);
    }

    loginWithGoogle(): Observable<void> {
        const provider = new GoogleAuthProvider();
        const promise = signInWithPopup(this.firebaseAuth, provider)
            .then(async (response) => {
                // For Google signup, save user info to Firestore if not exists
                if (response.user) {
                    const userRef = doc(collection(this.firestore, 'users'), response.user.uid);
                    await setDoc(userRef, {
                        email: response.user.email,
                        pid: response.user.uid,
                        username: response.user.displayName || response.user.email?.split('@')[0]
                    }, { merge: true });
                }
            });
        return from(promise);
    }

    logout(): Observable<void> {
      const promise = signOut(this.firebaseAuth).then(() => {
          this.currentUserSignal.set(null);
      });
      return from(promise);
    }  

    update(email: string, username: string, password: string): Observable<void> {
    const user = this.firebaseAuth.currentUser;
    if (!user) {
      return from(Promise.reject("No user is currently logged in."));
    }

    console.log(`I got: ${email}, ${username}, ${password}`);

    const updatePromises: Promise<void>[] = [];
    const updateData: { email?: string, username?: string } = {};

    // email update
    if (email && email !== user.email) {
      const credentials = EmailAuthProvider.credential(user.email!, password);

      const emailUpdatePromise = reauthenticateWithCredential(user, credentials)
        .then(() => sendEmailVerification(user))
        .then(() => {
          updatePromises.push(updateEmail(user, email));
          updateData.email = email;
        });

      updatePromises.push(emailUpdatePromise);
    }

    // username update
    if (username && username !== user.displayName) {
      updatePromises.push(updateProfile(user, { displayName: username }));
      updateData.username = username;
    }

    // password update
    if (password) {
      updatePromises.push(updatePassword(user, password));
    }

    // Update Firestore database
    if (Object.keys(updateData).length > 0) {
      const userRef = doc(collection(this.firestore, 'users'), user.uid);
      updatePromises.push(setDoc(userRef, updateData, { merge: true }));
    }

    const promise = Promise.all(updatePromises).then(() => {
      console.log("User profile updated successfully!");
    });

    return from(promise).pipe(
      catchError((error) => {
        console.error("Error updating user profile:", error);
        return from(Promise.reject(error));
      })
    );
  }
}