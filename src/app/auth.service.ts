import { inject, Injectable, signal } from "@angular/core"
import { Auth, user } from "@angular/fire/auth"
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, 
    updateProfile, signInWithPopup, GoogleAuthProvider, signOut,
    updateEmail, updatePassword} from "firebase/auth"
import { Observable, from } from "rxjs"
import { catchError } from 'rxjs/operators';
import { UserInterface } from "./user.interface"
import { EmailAuthProvider, reauthenticateWithCredential, sendEmailVerification } from 'firebase/auth';

@Injectable ({
    providedIn: 'root'
})
export class AuthService {
    firebaseAuth = inject(Auth)
    user$ = user(this.firebaseAuth)
    currentUserSignal = signal<UserInterface | null | undefined>(undefined)

    signup(email: string, username: string, password: string) : Observable<void> {
        const promise = createUserWithEmailAndPassword(
            this.firebaseAuth, 
            email, 
            password,
        ).then((response) =>
            updateProfile(response.user, {displayName: username}),
    );
        return from(promise);
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
        const promise = signInWithPopup(this.firebaseAuth, provider).then(() => {});
        return from(promise);
    }

    logout() : Observable<void>
    {
        const promise = signOut(this.firebaseAuth);
        return from(promise);
    }

    update(email: string, username: string, password: string): Observable<void> {
      const user = this.firebaseAuth.currentUser; // getting the current user
      if (!user) {
        return from(Promise.reject("No user is currently logged in."));
      }
    
      console.log(`I got: ${email}, ${username}, ${password}`);
    
      const updatePromises: Promise<void>[] = [];
    
      // email update
      if (email && email !== user.email) {
        // Get the user's email and password to reauthenticate
        const credentials = EmailAuthProvider.credential(user.email!, password);
    
        // Re-authenticate the user before sending the verification email
        reauthenticateWithCredential(user, credentials).then(() => {
          // After reauthentication, send the email verification
          sendEmailVerification(user).then(() => {
            // After verification is sent, update the email
            updatePromises.push(updateEmail(user, email));
          }).catch((error) => {
            console.error("Error sending email verification:", error);
            return from(Promise.reject("Email verification failed."));
          });
        }).catch((error) => {
          console.error("Reauthentication failed:", error);
          return from(Promise.reject("Reauthentication failed."));
        });
      }
    
      // username update
      if (username && username !== user.displayName) {
        updatePromises.push(updateProfile(user, { displayName: username }));
      }
    
      // password update
      if (password) {
        updatePromises.push(updatePassword(user, password));
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