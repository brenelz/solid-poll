import { action, cache, redirect } from "@solidjs/router";
import { validateEmail, validatePassword } from "./utils";
import { addUser, getUser } from "./db";
import crypto from 'crypto';
import { getAuthUser, setAuthOnResponse } from "./auth";

export const loginOrRegister = action(async (formData: FormData) => {
    'use server';

    const email = String(formData.get('email'));
    const password = String(formData.get('password'));
    const action = String(formData.get('action'));

    let error = validateEmail(email) || validatePassword(password);
    if (error) return new Error(error);

    let user;

    if (action === 'login') {
        user = await getUser(email);

        const passwordHash = crypto
            .pbkdf2Sync(password, String(user?.passwordSalt), 1000, 64, "sha256")
            .toString("hex");

        if (user?.passwordHash !== passwordHash) {
            return new Error('Invalid login credentails')
        }
    } else if (action === 'register') {
        user = await addUser(email, password);
    }

    if (!user) return new Error('No user found');

    await setAuthOnResponse(String(user.id));

    return redirect("/polls");
}, 'login-or-register');

export const redirectIfLoggedIn = cache(async () => {
    "use server";

    let userId = await getAuthUser();
    if (userId) {
        return redirect("/polls");
    }
    return null;
}, "loggedIn");