// SPDX-FileCopyrightText: 2025 Social Connect Labs, Inc.
// SPDX-License-Identifier: BUSL-1.1
// NOTE: Converts to Apache-2.0 on 2029-06-11 per LICENSE.

import LottieView from 'lottie-react-native';
import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { YStack } from 'tamagui';
import { useNavigation } from '@react-navigation/native';

import { AppEvents } from '@selfxyz/mobile-sdk-alpha/constants/analytics';

import warningAnimation from '@/assets/animations/warning.json';
import { PrimaryButton } from '@/components/buttons/PrimaryButton';
import Caution from '@/components/typography/Caution';
import { SubHeader } from '@/components/typography/SubHeader';
import { ExpandableBottomLayout } from '@/layouts/ExpandableBottomLayout';
import { useSettingStore } from '@/stores/settingStore';
import { black, white } from '@/utils/colors';
import { confirmTap, notificationWarning } from '@/utils/haptic';

const DisclaimerScreen: React.FC = () => {
  const navigation = useNavigation();
  const { dismissPrivacyNote } = useSettingStore();

  useEffect(() => {
    notificationWarning();
  }, []);

  return (
    <ExpandableBottomLayout.Layout backgroundColor={black}>
      <ExpandableBottomLayout.TopSection backgroundColor={black}>
        <LottieView
          autoPlay
          loop={false}
          source={warningAnimation}
          style={styles.animation}
          cacheComposition={true}
          renderMode="HARDWARE"
        />
        <YStack flex={1} justifyContent="flex-end" paddingBottom="$4">
          <SubHeader style={{ color: white }}>Caution</SubHeader>
        </YStack>
      </ExpandableBottomLayout.TopSection>
      <ExpandableBottomLayout.BottomSection backgroundColor={white}>
        <YStack gap="$2.5">
          <Caution>
            Apps that request sensitive or personally identifiable information
            (like passwords, Social Security numbers, or financial details)
            should be trusted only if they're secure and necessary.
          </Caution>
          <Caution style={{ marginTop: 10 }}>
            Always verify an app's legitimacy before sharing your data.
          </Caution>
          <PrimaryButton
            trackEvent={AppEvents.DISMISS_PRIVACY_DISCLAIMER}
            style={{ marginVertical: 30 }}
            onPress={() => {
              confirmTap();
              dismissPrivacyNote();
              navigation.navigate('Home');
            }}
          >
            Dismiss
          </PrimaryButton>
        </YStack>
      </ExpandableBottomLayout.BottomSection>
    </ExpandableBottomLayout.Layout>
  );
};

export default DisclaimerScreen;

const styles = StyleSheet.create({
  animation: {
    position: 'absolute',
    width: '125%',
    height: '125%',
  },
});
