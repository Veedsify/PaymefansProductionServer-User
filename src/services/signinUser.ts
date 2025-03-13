import { signIn } from "next-auth/react";

export async function SignInUser(user: any) {
    const siginCall = await signIn("credentials", {
        email: user.email,
        password: user.password,
    });
    return siginCall;
}
