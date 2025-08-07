
"use client"

import Tracker from "@/components/tracker"
import { useAuth } from "@/context/auth-context";
import { useSessions } from "@/context/sessions-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ManualLogForm from "@/components/manual-log-form";
import { Hourglass, PencilLine } from "lucide-react";


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
                 <header className="mb-8">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-4xl font-bold font-headline tracking-tight text-primary">
                            Log a Session
                        </h1>
                        </div>
                        <p className="text-muted-foreground">
                            Track a live session or enter a past one manually.
                        </p>
                    </div>
                </header>
                <div className="flex justify-center">
                    <div className="w-full lg:w-3/4 xl:w-2/3">
                        <Tabs defaultValue="auto" className="w-full">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="auto">
                                    <Hourglass className="mr-2 h-4 w-4" />
                                    Automatic Tracker
                                </TabsTrigger>
                                <TabsTrigger value="manual">
                                    <PencilLine className="mr-2 h-4 w-4" />
                                    Manual Entry
                                </TabsTrigger>
                            </TabsList>
                            <TabsContent value="auto" className="mt-6">
                                 <Tracker onSaveSession={addSession} />
                            </TabsContent>
                            <TabsContent value="manual" className="mt-6">
                                <ManualLogForm onSave={addSession} />
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </div>
        </main>
    )
}
