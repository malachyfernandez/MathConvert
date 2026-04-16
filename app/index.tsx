import { Platform, View } from "react-native";
import { SafeAreaListener, SafeAreaView } from "react-native-safe-area-context";
import React, { useEffect, useState } from "react";
import { useOAuth } from "@clerk/clerk-expo";
import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import { Uniwind } from "uniwind";

import AuthButton from "./components/ui/buttons/AuthButton";
import Column from "./components/layout/Column";
import MainPage from "./components/MainPage";
import DialogHeader from "./components/ui/dialog/DialogHeader";
import AppButton from "./components/ui/buttons/AppButton";
import PoppinsText from "./components/ui/text/PoppinsText";
import PoppinsTextInput from "./components/ui/forms/PoppinsTextInput";
import { useAppAuth } from "../contexts/AppAuthContext";
import { useToast } from "../contexts/ToastContext";

const useWarmUpBrowser = () => {
  useEffect(() => {
    if (Platform.OS === "web") return;
    void WebBrowser.warmUpAsync();
    return () => { void WebBrowser.coolDownAsync(); };
  }, []);
};

WebBrowser.maybeCompleteAuthSession();

export default function HomeScreen() {
  useWarmUpBrowser();

  const { startOAuthFlow: startGoogleFlow } = useOAuth({ strategy: "oauth_google" });
  const { isAuthenticated, isLoading, signInWithUserCode } = useAppAuth();
  const { showToast } = useToast();
  const [showUserCodeInput, setShowUserCodeInput] = useState(false);
  const [userCode, setUserCode] = useState("");
  const [isUserCodeLoading, setIsUserCodeLoading] = useState(false);

  const authFlow = () =>
    startGoogleFlow(
      Platform.OS === "web"
        ? {
            redirectUrl: AuthSession.makeRedirectUri({ path: "auth/callback" }),
          }
        : undefined,
    );

  const handleUserCodeSignIn = async () => {
    if (isUserCodeLoading) {
      return;
    }

    setIsUserCodeLoading(true);

    try {
      await signInWithUserCode(userCode);
      setUserCode("");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to sign in with that user code.";
      showToast(message);
    } finally {
      setIsUserCodeLoading(false);
    }
  };

  return (
    <SafeAreaListener
      onChange={({ insets }) => {
        Uniwind.updateInsets(insets);
      }}
    >
      <View className="flex-1 bg-background">
        <SafeAreaView className="flex-1">
          <View className="w-full h-full items-center justify-center">
            {isLoading ? (
              <PoppinsText color="white" weight="medium">Loading...</PoppinsText>
            ) : isAuthenticated ? (
              <MainPage />
            ) : (
              <Column className="w-[80vw] p-6 max-w-96 bg-text border-4 border-primary-accent items-center" gap={6}>
                <DialogHeader
                  text="Welcome to Paper"
                  subtext="Sign in with Google to convert handwritten notes to Markdown."
                  className="w-[80vw] max-w-96"
                />
                <Column gap={4} className="items-center w-full">
                  <AuthButton
                    authFlow={authFlow}
                    buttonText="Sign in with Google"
                  />
                  <AppButton
                    variant="outline-alt"
                    className="w-64 h-12"
                    onPress={() => setShowUserCodeInput((currentValue) => !currentValue)}
                  >
                    <PoppinsText color="white" weight="medium">Use User Code</PoppinsText>
                  </AppButton>
                  {showUserCodeInput ? (
                    <Column gap={3} className="w-full items-center pt-2">
                      <PoppinsTextInput
                        value={userCode}
                        onChangeText={setUserCode}
                        className="w-64 border-2 border-border bg-inner-background px-4 py-3 text-black"
                        autoCapitalize="none"
                        autoCorrect={false}
                        placeholder="Enter your user code"
                      />
                      <AppButton
                        variant="green"
                        className="w-64 h-12"
                        onPress={handleUserCodeSignIn}
                        disabled={isUserCodeLoading || isLoading}
                      >
                        <PoppinsText color="white" weight="medium">
                          {isUserCodeLoading ? "Checking Code..." : "Continue with User Code"}
                        </PoppinsText>
                      </AppButton>
                    </Column>
                  ) : null}
                </Column>
              </Column>
            )}
          </View>
        </SafeAreaView>
      </View>
    </SafeAreaListener>
  );
}

// // ============================================================================
// // DEV NUKE COMPONENT - Uncomment entire section to enable
// // ============================================================================
// import { SafeAreaView } from "react-native-safe-area-context";
// import React from "react";

// import MainPage from "./components/MainPage";
// import DatabaseNukeButton from "./components/dev/DatabaseNukeButton";
// import { useNukeDatabase, useTableCounts } from "../hooks/useNukeDatabase";

// export default function DevNukeScreen() {


//   return (
//     <SafeAreaView className="flex-1 bg-slate-900 items-center justify-center">
//       <DatabaseNukeButton />


//     </SafeAreaView>
//   );
// }
