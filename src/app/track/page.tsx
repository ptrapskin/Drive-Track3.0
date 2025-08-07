"use client"

import Tracker from "@/components/tracker"
import { useAuth } from "@/context/auth-context";
import { useSessions } from "@/context/sessions-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function TrackPage() {
    const { addSession } = useSessions();
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
        router.push('/login');
        }
    }, [user, loading, router]);

    if (loading || !user) {
        return (
            <div className="flex justify-center items-center min-h-screen">
            <div className="text-2xl">Loading...</div>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-background text-foreground">
            <div className="container mx-auto p-4 sm:p-6 lg:p-8">
                 <header className="mb-8 flex justify-between items-start md:hidden">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-4xl font-bold font-headline tracking-tight text-primary">
                            Track Session
                        </h1>
                        </div>
                        <p className="text-muted-foreground">
                            Start a new driving session.
                        </p>
                    </div>
                </header>
                <div className="flex justify-center">
                    <div className="w-full lg:w-3/4 xl:w-1/2">
                        <Tracker onSaveSession={addSession} />
                    </div>
                </div>
            </div>
        </main>
    )
}
