import { inject, Injectable } from "@angular/core"
import { Auth, user } from "@angular/fire/auth"
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, signInWithPopup, GoogleAuthProvider } from "firebase/auth"
import { Observable, from } from "rxjs"

@Injectable ({
    providedIn: 'root'
})
export class AuthService {
    firebaseAuth = inject(Auth)
    user$ = user(this.firebaseAuth)
    
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
}