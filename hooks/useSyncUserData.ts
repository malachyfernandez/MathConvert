import { useEffect } from "react";
import { useUser } from "@clerk/clerk-expo";

export const useSyncUserData = (userData: any, setUserData: any) => {
    const { user, isLoaded: isClerkLoaded } = useUser();

    useEffect(() => {
        // Don't proceed if Clerk hasn't loaded yet
        if (!isClerkLoaded) {
            console.log("⏳ Clerk still loading, skipping sync");
            return;
        }

        const isLoggedIn = !!user;
        const isLoaded = userData !== undefined;

        // Only proceed if user is fully loaded and authenticated
        if (!isLoggedIn) {
            console.log("🔒 User not authenticated, skipping sync");
            return;
        }

        if (isLoaded) {
            const clerkEmail = user.primaryEmailAddress?.emailAddress;
            const clerkName = user.fullName;

            // Check if data actually needs updating to avoid infinite loops
            const needsUpdate =
                !userData.email ||
                userData.email !== clerkEmail ||
                userData.name !== clerkName;

            if (needsUpdate) {
                setUserData({
                    ...userData,
                    name: clerkName,
                    email: clerkEmail,
                    userId: user.id,
                });
                console.log("✅ Synced UserData with Clerk:");
            }
        }
    }, [user, userData, isClerkLoaded]);
};