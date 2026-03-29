import React, { PropsWithChildren } from 'react';
import { View } from 'react-native';
import PoppinsText from './ui/text/PoppinsText';
import { useUserVariable } from 'hooks/useUserVariable';
import { useSyncUserData } from 'hooks/useSyncUserData';
import { UserData } from 'types/mathDocuments';
import TopSiteBar from './layout/TopSiteBar';
import DocumentHomePage from './document/DocumentHomePage';
import DocumentEditorPage from './document/DocumentEditorPage';
import LayoutStateAnimatedView from './ui/LayoutStateAnimatedView';

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
            <TopSiteBar isInDocument={isInDocument} onHomePress={() => setActiveDocumentId("")} documentId={activeDocumentId.value} userId={userId} />
            {isActiveDocumentLoading ? (
                <View className='flex-1 items-center justify-center'>
                    <PoppinsText>Loading...</PoppinsText>
                </View>
            ) : (
                <LayoutStateAnimatedView.Container stateVar={currentScreen} className='flex-1'>
                    <LayoutStateAnimatedView.Option page={1} stateValue='documents'>

                        <View className='h-full w-full items-center justify-center'>
                            <View className='w-full h-full'>
                                <DocumentHomePage
                                    userId={userId}
                                    setActiveDocumentId={setActiveDocumentId}
                                />
                            </View>
                        </View>
                    </LayoutStateAnimatedView.Option>

                    <LayoutStateAnimatedView.OptionContainer page={2}>
                        <LayoutStateAnimatedView.Option stateValue='document'>
                            {activeDocumentId.value ? (
                                <View className='w-full h-full'>
                                    <DocumentEditorPage
                                        documentId={activeDocumentId.value}
                                        userId={userId}
                                    />
                                </View>
                            ) : null}
                        </LayoutStateAnimatedView.Option>
                    </LayoutStateAnimatedView.OptionContainer>
                </LayoutStateAnimatedView.Container>
            )}
        </View>
    );
};

export default MainPage;
