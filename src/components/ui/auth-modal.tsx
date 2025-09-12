import React, { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import LoginForm from "@/app/(auth)/misc/components/LoginForm";
import { CreateAccountForm } from "@/app/(auth)/misc/components";
import { cn } from "@/lib/utils";

export default function AuthModal({ open, closeAuthModal }: { open: boolean, closeAuthModal:()=>void }) {
    const [mode, setMode] = useState<'login' | 'signup'>('login');

    return (
        <Dialog open={open}>
            <DialogContent className={cn(" !max-h-[90vh] overflow-y-auto", mode == "login" ? "h-max" : "h-full")}>
                <div className="flex flex-col md:items-center md:justify-center ">
                    <div className="md:p-8 rounded-xl w-full ">
                        <h1 className="font-bold text-3xl mb-2">
                            {mode === 'login' ? 'Welcome back' : 'Create Account'}
                        </h1>
                        <p className="mb-4 text-white/70 text-sm">
                            {mode === 'login'
                                ? 'Please enter your credentials to log in.'
                                : 'Sign up to start playing and winning.'}
                        </p>
                        {mode === 'login' ? <LoginForm closeAuthModal={closeAuthModal} /> : <CreateAccountForm closeAuthModal={closeAuthModal} />}
                        <button
                            className="mt-4 text-purple-400 underline text-sm text-center"
                            onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                        >
                            {mode === 'login'
                                ? "Don't have an account? Sign up"
                                : 'Already have an account? Log in'}
                        </button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
