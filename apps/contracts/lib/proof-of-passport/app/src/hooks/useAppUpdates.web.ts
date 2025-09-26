// SPDX-FileCopyrightText: 2025 Social Connect Labs, Inc.
// SPDX-License-Identifier: BUSL-1.1
// NOTE: Converts to Apache-2.0 on 2029-06-11 per LICENSE.

import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';

import { useSelfClient } from '@selfxyz/mobile-sdk-alpha';
import { AppEvents } from '@selfxyz/mobile-sdk-alpha/constants/analytics';

import { registerModalCallbacks } from '@/utils/modalCallbackRegistry';

export const useAppUpdates = (): [boolean, () => void, boolean] => {
  const navigation = useNavigation();
  const [isModalDismissed, setIsModalDismissed] = useState(false);
  const { trackEvent } = useSelfClient();
  const showAppUpdateModal = () => {
    const callbackId = registerModalCallbacks({
      onButtonPress: async () => {
        window.location.reload();
        trackEvent(AppEvents.UPDATE_STARTED);
      },
      onModalDismiss: () => {
        setIsModalDismissed(true);
        trackEvent(AppEvents.UPDATE_MODAL_CLOSED);
      },
    });

    navigation.navigate('Modal', {
      titleText: 'New Version Available',
      bodyText:
        "We've improved performance, fixed bugs, and added new features. Update now to install the latest version of Self.",
      buttonText: 'Update and restart',
      callbackId,
    });
    trackEvent(AppEvents.UPDATE_MODAL_OPENED);
  };

  const newVersionAvailable = false;

  return [newVersionAvailable, showAppUpdateModal, isModalDismissed];
};
