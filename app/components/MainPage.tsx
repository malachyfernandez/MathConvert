import React, { PropsWithChildren } from 'react';
import { View } from 'react-native';
import PoppinsText from './ui/text/PoppinsText';
import { useUserVariable } from 'hooks/useUserVariable';
import { useSyncUserData } from 'hooks/useSyncUserData';
import { UserData } from 'types/mathDocuments';
import TopSiteBar from './layout/TopSiteBar';
import DocumentHomePage from './document/DocumentHomePage';
import DocumentEditorPage from './document/DocumentEditorPage';
import StateAnimatedView from './ui/StateAnimatedView';

type ScreenState = 'documents' | 'document';

interface MainPageProps extends PropsWithChildren {
    className?: string;
}

const MainPage: React.FC<MainPageProps> = () => {
    const [userData, setUserData] = useUserVariable<UserData>({
        key: "userData",
        defaultValue: {},
        privacy: "PUBLIC",
        searchKeys: ["name"],
    });

    useSyncUserData(userData.value, setUserData);

    const userId = userData.value.userId || "";

    const [activeDocumentId, setActiveDocumentId] = useUserVariable<string>({
        key: "activeDocumentId",
        defaultValue: "",
    });

    const isInDocument = activeDocumentId.value !== "";
    const currentScreen: ScreenState = isInDocument ? 'document' : 'documents';

    const isActiveDocumentLoading = activeDocumentId.state.isSyncing === true;

    return (
        <View className='w-screen h-screen p-safe'>
            <TopSiteBar isInDocument={isInDocument} onHomePress={() => setActiveDocumentId("")} documentId={activeDocumentId.value} />
            {isActiveDocumentLoading ? (
                <PoppinsText>Loading</PoppinsText>
            ) : (
                <StateAnimatedView.Container stateVar={currentScreen} className='flex-1'>
                    <StateAnimatedView.Option page={1} stateValue='documents'>
                        <View className='h-full w-full items-center justify-center'>
                            <View className='w-full h-full'>
                                <DocumentHomePage
                                    userId={userId}
                                    setActiveDocumentId={setActiveDocumentId}
                                />
                            </View>
                        </View>
                    </StateAnimatedView.Option>

                    <StateAnimatedView.OptionContainer page={2}>
                        <StateAnimatedView.Option stateValue='document'>
                            {activeDocumentId.value ? (
                                <View className='w-full h-full'>
                                    <DocumentEditorPage
                                        documentId={activeDocumentId.value}
                                        userId={userId}
                                    />
                                </View>
                            ) : null}
                        </StateAnimatedView.Option>
                    </StateAnimatedView.OptionContainer>
                </StateAnimatedView.Container>
            )}
        </View>
    );
};

export default MainPage;
